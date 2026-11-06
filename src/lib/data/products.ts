import "server-only";

import { connection } from "next/server";

import { getSupabase } from "@/lib/supabase/server";
import type { ProductSummary } from "@/types/catalog";

/**
 * Product reads for Server Components.
 *
 * Every function awaits `connection()` first. With Cache Components enabled,
 * that tells Next.js this data must be read at request time, never baked into
 * a prerendered page, so admin edits show up on the next refresh.
 */

const PRODUCT_SUMMARY_COLUMNS =
  "id, name, slug, price_cents, stock, image_url, is_featured, category:categories(id, name)";

/** Active products (including out of stock), alphabetical. */
export async function listActiveProducts(): Promise<ProductSummary[]> {
  await connection();

  const { data, error } = await getSupabase()
    .from("products")
    .select(PRODUCT_SUMMARY_COLUMNS)
    .eq("is_active", true)
    .order("name");

  if (error) {
    // Unexpected failure (network, bad key): let the nearest error.tsx handle it.
    throw new Error(`Could not load products: ${error.message}`);
  }
  return data;
}
