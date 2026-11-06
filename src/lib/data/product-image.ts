import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const PRODUCTS_DIR = path.join(PUBLIC_DIR, "products");

/**
 * Returns the product's image path if the file is actually there, otherwise
 * null so the UI renders the category-gradient placeholder. This keeps the
 * storefront free of broken images while the real photos are still missing.
 *
 * Only bundled images under /public/products are supported for now; external
 * image URLs are handled when admin product editing is built.
 * (next.config.ts traces public/products into the server bundle so this
 * check also works on Vercel.)
 */
export function resolveProductImage(imageUrl: string): string | null {
  if (!imageUrl.startsWith("/products/")) return null;

  const filePath = path.join(PUBLIC_DIR, imageUrl);
  // Refuse anything that escapes public/products, e.g. "/products/../../.env".
  if (!filePath.startsWith(PRODUCTS_DIR + path.sep)) return null;

  return existsSync(filePath) ? imageUrl : null;
}
