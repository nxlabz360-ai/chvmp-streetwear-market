import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { egp, WHATSAPP } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { Asterisk } from "@/components/Logo";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — CHVMPBUZZ" },
      { name: "description", content: "Complete your CHVMPBUZZ order. Cash on delivery, InstaPay or Vodafone Cash." },
      { property: "og:title", content: "Checkout — CHVMPBUZZ" },
      { property: "og:description", content: "Complete your CHVMPBUZZ order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checkout,
});

const PAY = ["Cash on delivery", "InstaPay", "Vodafone Cash"];
const input = "w-full border border-input bg-background px-3 py-3 text-sm outline-none focus:border-foreground";

function Checkout() {
  const { lines, total, clear } = useCart();
  const [f, setF] = useState({ name: "", phone: "", city: "Cairo", address: "", pay: PAY[0] });
  const [done, setDone] = useState<{ no: string; url: string } | null>(null);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const { data: no, error } = await supabase.rpc("place_order", { payload: {
      name: f.name, phone: f.phone, city: f.city, address: f.address, payment: f.pay,
      items: lines.map((l) => ({ product_id: l.productId, color: l.color, size: l.size, qty: l.qty })),
    } });
    setBusy(false);
    if (error || !no) { setErr(error?.message ?? "Could not place order"); return; }
    const origin = window.location.origin;
    const items = lines.map((l) => `• ${l.name} (${l.color}, ${l.size}) x${l.qty} — ${egp(l.price * l.qty)}\n  ${origin}/product/${l.slug}`).join("\n");
    const msg = `New order ${no}

${items}

Total: ${egp(total)}

Name: ${f.name}
Phone: ${f.phone}
City: ${f.city}
Address: ${f.address}
Payment: ${f.pay}`;
    setDone({ no, url: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}` });
    clear();
  };

  if (done) return (
    <section className="mx-auto max-w-md px-4 py-20 text-center">
      <Asterisk className="mx-auto h-12 w-12 text-brand" />
      <h1 className="mt-6 font-display text-4xl font-black uppercase tracking-tighter">Order placed</h1>
      <p className="mt-2 text-sm text-muted-foreground">Your order number</p>
      <p className="mt-1 text-2xl font-black">{done.no}</p>
      <a href={done.url} target="_blank" rel="noreferrer" className="mt-8 block bg-foreground py-4 text-sm font-bold uppercase text-background hover:bg-brand">Continue on WhatsApp</a>
    </section>
  );

  if (!lines.length) return (
    <section className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-4xl font-black uppercase">Cart is empty</h1>
      <Link to="/shop" search={{ g: "all" }} className="mt-6 inline-block bg-foreground px-6 py-3 text-xs font-bold uppercase text-background hover:bg-brand">Shop now</Link>
    </section>
  );

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <section className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-display text-5xl font-black uppercase tracking-tighter">Checkout</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <input required placeholder="Full name" className={input} value={f.name} onChange={set("name")} />
        <input required type="tel" pattern="[0-9+ ]{10,15}" placeholder="Phone (01x xxxx xxxx)" className={input} value={f.phone} onChange={set("phone")} />
        <select className={input} value={f.city} onChange={set("city")}><option>Cairo</option><option>Giza</option></select>
        <textarea required placeholder="Address" rows={3} className={input} value={f.address} onChange={set("address")} />
        <fieldset className="space-y-2">
          <legend className="mb-2 text-xs font-bold uppercase">Payment</legend>
          {PAY.map((p) => (
            <label key={p} className={`flex cursor-pointer items-center gap-3 border px-3 py-3 text-sm ${f.pay === p ? "border-foreground" : "border-border"}`}>
              <input type="radio" name="pay" checked={f.pay === p} onChange={() => setF({ ...f, pay: p })} className="accent-brand" />{p}
            </label>
          ))}
        </fieldset>
        <div className="flex justify-between border-t border-border pt-4 font-bold"><span>Total</span><span>{egp(total)}</span></div>
        {err && <p className="text-sm text-brand">{err}</p>}
        <button disabled={busy} className="w-full bg-foreground py-4 text-sm font-bold uppercase text-background hover:bg-brand">{busy ? "Placing…" : "Place order"}</button>
      </form>
    </section>
  );
}
