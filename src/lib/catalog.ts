import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type Color = { name: string; hex: string };
export type Product = {
  id: string; slug: string; name: string; description: string; price: number;
  sections: string[]; category: string; photos: string[]; photoUrls: string[];
  colors: Color[]; sizes: string[]; stock: number; is_pinned: boolean; sort_order: number;
};
export const SECTIONS = ["Men", "Women", "New in"] as const;
export const egp = (n: number) => `EGP ${n.toLocaleString("en-US")}`;
export const WHATSAPP = "201553829354";
export const BUCKET = "product-photos";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

type Row = Database["public"]["Tables"]["products"]["Row"];
async function withUrls(sb: ReturnType<typeof publicClient>, rows: Row[]): Promise<Product[]> {
  const paths = [...new Set(rows.flatMap((r) => r.photos))];
  const map = new Map<string, string>();
  if (paths.length) {
    const { data } = await sb.storage.from(BUCKET).createSignedUrls(paths, 60 * 60 * 24 * 365);
    const base = (process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"]!).replace(/\/$/, "");
    for (const d of data ?? []) {
      if (d.path && d.signedUrl) {
        const i = d.signedUrl.indexOf("/storage/v1");
        map.set(d.path, i >= 0 ? base + d.signedUrl.slice(i) : d.signedUrl);
      }
    }
  }
  return rows.map((r) => ({
    id: r.id, slug: r.slug, name: r.name, description: r.description, price: r.price,
    sections: r.sections, category: r.category, photos: r.photos,
    photoUrls: r.photos.map((p) => map.get(p) ?? "").filter(Boolean),
    colors: (Array.isArray(r.colors) ? r.colors : []) as Color[], sizes: r.sizes,
    stock: r.stock, is_pinned: r.is_pinned, sort_order: r.sort_order,
  }));
}

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("products").select("*").eq("is_active", true)
    .order("is_pinned", { ascending: false }).order("sort_order").order("created_at");
  if (error) throw new Error(error.message);
  return withUrls(sb, data ?? []);
});

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const sb = publicClient();
    const { data, error } = await sb.from("products").select("*").eq("is_active", true).eq("slug", slug).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return (await withUrls(sb, [data]))[0]!;
  });

export const productsQuery = queryOptions({ queryKey: ["products"], queryFn: () => listProducts() });
export const productQuery = (slug: string) => queryOptions({ queryKey: ["product", slug], queryFn: () => getProduct({ data: slug }) });
