import { useEffect, useMemo, useState } from "react";
import { GripVertical, Pin, Eye, EyeOff, Pencil, Trash2, Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { egp, SECTIONS } from "@/lib/catalog";
import { signPaths } from "./signed";
import { ProductForm } from "./ProductForm";

export type Row = Database["public"]["Tables"]["products"]["Row"];
const LOW = 5;

export function ProductsTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<string>("All");
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [drag, setDrag] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("products").select("*")
      .order("is_pinned", { ascending: false }).order("sort_order").order("created_at");
    setRows(data ?? []);
    setUrls(await signPaths((data ?? []).map((r) => r.photos[0] ?? "")));
  };
  useEffect(() => { load(); }, []);

  const list = useMemo(() => rows.filter((r) => filter === "All" || r.sections.includes(filter)), [rows, filter]);

  const update = async (id: string, patch: Partial<Row>) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    await supabase.from("products").update(patch).eq("id", id);
  };
  const remove = async (r: Row) => {
    if (!confirm(`Delete "${r.name}"? This cannot be undone.`)) return;
    await supabase.from("products").delete().eq("id", r.id);
    if (r.photos.length) await supabase.storage.from("product-photos").remove(r.photos);
    load();
  };
  const drop = async (targetId: string) => {
    if (!drag || drag === targetId) return;
    const ids = list.map((r) => r.id);
    const from = ids.indexOf(drag), to = ids.indexOf(targetId);
    ids.splice(to, 0, ids.splice(from, 1)[0]!);
    const order = new Map(ids.map((id, i) => [id, i + 1]));
    setRows((rs) => [...rs.map((r) => (order.has(r.id) ? { ...r, sort_order: order.get(r.id)! } : r))]
      .sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || a.sort_order - b.sort_order));
    setDrag(null);
    await Promise.all(ids.map((id, i) => supabase.from("products").update({ sort_order: i + 1 }).eq("id", id)));
  };

  const totalStock = rows.reduce((s, r) => s + r.stock, 0);
  const outCount = rows.filter((r) => r.stock === 0).length;

  return (
    <div>
      <div className="grid grid-cols-3 gap-px border border-border bg-border text-center">
        {[["Products", rows.length], ["Units in stock", totalStock], ["Out of stock", outCount]].map(([l, v]) => (
          <div key={l} className="bg-background p-3"><p className="text-2xl font-black">{v}</p><p className="text-[10px] font-bold uppercase text-muted-foreground">{l}</p></div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["All", ...SECTIONS].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`border px-3 py-2 text-xs font-bold uppercase ${filter === s ? "border-foreground bg-foreground text-background" : "border-border"}`}>{s}</button>
          ))}
        </div>
        <button onClick={() => setEditing("new")} className="bg-brand px-4 py-2 text-xs font-bold uppercase text-brand-foreground hover:bg-foreground">+ Add product</button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Drag rows to set the display order. Pinned products always show first.</p>

      {list.length === 0 && <p className="mt-10 text-center text-sm text-muted-foreground">No products yet. Add your first product.</p>}
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {list.map((r) => (
          <li key={r.id} draggable onDragStart={() => setDrag(r.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => drop(r.id)}
            className={`flex items-center gap-3 py-3 ${drag === r.id ? "opacity-40" : ""} ${r.is_active ? "" : "opacity-60"}`}>
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
            <div className="h-16 w-14 shrink-0 bg-muted">{urls[r.photos[0] ?? ""] && <img src={urls[r.photos[0]!]} alt="" className="h-full w-full object-cover" />}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold uppercase">{r.is_pinned && <Pin className="mr-1 inline h-3 w-3 text-brand" />}{r.name}</p>
              <p className="truncate text-xs text-muted-foreground">{r.sections.join(", ")} · {r.category} · {egp(r.price)}</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="inline-flex items-center border border-border">
                  <button aria-label="Decrease stock" className="p-1" onClick={() => update(r.id, { stock: Math.max(0, r.stock - 1) })}><Minus className="h-3 w-3" /></button>
                  <input aria-label="Stock" type="number" min={0} value={r.stock} onChange={(e) => update(r.id, { stock: Math.max(0, parseInt(e.target.value) || 0) })} className="w-12 bg-transparent text-center text-xs outline-none" />
                  <button aria-label="Increase stock" className="p-1" onClick={() => update(r.id, { stock: r.stock + 1 })}><Plus className="h-3 w-3" /></button>
                </div>
                <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase ${r.stock === 0 ? "bg-brand text-brand-foreground" : r.stock <= LOW ? "bg-foreground text-background" : "bg-muted"}`}>
                  {r.stock === 0 ? "Out of stock" : r.stock <= LOW ? "Low stock" : "In stock"}
                </span>
                {!r.is_active && <span className="bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase">Hidden</span>}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
              <button title={r.is_pinned ? "Unpin" : "Pin"} aria-label="Pin" onClick={() => update(r.id, { is_pinned: !r.is_pinned })} className={`p-2 ${r.is_pinned ? "text-brand" : ""} hover:text-brand`}><Pin className="h-4 w-4" /></button>
              <button title={r.is_active ? "Hide" : "Show"} aria-label="Visibility" onClick={() => update(r.id, { is_active: !r.is_active })} className="p-2 hover:text-brand">{r.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
              <button title="Edit" aria-label="Edit" onClick={() => setEditing(r)} className="p-2 hover:text-brand"><Pencil className="h-4 w-4" /></button>
              <button title="Delete" aria-label="Delete" onClick={() => remove(r)} className="p-2 hover:text-brand"><Trash2 className="h-4 w-4" /></button>
            </div>
          </li>
        ))}
      </ul>

      {editing && <ProductForm product={editing === "new" ? null : editing} nextOrder={rows.length + 1} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}
