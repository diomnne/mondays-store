import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/shop/product-card";
import { ProductFiltersBar } from "@/components/shop/product-filters";
import { Button } from "@/components/ui/button";
import { getProductListing } from "@/lib/data/products";
import { parseProductFilters } from "@/lib/validation/product-filters";

export const metadata: Metadata = {
  title: "Shop",
  description: "Lip, face, and skin products from Mondays. Search, filter by category, and sort by price.",
};

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const filters = parseProductFilters(await searchParams);
  const { products, categories, activeCategory } = await getProductListing(filters);

  const hasFilters = Boolean(filters.q || filters.category);
  const countLabel = `${products.length} ${products.length === 1 ? "product" : "products"}`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12">
      <header className="mb-8 space-y-2">
        <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] leading-none">{activeCategory?.name ?? "Shop all"}</h1>
        <p className="text-lead text-muted-foreground">
          {activeCategory
            ? `Everything we make for ${activeCategory.name.toLowerCase()}.`
            : "Everything we make, in one place."}
        </p>
      </header>

      <ProductFiltersBar filters={filters} categories={categories} />

      <p aria-live="polite" className="mt-6 mb-4 text-caption text-muted-foreground">
        {countLabel}
        {filters.q && <> matching &ldquo;{filters.q}&rdquo;</>}
      </p>

      {products.length > 0 ? (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <li key={product.id} className="flex">
              {/* The first row is likely above the fold, so load it eagerly. */}
              <ProductCard product={product} priority={index < 2} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-card border bg-card px-6 py-14 text-center">
          <h2 className="text-title">Nothing matches that.</h2>
          <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
            {filters.category && !activeCategory
              ? "That category doesn't exist."
              : "Try a different search, or clear the filters to see everything."}
          </p>
          {hasFilters && (
            <Button asChild variant="outline" className="mt-6">
              <Link href="/products">Clear filters</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
