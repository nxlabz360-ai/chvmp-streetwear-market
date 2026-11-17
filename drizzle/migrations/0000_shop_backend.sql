
create type public.app_role as enum ('admin');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.assign_owner_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) = 'nxlabz360@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_owner_admin after insert on auth.users
for each row execute function public.assign_owner_admin();
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where lower(email) = 'nxlabz360@gmail.com' on conflict do nothing;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  price integer not null default 0 check (price >= 0),
  sections text[] not null default '{}',
  category text not null default '',
  photos text[] not null default '{}',
  colors jsonb not null default '[]'::jsonb,
  sizes text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  is_pinned boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public reads active" on public.products for select to anon, authenticated using (is_active);
create policy "admin reads all" on public.products for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin inserts" on public.products for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "admin updates" on public.products for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "admin deletes" on public.products for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  phone text not null,
  city text not null,
  address text not null,
  payment_method text not null,
  notes text not null default '',
  total integer not null,
  status text not null default 'New' check (status in ('New','Confirmed','Shipped','Delivered','Cancelled')),
  created_at timestamptz not null default now()
);
grant select, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "admin reads orders" on public.orders for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin updates orders" on public.orders for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_slug text not null default '',
  product_name text not null,
  photo text not null default '',
  color text not null default '',
  size text not null default '',
  quantity integer not null check (quantity > 0),
  price integer not null
);
grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "admin reads items" on public.order_items for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public.place_order(payload jsonb)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_code text; v_order uuid; v_total integer := 0; it jsonb; p public.products; q integer;
begin
  if coalesce(trim(payload->>'name'),'') = '' or coalesce(trim(payload->>'phone'),'') = ''
     or coalesce(trim(payload->>'address'),'') = '' then
    raise exception 'Missing customer details';
  end if;
  if payload->>'payment' not in ('Cash on delivery','InstaPay','Vodafone Cash') then raise exception 'Invalid payment'; end if;
  if jsonb_array_length(coalesce(payload->'items','[]'::jsonb)) = 0 then raise exception 'Cart is empty'; end if;
  loop
    v_code := 'CB-' || lpad((floor(random()*1000000))::int::text, 6, '0');
    exit when not exists (select 1 from orders where order_number = v_code);
  end loop;
  insert into orders (order_number, customer_name, phone, city, address, payment_method, notes, total)
  values (v_code, left(payload->>'name',120), left(payload->>'phone',30), left(coalesce(payload->>'city',''),60),
          left(payload->>'address',500), payload->>'payment', left(coalesce(payload->>'notes',''),1000), 0)
  returning id into v_order;
  for it in select * from jsonb_array_elements(payload->'items') loop
    q := greatest(1, least(50, coalesce((it->>'qty')::int, 1)));
    select * into p from products where id = (it->>'product_id')::uuid and is_active;
    if not found then raise exception 'A product in your cart is no longer available'; end if;
    insert into order_items (order_id, product_id, product_slug, product_name, photo, color, size, quantity, price)
    values (v_order, p.id, p.slug, p.name, coalesce(p.photos[1],''), left(coalesce(it->>'color',''),60), left(coalesce(it->>'size',''),30), q, p.price);
    update products set stock = greatest(0, stock - q) where id = p.id;
    v_total := v_total + p.price * q;
  end loop;
  update orders set total = v_total where id = v_order;
  return v_code;
end $$;
revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;

create policy "anyone views product photos" on storage.objects for select to anon, authenticated using (bucket_id = 'product-photos');
create policy "admin uploads product photos" on storage.objects for insert to authenticated with check (bucket_id = 'product-photos' and public.has_role(auth.uid(), 'admin'));
create policy "admin updates product photos" on storage.objects for update to authenticated using (bucket_id = 'product-photos' and public.has_role(auth.uid(), 'admin'));
create policy "admin deletes product photos" on storage.objects for delete to authenticated using (bucket_id = 'product-photos' and public.has_role(auth.uid(), 'admin'));

insert into public.products (slug, name, description, price, sections, category, photos, colors, sizes, stock, sort_order) values
('vague-hoodie','Vague Oversized Hoodie','Heavyweight oversized hoodie. Vague Vibes Everyday.',1450,'{Men,Women,"New in"}','Hoodies','{seed/hoodie.jpg}','[{"name":"Black","hex":"#000000"},{"name":"Grey","hex":"#E6E5E2"}]','{S,M,L,XL}',20,1),
('become-tee','Become Boxy Tee','Boxy fit cotton tee.',650,'{Men,Women}','Tees','{seed/tee.jpg}','[{"name":"Black","hex":"#000000"},{"name":"White","hex":"#FFFFFF"}]','{S,M,L,XL}',30,2),
('build-jeans','Build Baggy Jeans','Washed black baggy denim.',1250,'{Men,"New in"}','Jeans','{seed/jeans.jpg}','[{"name":"Washed black","hex":"#2a2a2a"}]','{30,32,34,36}',15,3),
('asterisk-cap','Asterisk Cap','Embroidered asterisk cap.',450,'{Men,Women}','Caps','{seed/cap.jpg}','[{"name":"Black","hex":"#000000"},{"name":"Grey","hex":"#E6E5E2"}]','{"One size"}',25,4),
('believe-hoodie-w','Believe Cropped Hoodie','Cropped hoodie for women.',1350,'{Women,"New in"}','Hoodies','{seed/hoodie.jpg}','[{"name":"Black","hex":"#000000"},{"name":"Grey","hex":"#E6E5E2"}]','{XS,S,M,L}',15,5),
('everyday-tee-w','Everyday Baby Tee','Fitted baby tee.',550,'{Women}','Tees','{seed/tee.jpg}','[{"name":"Black","hex":"#000000"},{"name":"White","hex":"#FFFFFF"}]','{XS,S,M,L}',20,6),
('wide-jeans-w','Wide Leg Jeans','Washed black wide leg denim.',1200,'{Women}','Jeans','{seed/jeans.jpg}','[{"name":"Washed black","hex":"#2a2a2a"}]','{26,28,30,32}',15,7),
('buzz-tee','Buzz Logo Tee','Logo tee in heavy cotton.',700,'{Men,"New in"}','Tees','{seed/tee.jpg}','[{"name":"Black","hex":"#000000"},{"name":"White","hex":"#FFFFFF"}]','{S,M,L,XL}',30,8);
