import Link from "next/link";

import { categoryTheme } from "@/lib/category-theme";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/catalog";

import { AddToCartButton } from "./add-to-cart-button";
import { ProductImage } from "./product-image";

type ProductTileProps = {
  product: ProductSummary;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * The colored square at the top of a product card: category gradient, photo
 * (or placeholder), and a glass Add to cart floating over it.
 */
export function ProductTile({ product, sizes, priority, className }: ProductTileProps) {
  return (
    <div
      className={cn(
        "@container relative aspect-[4/5] overflow-hidden rounded-card",
        categoryTheme(product.category?.name).gradient,
        className,
      )}
    >
      {/* The image links to the details page; hidden from tab order to avoid a duplicate link. */}
      <Link href={`/products/${product.slug}`} tabIndex={-1} aria-hidden="true" className="absolute inset-0">
        <ProductImage
          src={product.imageSrc}
          name={product.name}
          categoryName={product.category?.name}
          sizes={sizes}
          priority={priority}
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="absolute inset-x-2.5 bottom-2.5 sm:inset-x-3 sm:bottom-3">
        <AddToCartButton productName={product.name} stock={product.stock} variant="glass" size="sm" />
      </div>
    </div>
  );
}
