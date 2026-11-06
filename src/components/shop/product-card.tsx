import Link from "next/link";

import { formatPHP } from "@/lib/money";
import type { ProductSummary } from "@/types/catalog";

import { ProductTile } from "./product-tile";
import { StockStatus } from "./stock-status";

/** Listing card: tile, then name, category, stock, price, and View details. */
export function ProductCard({ product, priority }: { product: ProductSummary; priority?: boolean }) {
  return (
    <article className="group flex w-full flex-col">
      <ProductTile
        product={product}
        priority={priority}
        sizes="(min-width: 1280px) 300px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 50vw"
      />
      <div className="mt-1 flex flex-1 flex-col gap-0.5 px-1">
        <h3 className="font-sans text-body font-medium">
          <Link href={`/products/${product.slug}`} className="inline-flex min-h-11 items-center hover:underline hover:underline-offset-4">
            {product.name}
          </Link>
        </h3>
        <p className="text-caption text-muted-foreground">{product.category?.name ?? "Uncategorized"}</p>
        <p className="font-medium">{formatPHP(product.price_cents)}</p>
        <StockStatus stock={product.stock} className="self-start" />
        <Link
          href={`/products/${product.slug}`}
          className="mt-auto inline-flex min-h-11 items-center self-start text-caption font-medium underline underline-offset-4 hover:decoration-2"
        >
          View details<span className="sr-only"> for {product.name}</span>
        </Link>
      </div>
    </article>
  );
}
