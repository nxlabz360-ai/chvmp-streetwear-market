import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "./catalog";

export type CartLine = {
  key: string; productId: string; slug: string; name: string; price: number; image: string;
  color: string; size: string; qty: number;
};
type Ctx = {
  lines: CartLine[]; open: boolean; setOpen: (o: boolean) => void;
  add: (p: Product, color: string, size: string) => void;
  setQty: (key: string, qty: number) => void; clear: () => void;
  count: number; total: number;
};
const CartCtx = createContext<Ctx | null>(null);
const KEY = "cb-cart-v2";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { setLines(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(lines)); }, [lines, ready]);
  const add = (p: Product, color: string, size: string) => {
    const key = `${p.id}|${color}|${size}`;
    setLines((ls) => ls.some((l) => l.key === key)
      ? ls.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l))
      : [...ls, { key, productId: p.id, slug: p.slug, name: p.name, price: p.price, image: p.photoUrls[0] ?? "", color, size, qty: 1 }]);
    setOpen(true);
  };
  const setQty = (key: string, qty: number) =>
    setLines((ls) => (qty <= 0 ? ls.filter((l) => l.key !== key) : ls.map((l) => (l.key === key ? { ...l, qty } : l))));
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
  return <CartCtx.Provider value={{ lines, open, setOpen, add, setQty, clear: () => setLines([]), count, total }}>{children}</CartCtx.Provider>;
}
export const useCart = () => { const c = useContext(CartCtx); if (!c) throw new Error("no cart"); return c; };
