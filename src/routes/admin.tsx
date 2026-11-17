import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { ProductsTab } from "@/components/admin/ProductsTab";
import { OrdersTab } from "@/components/admin/OrdersTab";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — CHVMPBUZZ" }, { name: "description", content: "CHVMPBUZZ store admin." }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

type State = "loading" | "out" | "denied" | "admin";

function Admin() {
  const [state, setState] = useState<State>("loading");
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<"products" | "orders">("products");

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setState("out");
      setEmail(user.email ?? "");
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setState(data ? "admin" : "denied");
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((e) => {
      if (e === "SIGNED_IN" || e === "SIGNED_OUT") check();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = () => supabase.auth.signOut();

  if (state === "loading") return <p className="py-20 text-center text-sm text-muted-foreground">Loading…</p>;
  if (state === "out") return <AdminLogin />;
  if (state === "denied") return (
    <section className="mx-auto max-w-sm px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-black uppercase">No access</h1>
      <p className="mt-3 text-sm text-muted-foreground">{email} is not an admin account.</p>
      <button onClick={signOut} className="mt-6 bg-foreground px-6 py-3 text-xs font-bold uppercase text-background hover:bg-brand">Sign out</button>
    </section>
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter">Admin</h1>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
        <button onClick={signOut} className="border border-border px-4 py-2 text-xs font-bold uppercase hover:border-foreground">Sign out</button>
      </div>
      <div className="mt-6 flex border-b border-border">
        {(["products", "orders"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`-mb-px border-b-2 px-4 py-3 text-xs font-bold uppercase ${tab === t ? "border-brand text-foreground" : "border-transparent text-muted-foreground"}`}>{t}</button>
        ))}
      </div>
      <div className="mt-6">{tab === "products" ? <ProductsTab /> : <OrdersTab />}</div>
    </section>
  );
}
