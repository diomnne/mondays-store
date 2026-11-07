import "server-only";

import { getSupabase } from "@/lib/supabase/server";
import { UUID_PATTERN } from "@/lib/validation/cart";

/**
 * Cheap yes/no checks used by the proxy before a page renders, so missing
 * records can get a real 404 status (see src/proxy.ts). `head: true` asks
 * for a count only, no row data.
 */

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function activeProductExists(slug: string): Promise<boolean> {
  if (!SLUG_PATTERN.test(slug)) return false;
  const { count, error } = await getSupabase()
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("slug", slug)
    .eq("is_active", true);
  if (error) throw new Error(`Could not check product: ${error.message}`);
  return (count ?? 0) > 0;
}

export async function orderExists(id: string): Promise<boolean> {
  if (!UUID_PATTERN.test(id)) return false;
  const { count, error } = await getSupabase()
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("id", id);
  if (error) throw new Error(`Could not check order: ${error.message}`);
  return (count ?? 0) > 0;
}
