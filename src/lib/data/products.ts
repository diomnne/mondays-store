import "server-only";

import { connection } from "next/server";
import { cache } from "react";

import { categoryKey } from "@/lib/category-theme";
import { listCategories } from "@/lib/data/categories";
import { resolveProductImage } from "@/lib/data/product-image";
import { getSupabase } from "@/lib/supabase/server";
import { escapeLikePattern, type ProductFilters } from "@/lib/validation/product-filters";
import type { Category, ProductDetail, ProductSummary } from "@/types/catalog";

/**
 * Product reads for the storefront. Every query is limited to active
 * products, so inactive ones can never be listed, viewed, or ordered here.
 *
 * Every function awaits `connection()` first. With Cache Components enabled,
 * that tells Next.js this data must be read at request time, never baked into
 * a prerendered page, so admin edits show up on the next refresh.
 */

const SUMMARY_COLUMNS =
  "id, name, slug, description, price_cents, stock, image_url, is_featured, category_id, category:categories(id, name)";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  stock: number;
  image_url: string;
  is_featured: boolean;
  category_id: string;
  category: Pick<Category, "id" | "name"> | null;
};

function toProductDetail(row: ProductRow): ProductDetail {
  const { image_url, ...rest } = row;
  return { ...rest, imageSrc: resolveProductImage(image_url) };
}

function activeProducts() {
  return getSupabase().from("products").select(SUMMARY_COLUMNS).eq("is_active", true);
}

export type ProductListing = {
  products: ProductSummary[];
  categories: Pick<Category, "id" | "name">[];
  /** The category matching the `category` filter, or null for all/unknown. */
  activeCategory: Pick<Category, "id" | "name"> | null;
};

/**
 * The listing page: search, category, and sort are all applied in the
 * database query, so they always work together.
 */
export async function getProductListing(filters: ProductFilters): Promise<ProductListing> {
  await connection();

  const categories = await listCategories();
  const activeCategory = filters.category
    ? (categories.find((category) => categoryKey(category.name) === filters.category) ?? null)
    : null;

  // An unknown category (?category=nails) matches nothing rather than everything.
  if (filters.category && !activeCategory) {
    return { products: [], categories, activeCategory: null };
  }

  let query = activeProducts();
  if (filters.q) {
    // ilike = case-insensitive; % on both sides = "name contains".
    query = query.ilike("name", `%${escapeLikePattern(filters.q)}%`);
  }
  if (activeCategory) {
    query = query.eq("category_id", activeCategory.id);
  }
  if (filters.sort === "price-asc" || filters.sort === "price-desc") {
    // Name as a tiebreaker keeps equal prices in a stable order.
    query = query.order("price_cents", { ascending: filters.sort === "price-asc" }).order("name");
  } else {
    query = query.order("name");
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Could not load products: ${error.message}`);
  }
  return { products: data.map(toProductDetail), categories, activeCategory };
}

/** Up to four featured products for the home page. */
export async function getFeaturedProducts(limit = 4): Promise<ProductSummary[]> {
  await connection();

  const { data, error } = await activeProducts().eq("is_featured", true).order("name").limit(limit);
  if (error) {
    throw new Error(`Could not load featured products: ${error.message}`);
  }
  return data.map(toProductDetail);
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * One active product by slug, or null if it's unknown or inactive. Wrapped in
 * React `cache` so the page and its metadata share a single query per request.
 */
export const getProductBySlug = cache(async (slug: string): Promise<ProductDetail | null> => {
  await connection();

  // Same rule as the database's slug check; anything else can't exist.
  if (!SLUG_PATTERN.test(slug)) return null;

  const { data, error } = await activeProducts().eq("slug", slug).maybeSingle();
  if (error) {
    throw new Error(`Could not load product: ${error.message}`);
  }
  return data ? toProductDetail(data) : null;
});

/** Up to three other active products from the same category. */
export async function getRelatedProducts(product: ProductDetail, limit = 3): Promise<ProductSummary[]> {
  await connection();

  const { data, error } = await activeProducts()
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .order("name")
    .limit(limit);
  if (error) {
    throw new Error(`Could not load related products: ${error.message}`);
  }
  return data.map(toProductDetail);
}
