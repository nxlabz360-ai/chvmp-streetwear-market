import { useState } from "react";
import { type Product, egp } from "@/lib/products";
import { useCart } from "@/lib/cart";

export function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const [color, setColor] = useState(p.colors[0]!.name);
  const [size, setSize] = useState<string>(p.sizes[p.sizes.length > 1 ? 1 : 0]!);
  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img src={p.image} alt={p.name} loading="lazy" width={768} height={960} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {p.isNew && <span className="absolute left-2 top-2 bg-foreground px-2 py-0.5 text-[10px] font-bold uppercase text-background">New</span>}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="min-w-0 text-sm font-bold uppercase leading-tight">{p.name}</h3>
        <span className="shrink-0 text-sm">{egp(p.price)}</span>
      </div>
      <div className="mt-2 flex gap-1.5">
        {p.colors.map((c) => (
          <button key={c.name} aria-label={c.name} onClick={() => setColor(c.name)}
            className={`h-4 w-4 border ${color === c.name ? "outline outline-2 outline-offset-2 outline-brand" : "border-foreground/30"}`}
            style={{ backgroundColor: c.hex }} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {p.sizes.map((s) => (
          <button key={s} onClick={() => setSize(s)}
            className={`min-w-8 border px-1.5 py-1 text-[11px] font-semibold ${size === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}>{s}</button>
        ))}
      </div>
      <button onClick={() => add(p.id, color, size)} className="mt-3 w-full bg-foreground py-2.5 text-xs font-bold uppercase tracking-wider text-background transition-colors hover:bg-brand">
        Add to cart
      </button>
    </div>
  );
}
