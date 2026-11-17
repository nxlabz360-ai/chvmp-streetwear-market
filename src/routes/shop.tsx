import { createFileRoute, Link } from "@tanstack/react-router";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

const G = ["all", "men", "women", "new"] as const;
type Gf = (typeof G)[number];

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): { g: Gf } => ({ g: G.includes(s["g"] as Gf) ? (s["g"] as Gf) : "all" }),
  head: () => ({
    meta: [
      { title: "Shop — CHVMPBUZZ" },
      { name: "description", content: "Shop CHVMPBUZZ hoodies, tees, jeans and caps for men and women." },
      { property: "og:title", content: "Shop — CHVMPBUZZ" },
      { property: "og:description", content: "Streetwear from Cairo for men and women." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { g } = Route.useSearch();
  const list = products.filter((p) => g === "all" || (g === "new" ? p.isNew : p.gender.includes(g)));
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-5xl font-black uppercase tracking-tighter md:text-7xl">{g === "all" ? "Shop" : g === "new" ? "New in" : g}</h1>
      <div className="mt-6 flex gap-2">
        {G.map((x) => (
          <Link key={x} to="/shop" search={{ g: x }} className={`border px-4 py-2 text-xs font-bold uppercase ${g === x ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}>
            {x === "new" ? "New in" : x}
          </Link>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
    </section>
  );
}
