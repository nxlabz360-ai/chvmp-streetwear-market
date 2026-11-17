import { Link } from "@tanstack/react-router";
import { Menu, Minus, Plus, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Logo, Asterisk } from "./Logo";
import { useCart } from "@/lib/cart";
import { products, egp } from "@/lib/products";

export function Header() {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const links = (
    <>
      <Link to="/shop" search={{ g: "men" }} className="hover:text-brand">Men</Link>
      <Link to="/shop" search={{ g: "women" }} className="hover:text-brand">Women</Link>
      <Link to="/shop" search={{ g: "new" }} className="hover:text-brand">New in</Link>
    </>
  );
  return (
    <>
      <div className="bg-foreground py-2 text-center text-[11px] font-semibold uppercase tracking-widest text-background">
        Cash on delivery across Cairo and Giza
      </div>
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto grid h-14 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4">
          <nav className="flex items-center gap-5 text-xs font-bold uppercase">
            <button className="md:hidden" aria-label="Menu" onClick={() => setMenu(!menu)}><Menu className="h-5 w-5" /></button>
            <div className="hidden gap-5 md:flex">{links}</div>
          </nav>
          <Link to="/" aria-label="CHVMPBUZZ home"><Logo /></Link>
          <div className="flex items-center justify-end gap-4">
            <Link to="/shop" search={{ g: "all" }} aria-label="Search" className="hover:text-brand"><Search className="h-5 w-5" /></Link>
            <button aria-label="Cart" onClick={() => setOpen(true)} className="relative hover:text-brand">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center bg-brand px-1 text-[10px] font-bold text-brand-foreground">{count}</span>}
            </button>
          </div>
        </div>
        {menu && <div onClick={() => setMenu(false)} className="flex flex-col gap-4 border-t border-border px-4 py-4 text-sm font-bold uppercase md:hidden">{links}</div>}
      </header>
    </>
  );
}

export function CartDrawer() {
  const { open, setOpen, lines, setQty, total } = useCart();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/50" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-background">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-xl font-black uppercase">Cart</h2>
          <button aria-label="Close" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {lines.length === 0 && <p className="text-sm text-muted-foreground">Your cart is empty.</p>}
          {lines.map((l) => {
            const p = products.find((x) => x.id === l.id)!;
            return (
              <div key={l.key} className="mb-4 flex gap-3">
                <img src={p.image} alt={p.name} className="h-24 w-20 shrink-0 bg-muted object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold uppercase">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{l.color} / {l.size}</p>
                  <p className="mt-1 text-sm">{egp(p.price * l.qty)}</p>
                  <div className="mt-2 inline-flex items-center border border-border">
                    <button aria-label="Decrease" className="p-1.5" onClick={() => setQty(l.key, l.qty - 1)}><Minus className="h-3 w-3" /></button>
                    <span className="w-6 text-center text-sm">{l.qty}</span>
                    <button aria-label="Increase" className="p-1.5" onClick={() => setQty(l.key, l.qty + 1)}><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="border-t border-border p-4">
          <div className="mb-3 flex justify-between font-bold"><span>Total</span><span>{egp(total)}</span></div>
          {lines.length > 0 && (
            <Link to="/checkout" onClick={() => setOpen(false)} className="block bg-foreground py-3 text-center text-sm font-bold uppercase text-background hover:bg-brand">Checkout</Link>
          )}
        </div>
      </aside>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-foreground px-4 py-12 text-background">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        <div>
          <Logo className="text-2xl" />
          <p className="mt-3 text-sm text-background/70">Vague Vibes Everyday. More than fashion.</p>
          <p className="mt-1 text-xs text-background/50">Cairo, Egypt · Est. 2024</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-xs font-bold uppercase text-background/50">Contact</p>
          <a className="block hover:text-brand" href="https://wa.me/201553829354">WhatsApp +20 155 382 9354</a>
          <a className="block hover:text-brand" href="mailto:chvmpyymacavelly@gmail.com">chvmpyymacavelly@gmail.com</a>
          <a className="block hover:text-brand" href="https://www.snapchat.com/add/chvmpbuzz">Snapchat chvmpbuzz</a>
        </div>
        <div className="flex items-end md:justify-end"><Asterisk className="h-10 w-10 text-brand" /></div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs text-background/40">© 2026 CHVMPBUZZ</p>
    </footer>
  );
}
