import "server-only";

import { resolveProductImage } from "@/lib/data/product-image";
import { getSupabase } from "@/lib/supabase/server";
import type { CartLine, CartProduct, ResolvedCartLine } from "@/types/cart";

/**
 * Checks cart lines against the database: current name, price, stock, and
 * whether each product is still active. The browser only stores ids and
 * quantities, so this is where every price shown in the cart comes from.
 *
 * Inactive products are included in the query (not filtered out) so the
 * customer can be told *which* item became unavailable.
 */
export async function resolveCartLines(lines: readonly CartLine[]): Promise<ResolvedCartLine[]> {
  if (lines.length === 0) return [];

  const { data, error } = await getSupabase()
    .from("products")
    .select("id, name, slug, image_url, price_cents, stock, is_active, category:categories(name)")
    .in(
      "id",
      lines.map((line) => line.productId),
    );
  if (error) {
    throw new Error(`Could not check cart: ${error.message}`);
  }

  const products = new Map<string, CartProduct>(
    data.map((row) => [
      row.id,
      {
        id: row.id,
        name: row.name,
        slug: row.slug,
        imageSrc: resolveProductImage(row.image_url),
        categoryName: row.category?.name ?? null,
        priceCents: row.price_cents,
        stock: row.stock,
        isActive: row.is_active,
      },
    ]),
  );

  return lines.map((line) => {
    const product = products.get(line.productId) ?? null;
    let status: ResolvedCartLine["status"] = "ok";
    if (!product || !product.isActive) status = "unavailable";
    else if (line.quantity > product.stock) status = "over_stock";
    return { productId: line.productId, quantity: line.quantity, status, product };
  });
}
