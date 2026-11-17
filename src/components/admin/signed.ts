import { supabase } from "@/integrations/supabase/client";
import { BUCKET } from "@/lib/catalog";

export async function signPaths(paths: string[]): Promise<Record<string, string>> {
  const uniq = [...new Set(paths.filter(Boolean))];
  if (!uniq.length) return {};
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(uniq, 60 * 60);
  const out: Record<string, string> = {};
  for (const d of data ?? []) if (d.path && d.signedUrl) out[d.path] = d.signedUrl;
  return out;
}
