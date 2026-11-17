import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { productQuery, egp } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const p = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData: p }) => ({
    meta: p ? [
      { title: `${p.name} — CHVMPBUZZ` },
      { name: "description", content: `${p.name} · ${egp(p.price)}. ${p.description}` },
      { property: "og:title", content: `${p.name} — CHVMPBUZZ` },
      { property: "og:description", content: `${egp(p.price)} · ${p.description}` },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(p.photoUrls[0] ? [{ property: "og:image", content: p.photoUrls[0] }, { name: "twitter:image", content: p.photoUrls[0] }] : []),
    ] : [{ title: "Product unavailable — CHVMPBUZZ" }, { name: "robots", content: "noindex" }],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <section className="px-4 py-20 text-center">
      <h1 className="font-display text-4xl font-black uppercase">Product not found</h1>
      <Link to="/shop" search={{ g: "all" }} className="mt-6 inline-block underline">Back to shop</Link>
    </section>
  ),
  errorComponent: ({ error }) => <p className="px-4 py-20 text-center">{error.message}</p>,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(productQuery(slug));
  const { add } = useCart();
  const [img, setImg] = useState(0);
  const [color, setColor] = useState(p?.colors[0]?.name ?? "");
  const [size, setSize] = useState(p?.sizes[0] ?? "");
  if (!p) return null;
  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-2 md:py-12">
      <div>
        <div className="aspect-[4/5] overflow-hidden bg-muted">{p.photoUrls[img] && <img src={p.photoUrls[img]} alt={p.name} className="h-full w-full object-cover" />}</div>
        {p.photoUrls.length > 1 && <div className="mt-2 flex gap-2">{p.photoUrls.map((u, i) => (
          <button key={u} onClick={() => setImg(i)} className={`h-16 w-14 overflow-hidden border ${i === img ? "border-foreground" : "border-border"}`}><img src={u} alt="" className="h-full w-full object-cover" /></button>
        ))}</div>}
      </div>
      <div>
        <h1 className="font-display text-4xl font-black uppercase tracking-tighter">{p.name}</h1>
        <p className="mt-2 text-lg">{egp(p.price)}</p>
        {p.description && <p className="mt-4 text-sm text-muted-foreground">{p.description}</p>}
        <p className="mt-6 text-xs font-bold uppercase">Color: {color}</p>
        <div className="mt-2 flex gap-2">{p.colors.map((c) => (
          <button key={c.name} aria-label={c.name} onClick={() => setColor(c.name)} className={`h-7 w-7 border ${color === c.name ? "outline outline-2 outline-offset-2 outline-brand" : "border-foreground/30"}`} style={{ backgroundColor: c.hex }} />
        ))}</div>
        <p className="mt-6 text-xs font-bold uppercase">Size</p>
        <div className="mt-2 flex flex-wrap gap-2">{p.sizes.map((s) => (
          <button key={s} onClick={() => setSize(s)} className={`min-w-10 border px-3 py-2 text-sm font-semibold ${size === s ? "border-foreground bg-foreground text-background" : "border-border"}`}>{s}</button>
        ))}</div>
        <button disabled={p.stock <= 0} onClick={() => add(p, color, size)} className="mt-8 w-full bg-foreground py-4 text-sm font-bold uppercase text-background hover:bg-brand disabled:opacity-40">
          {p.stock <= 0 ? "Sold out" : "Add to cart"}
        </button>
      </div>
    </section>
  );
}
