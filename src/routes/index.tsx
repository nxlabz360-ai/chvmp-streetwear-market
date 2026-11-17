import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, MessageCircle, Banknote, RefreshCw } from "lucide-react";
import { PhotoSlideshow } from "@/components/PhotoSlideshow";
import { useSuspenseQuery } from "@tanstack/react-query";
import { productsQuery } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Asterisk } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CHVMPBUZZ — Streetwear from Cairo" },
      { name: "description", content: "Vague Vibes Everyday. Hoodies, tees, jeans and caps for men and women. Cash on delivery in Cairo and Giza." },
      { property: "og:title", content: "CHVMPBUZZ — Streetwear from Cairo" },
      { property: "og:description", content: "Vague Vibes Everyday. Believe. Build. Become." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(productsQuery);
  const best = data.slice(0, 4);
  return (
    <>
      <PhotoSlideshow />

      <section className="grid grid-cols-2 gap-px bg-foreground">
        {(["men", "women"] as const).map((g) => (
          <Link key={g} to="/shop" search={{ g }} className="group flex aspect-[4/3] items-end bg-foreground p-5 text-background md:aspect-[16/7]">
            <span className="font-display text-4xl font-black uppercase tracking-tighter md:text-7xl">{g}<span className="hidden text-brand opacity-0 md:inline transition-opacity group-hover:opacity-100"> →</span></span>
          </Link>
        ))}
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-20 md:grid-cols-2 md:items-center">
        <h2 className="font-display text-6xl font-black uppercase leading-[0.85] tracking-tighter md:text-8xl">Believe.<br />Build.<br />Become.</h2>
        <div>
          <Asterisk className="h-10 w-10 text-brand" />
          <p className="mt-4 max-w-md text-lg leading-relaxed">
            CHVMPBUZZ is a fashion brand built on vision and ambition. More than fashion, it's an expression of identity and individuality — inspired by creativity, driven by purpose, and built to become.
          </p>
        </div>
      </section>

      <section className="border-y border-border">
        <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
          {[[Truck, "Fast delivery"], [MessageCircle, "Order on WhatsApp"], [Banknote, "Cash on delivery"], [RefreshCw, "Easy exchange"]].map(([Icon, t]: any) => (
            <div key={t} className="flex items-center gap-3 border-border p-5 odd:border-r md:border-r">
              <Icon className="h-5 w-5 shrink-0" /><span className="text-xs font-bold uppercase">{t}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-4xl font-black uppercase tracking-tighter md:text-6xl">Best sellers</h2>
          <Link to="/shop" search={{ g: "all" }} className="text-xs font-bold uppercase underline hover:text-brand">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4">{best.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        {best.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">New drops coming soon.</p>}
      </section>
    </>
  );
}
