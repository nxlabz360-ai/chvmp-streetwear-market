import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { egp } from "@/lib/catalog";
import { signPaths } from "./signed";

type Order = Database["public"]["Tables"]["orders"]["Row"] & { order_items: Database["public"]["Tables"]["order_items"]["Row"][] };
const STATUSES = ["New", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const waNumber = (phone: string) => {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "20" + d.slice(1);
  return d;
};

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      const list = (data ?? []) as Order[];
      setOrders(list);
      setUrls(await signPaths(list.flatMap((o) => o.order_items.map((i) => i.photo))));
      setLoading(false);
    })();
  }, []);

  const setStatus = async (id: string, status: string) => {
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o)));
    await supabase.from("orders").update({ status }).eq("id", id);
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading orders…</p>;
  if (!orders.length) return <p className="py-10 text-center text-sm text-muted-foreground">No orders yet.</p>;

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <article key={o.id} className="border border-border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg font-black">{o.order_number}</p>
              <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-GB")}</p>
            </div>
            <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} aria-label="Order status"
              className={`border px-3 py-2 text-xs font-bold uppercase outline-none ${o.status === "New" ? "border-brand text-brand" : "border-border"}`}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <ul className="mt-3 space-y-2">
            {o.order_items.map((i) => (
              <li key={i.id} className="flex gap-3">
                <div className="h-16 w-14 shrink-0 bg-muted">{urls[i.photo] && <img src={urls[i.photo]} alt="" className="h-full w-full object-cover" />}</div>
                <div className="text-sm">
                  <p className="font-bold uppercase">{i.product_name}</p>
                  <p className="text-xs text-muted-foreground">{i.color} / {i.size} · x{i.quantity}</p>
                  <p className="text-xs">{egp(i.price * i.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 grid gap-1 border-t border-border pt-3 text-sm">
            <p><b>{o.customer_name}</b> · {o.phone}</p>
            <p className="text-muted-foreground">{o.city} — {o.address}</p>
            <p className="text-xs">Payment: {o.payment_method}</p>
            {o.notes && <p className="text-xs">Notes: {o.notes}</p>}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="font-bold">Total {egp(o.total)}</p>
            <a target="_blank" rel="noreferrer" href={`https://wa.me/${waNumber(o.phone)}?text=${encodeURIComponent(`Hi ${o.customer_name}, this is CHVMPBUZZ about your order ${o.order_number}.`)}`}
              className="inline-flex items-center gap-2 bg-foreground px-4 py-2 text-xs font-bold uppercase text-background hover:bg-brand"><MessageCircle className="h-4 w-4" /> Chat on WhatsApp</a>
          </div>
        </article>
      ))}
    </div>
  );
}
