"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PRODUCT_SORTS,
  PRODUCT_SORT_LABELS,
  buildProductsHref,
  type ProductFilters,
  type ProductSort,
} from "@/lib/validation/product-filters";

/** Price sort. Choosing an option rewrites the URL, keeping search and category. */
export function SortSelect({ filters }: { filters: ProductFilters }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <label id="sort-label" htmlFor="sort-trigger" className="text-caption font-medium whitespace-nowrap">
        Sort by
      </label>
      <Select
        value={filters.sort}
        onValueChange={(value) =>
          startTransition(() => {
            router.push(buildProductsHref({ ...filters, sort: value as ProductSort }), { scroll: false });
          })
        }
      >
        <SelectTrigger
          id="sort-trigger"
          aria-labelledby="sort-label"
          aria-busy={isPending}
          className="w-full min-w-48 sm:w-auto"
        >
          {/* Label passed explicitly so it renders on the server, before the options mount. */}
          <SelectValue>{PRODUCT_SORT_LABELS[filters.sort]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {PRODUCT_SORTS.map((sort) => (
            <SelectItem key={sort} value={sort} className="min-h-11">
              {PRODUCT_SORT_LABELS[sort]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
