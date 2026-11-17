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
    select * into p from products where id = (it->>'product_id')::uuid and is_active for update;
    if not found then raise exception 'A product in your cart is no longer available'; end if;
    if p.stock < q then raise exception 'Only % left of %', p.stock, p.name; end if;
    insert into order_items (order_id, product_id, product_slug, product_name, photo, color, size, quantity, price)
    values (v_order, p.id, p.slug, p.name, coalesce(p.photos[1],''), left(coalesce(it->>'color',''),60), left(coalesce(it->>'size',''),30), q, p.price);
    update products set stock = stock - q where id = p.id;
    v_total := v_total + p.price * q;
  end loop;
  update orders set total = v_total where id = v_order;
  return v_code;
end $$;