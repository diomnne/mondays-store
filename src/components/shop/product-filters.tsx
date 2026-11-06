import Form from "next/form";
import Link from "next/link";
import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categoryKey } from "@/lib/category-theme";
import { cn } from "@/lib/utils";
import { DEFAULT_SORT, buildProductsHref, type ProductFilters } from "@/lib/validation/product-filters";
import type { Category } from "@/types/catalog";

import { SortSelect } from "./sort-select";

type ProductFiltersProps = {
  filters: ProductFilters;
  categories: Pick<Category, "id" | "name">[];
};

/**
 * Search, category chips, and sort. Each control only rewrites the URL;
 * the page reads the URL and queries the database. Changing one filter
 * keeps the others.
 */
export function ProductFiltersBar({ filters, categories }: ProductFiltersProps) {
  const chips = [{ key: "", label: "All" }, ...categories.map((c) => ({ key: categoryKey(c.name), label: c.name }))];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        {/* A GET form: submitting navigates to /products?q=…, keeping category and sort. */}
        <Form action="/products" role="search" className="flex w-full gap-2 sm:max-w-md">
          <label htmlFor="product-search" className="sr-only">
            Search products by name
          </label>
          <Input
            key={filters.q}
            id="product-search"
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Search by name"
            maxLength={100}
            autoComplete="off"
          />
          {filters.category && <input type="hidden" name="category" value={filters.category} />}
          {filters.sort !== DEFAULT_SORT && <input type="hidden" name="sort" value={filters.sort} />}
          <Button type="submit" variant="secondary" size="icon" aria-label="Search">
            <SearchIcon aria-hidden="true" />
          </Button>
        </Form>

        <SortSelect filters={filters} />
      </div>

      <nav aria-label="Filter by category">
        <ul className="flex flex-wrap gap-2">
          {chips.map((chip) => {
            const active = chip.key === filters.category;
            return (
              <li key={chip.key || "all"}>
                <Link
                  href={buildProductsHref({ ...filters, category: chip.key })}
                  aria-current={active ? "true" : undefined}
                  scroll={false}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-full border px-5 font-medium transition-colors",
                    active
                      ? "border-transparent bg-lilac text-ink"
                      : "border-border bg-card text-foreground hover:border-ink/40",
                  )}
                >
                  {chip.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
