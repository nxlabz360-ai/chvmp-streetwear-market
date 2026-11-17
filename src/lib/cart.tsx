import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { products } from "./products";

export type CartLine = { key: string; id: string; color: string; size: string; qty: number };
type Ctx = {
  lines: CartLine[]; open: boolean; setOpen: (o: boolean) => void;
  add: (id: string, color: string, size: string) => void;
  setQty: (key: string, qty: number) => void; clear: () => void;
  count: number; total: number;
};
const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => { try { setLines(JSON.parse(localStorage.getItem("cb-cart") || "[]")); } catch {} }, []);
  useEffect(() => { localStorage.setItem("cb-cart", JSON.stringify(lines)); }, [lines]);
  const add = (id: string, color: string, size: string) => {
    const key = `${id}|${color}|${size}`;
    setLines((ls) => ls.some((l) => l.key === key)
      ? ls.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l))
      : [...ls, { key, id, color, size, qty: 1 }]);
    setOpen(true);
  };
  const setQty = (key: string, qty: number) =>
    setLines((ls) => (qty <= 0 ? ls.filter((l) => l.key !== key) : ls.map((l) => (l.key === key ? { ...l, qty } : l))));
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * (products.find((p) => p.id === l.id)?.price ?? 0), 0);
  return <CartCtx.Provider value={{ lines, open, setOpen, add, setQty, clear: () => setLines([]), count, total }}>{children}</CartCtx.Provider>;
}
export const useCart = () => { const c = useContext(CartCtx); if (!c) throw new Error("no cart"); return c; };
