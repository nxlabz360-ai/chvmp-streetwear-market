import { Link } from "@tanstack/react-router";
import { type Product, egp } from "@/lib/catalog";

export function ProductCard({ p }: { p: Product }) {
  return (
    <Link to="/product/$slug" params={{ slug: p.slug }} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {p.photoUrls[0] && <img src={p.photoUrls[0]} alt={p.name} loading="lazy" width={768} height={960} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
        {p.sections.includes("New in") && <span className="absolute left-2 top-2 bg-foreground px-2 py-0.5 text-[10px] font-bold uppercase text-background">New</span>}
        {p.stock <= 0 && <span className="absolute right-2 top-2 bg-brand px-2 py-0.5 text-[10px] font-bold uppercase text-brand-foreground">Sold out</span>}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="min-w-0 text-sm font-bold uppercase leading-tight">{p.name}</h3>
        <span className="shrink-0 text-sm">{egp(p.price)}</span>
      </div>
      <div className="mt-2 flex gap-1.5">
        {p.colors.map((c) => <span key={c.name} title={c.name} className="h-3 w-3 border border-foreground/30" style={{ backgroundColor: c.hex }} />)}
      </div>
    </Link>
  );
}
