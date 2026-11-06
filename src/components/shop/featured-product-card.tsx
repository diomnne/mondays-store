import Link from "next/link";

import { formatPHP } from "@/lib/money";
import type { ProductSummary } from "@/types/catalog";

import { ProductTile } from "./product-tile";

/** Home page tile: name, short description, and price centered under the tile. */
export function FeaturedProductCard({ product }: { product: ProductSummary }) {
  return (
    <article className="group flex w-full flex-col text-center">
      <ProductTile
        product={product}
        sizes="(min-width: 1280px) 300px, (min-width: 1024px) 24vw, 50vw"
      />
      <div className="mt-2 flex flex-col items-center gap-0.5 px-1">
        <h3 className="font-sans text-lead font-medium">
          <Link href={`/products/${product.slug}`} className="inline-flex min-h-11 items-center hover:underline hover:underline-offset-4">
            {product.name}
          </Link>
        </h3>
        <p className="line-clamp-2 max-w-[28ch] text-caption text-muted-foreground">{product.description}</p>
        <p className="font-medium">{formatPHP(product.price_cents)}</p>
      </div>
    </article>
  );
}
