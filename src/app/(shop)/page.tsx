import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryTheme } from "@/lib/category-theme";
import { listActiveProducts } from "@/lib/data/products";
import { formatPHP } from "@/lib/money";
import { PRODUCT_STATUS_BADGE_CLASSES, PRODUCT_STATUS_LABELS } from "@/lib/product-status";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "Mondays | Easy on the face. Easy on the week." },
};

/**
 * Temporary home page for Phase 1: proves the Supabase connection end to end
 * by listing seeded products. Replaced by the designed home page in Phase 2.
 */
export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6">
      <section className="space-y-4">
        <h1 className="text-[clamp(2.25rem,6vw,4rem)] leading-[1.05]">
          Easy on the face. Easy on the week.
        </h1>
        <p className="max-w-prose text-lead text-muted-foreground">
          Foundations check: these products are read live from Supabase on every request.
        </p>
        <Button asChild>
          <Link href="/products">Shop all</Link>
        </Button>
      </section>

      <section aria-labelledby="seeded-products" className="mt-12">
        <h2 id="seeded-products" className="mb-4 text-title">
          Active products
        </h2>
        <Suspense fallback={<ProductListSkeleton />}>
          <SeededProductList />
        </Suspense>
      </section>
    </div>
  );
}

async function SeededProductList() {
  const products = await listActiveProducts();

  if (products.length === 0) {
    return <p className="text-muted-foreground">No active products yet.</p>;
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const outOfStock = product.stock <= 0;
        return (
          <li
            key={product.id}
            className="flex items-center gap-4 rounded-card border bg-card p-3 pr-5"
          >
            <span
              aria-hidden="true"
              className={cn("size-14 shrink-0 rounded-2xl", categoryTheme(product.category?.name).gradient)}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{product.name}</p>
              <p className="text-caption text-muted-foreground">
                {product.category?.name ?? "Uncategorized"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="font-medium">{formatPHP(product.price_cents)}</span>
              {outOfStock && (
                <Badge className={PRODUCT_STATUS_BADGE_CLASSES.out_of_stock}>
                  {PRODUCT_STATUS_LABELS.out_of_stock}
                </Badge>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ProductListSkeleton() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading products">
      {Array.from({ length: 6 }, (_, index) => (
        <li key={index}>
          <Skeleton className="h-20 rounded-card" />
        </li>
      ))}
    </ul>
  );
}
