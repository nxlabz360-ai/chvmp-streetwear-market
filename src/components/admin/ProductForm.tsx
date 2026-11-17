import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BUCKET, SECTIONS, type Color } from "@/lib/catalog";
import { field } from "./AdminLogin";
import { signPaths } from "./signed";
import type { Row } from "./ProductsTab";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function ProductForm({ product, nextOrder, onClose, onSaved }: { product: Row | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    name: product?.name ?? "", description: product?.description ?? "",
    price: String(product?.price ?? ""), stock: String(product?.stock ?? "0"),
    category: product?.category ?? "", sections: product?.sections ?? ["Men"],
    sizes: (product?.sizes ?? []).join(", "), is_active: product?.is_active ?? true, is_pinned: product?.is_pinned ?? false,
  });
  const [colors, setColors] = useState<Color[]>((product?.colors as Color[] | undefined) ?? []);
  const [photos, setPhotos] = useState<string[]>(product?.photos ?? []);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [cName, setCName] = useState(""); const [cHex, setCHex] = useState("#000000");

  useEffect(() => { signPaths(photos).then((u) => setUrls((p) => ({ ...p, ...u }))); }, [photos]);

  const upload = async (files: FileList | null) => {
    if (!files) return;
    setBusy(true);
    for (const file of Array.from(files)) {
      const path = `products/${crypto.randomUUID()}.${file.name.split(".").pop() || "jpg"}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
      if (error) setErr(error.message); else setPhotos((p) => [...p, path]);
    }
    setBusy(false);
  };
  const toggleSection = (s: string) => setF((v) => ({ ...v, sections: v.sections.includes(s) ? v.sections.filter((x) => x !== s) : [...v.sections, s] }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseInt(f.price), stock = parseInt(f.stock);
    if (!f.name.trim() || isNaN(price) || price < 0 || isNaN(stock) || stock < 0) return setErr("Enter a name, a valid price and stock.");
    if (!f.sections.length) return setErr("Choose at least one section.");
    setBusy(true); setErr("");
    const payload = {
      name: f.name.trim(), description: f.description, price, stock, category: f.category.trim(), sections: f.sections,
      sizes: f.sizes.split(",").map((s) => s.trim()).filter(Boolean), colors, photos, is_active: f.is_active, is_pinned: f.is_pinned,
    };
    const res = product
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase.from("products").insert({ ...payload, slug: `${slugify(f.name) || "product"}-${Math.random().toString(36).slice(2, 6)}`, sort_order: nextOrder });
    setBusy(false);
    if (res.error) return setErr(res.error.message);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/50" onClick={onClose} />
      <form onSubmit={save} className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-background">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-xl font-black uppercase">{product ? "Edit product" : "New product"}</h2>
          <button type="button" aria-label="Close" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <L t="Name"><input className={field} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></L>
          <L t="Description"><textarea className={field} rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></L>
          <div className="grid grid-cols-2 gap-3">
            <L t="Price (EGP)"><input className={field} type="number" min={0} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} required /></L>
            <L t="Quantity in stock"><input className={field} type="number" min={0} value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} required /></L>
          </div>
          <L t="Category"><input className={field} placeholder="Hoodies, Tees, Jeans, Caps…" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} /></L>
          <L t="Section">
            <div className="flex flex-wrap gap-2">{SECTIONS.map((s) => (
              <button type="button" key={s} onClick={() => toggleSection(s)} className={`border px-3 py-2 text-xs font-bold uppercase ${f.sections.includes(s) ? "border-foreground bg-foreground text-background" : "border-border"}`}>{s}</button>
            ))}</div>
          </L>
          <L t="Sizes (comma separated)"><input className={field} placeholder="S, M, L, XL" value={f.sizes} onChange={(e) => setF({ ...f, sizes: e.target.value })} /></L>
          <L t="Colors">
            <div className="flex flex-wrap gap-2">{colors.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1 border border-border px-2 py-1 text-xs">
                <span className="h-3 w-3 border border-border" style={{ background: c.hex }} />{c.name}
                <button type="button" aria-label="Remove color" onClick={() => setColors(colors.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button>
              </span>
            ))}</div>
            <div className="mt-2 flex gap-2">
              <input className={field} placeholder="Color name" value={cName} onChange={(e) => setCName(e.target.value)} />
              <input type="color" aria-label="Color swatch" value={cHex} onChange={(e) => setCHex(e.target.value)} className="h-12 w-12 shrink-0 border border-input" />
              <button type="button" onClick={() => { if (cName.trim()) { setColors([...colors, { name: cName.trim(), hex: cHex }]); setCName(""); } }} className="shrink-0 border border-foreground px-3 text-xs font-bold uppercase">Add</button>
            </div>
          </L>
          <L t="Photos (first photo is the main one)">
            <div className="grid grid-cols-4 gap-2">{photos.map((p, i) => (
              <div key={p} className="relative aspect-[3/4] bg-muted">
                {urls[p] && <img src={urls[p]} alt="" className="h-full w-full object-cover" />}
                <button type="button" aria-label="Remove photo" onClick={() => setPhotos(photos.filter((x) => x !== p))} className="absolute right-0 top-0 bg-foreground p-0.5 text-background"><X className="h-3 w-3" /></button>
                {i > 0 && <button type="button" onClick={() => setPhotos([p, ...photos.filter((x) => x !== p)])} className="absolute bottom-0 left-0 right-0 bg-foreground/80 text-[9px] font-bold uppercase text-background">Make main</button>}
              </div>
            ))}</div>
            <input type="file" accept="image/*" multiple onChange={(e) => upload(e.target.files)} className="mt-2 block w-full text-xs" />
          </L>
          <div className="flex gap-6 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} /> Visible on site</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.is_pinned} onChange={(e) => setF({ ...f, is_pinned: e.target.checked })} /> Pinned</label>
          </div>
          {err && <p className="text-sm text-brand">{err}</p>}
        </div>
        <div className="border-t border-border p-4">
          <button disabled={busy} className="w-full bg-foreground py-3 text-sm font-bold uppercase text-background hover:bg-brand disabled:opacity-50">{busy ? "Working…" : "Save product"}</button>
        </div>
      </form>
    </div>
  );
}

function L({ t, children }: { t: string; children: React.ReactNode }) {
  return <div><p className="mb-1 text-[11px] font-bold uppercase text-muted-foreground">{t}</p>{children}</div>;
}
