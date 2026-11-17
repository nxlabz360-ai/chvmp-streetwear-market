import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const field = "w-full border border-input bg-background px-3 py-3 text-sm outline-none focus:border-foreground";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setErr(error.message);
  };
  return (
    <section className="mx-auto max-w-sm px-4 py-16">
      <div className="text-center"><Logo className="text-2xl" /></div>
      <h1 className="mt-8 font-display text-3xl font-black uppercase">Admin login</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input className={field} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <input className={field} type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        {err && <p className="text-sm text-brand">{err}</p>}
        <button disabled={busy} className="w-full bg-foreground py-3 text-sm font-bold uppercase text-background hover:bg-brand disabled:opacity-50">{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </section>
  );
}
