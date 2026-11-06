import { z } from "zod";

/**
 * Listing filters live in the URL (/products?q=tint&category=lips&sort=price-asc)
 * so they survive refresh and can be shared. This module parses them safely
 * and builds links back to the listing. Used by both server and client code.
 */

export const PRODUCT_SORTS = ["name", "price-asc", "price-desc"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export const PRODUCT_SORT_LABELS: Record<ProductSort, string> = {
  name: "Name, A to Z",
  "price-asc": "Price, low to high",
  "price-desc": "Price, high to low",
};

export const DEFAULT_SORT: ProductSort = "name";
export const MAX_SEARCH_LENGTH = 100;

export type ProductFilters = {
  /** Trimmed search text; empty string means no search. */
  q: string;
  /** Lowercase category name; empty string means all categories. */
  category: string;
  sort: ProductSort;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

// A repeated param (?q=a&q=b) arrives as an array; use the first value.
const firstValue = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => (Array.isArray(value) ? value[0] : value) ?? "");

const filtersSchema = z.object({
  q: firstValue.transform((value) => value.trim().slice(0, MAX_SEARCH_LENGTH)),
  category: firstValue.transform((value) => value.trim().toLowerCase()),
  // Anything that isn't a known sort falls back to the default instead of erroring.
  sort: firstValue.transform((value): ProductSort =>
    (PRODUCT_SORTS as readonly string[]).includes(value) ? (value as ProductSort) : DEFAULT_SORT,
  ),
});

export function parseProductFilters(searchParams: RawSearchParams): ProductFilters {
  return filtersSchema.parse(searchParams);
}

/** Builds a /products URL, leaving out empty and default values. */
export function buildProductsHref(filters: Partial<ProductFilters>): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.sort && filters.sort !== DEFAULT_SORT) params.set("sort", filters.sort);
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

/**
 * Escapes LIKE wildcards so a search for "50%" matches the text "50%",
 * not "50 followed by anything".
 */
export function escapeLikePattern(text: string): string {
  return text.replace(/[\\%_]/g, (character) => `\\${character}`);
}
