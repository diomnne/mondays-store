import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeftIcon } from "lucide-react";

import { ProductCard } from "@/components/shop/product-card";
import { ProductImage } from "@/components/shop/product-image";
import { PurchasePanel } from "@/components/shop/purchase-panel";
import { StockStatus } from "@/components/shop/stock-status";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryKey, categoryTheme } from "@/lib/category-theme";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { formatPHP } from "@/lib/money";
import { cn } from "@/lib/utils";
import { buildProductsHref } from "@/lib/validation/product-filters";
import type { ProductDetail } from "@/types/catalog";

/**
 * Blocking route: the product is loaded before anything is sent, so a missing
 * or inactive slug can respond with a real 404 status. (A route-level
 * loading.tsx would stream a 200 first.) Only related products stream in.
 */
export const instant = false;

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Off the shelf", robots: { index: false } };
  }
  return { title: product.name, description: product.description };
}

export default async function ProductDetailsPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  // Unknown and inactive slugs both come back null, so neither can be viewed or ordered.
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const categoryName = product.category?.name;
  const backHref = categoryName ? buildProductsHref({ category: categoryKey(categoryName) }) : "/products";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10">
      <Link
        href={backHref}
        className="mb-4 inline-flex min-h-11 items-center gap-1 rounded-full pr-3 font-medium hover:underline hover:underline-offset-4"
      >
        <ChevronLeftIcon aria-hidden="true" className="size-4" />
        {categoryName ? `Back to ${categoryName.toLowerCase()}` : "Back to the shop"}
      </Link>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div
          className={cn(
            "@container relative aspect-square overflow-hidden rounded-card md:aspect-[4/5]",
            categoryTheme(categoryName).gradient,
          )}
        >
          <ProductImage
            src={product.imageSrc}
            name={product.name}
            categoryName={categoryName}
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
        </div>

        <div className="flex flex-col gap-6 md:py-6">
          <div className="space-y-3">
            {categoryName && (
              <Link
                href={backHref}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full px-4 text-caption font-medium text-ink",
                  categoryTheme(categoryName).swatch,
                )}
              >
                {categoryName}
              </Link>
            )}
            <h1 className="text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05]">{product.name}</h1>
            <p className="text-title font-medium">{formatPHP(product.price_cents)}</p>
            <StockStatus stock={product.stock} className="inline-block" />
            {product.stock > 0 && (
              <p className="text-caption text-muted-foreground">{product.stock} available</p>
            )}
          </div>

          <p className="max-w-prose text-lead text-muted-foreground">{product.description}</p>

          <div className="max-w-sm">
            <PurchasePanel productId={product.id} productName={product.name} stock={product.stock} />
          </div>
        </div>
      </div>

      <Suspense fallback={<RelatedSkeleton />}>
        <RelatedProducts product={product} />
      </Suspense>
    </div>
  );
}

/** Omitted entirely when the category has no other active products. */
async function RelatedProducts({ product }: { product: ProductDetail }) {
  const related = await getRelatedProducts(product);
  if (related.length === 0) return null;

  const categoryName = product.category?.name;
  return (
    <section aria-labelledby="related-heading" className="mt-16 sm:mt-24">
      <h2 id="related-heading" className="mb-6 text-[clamp(1.75rem,4vw,2.5rem)]">
        More {categoryName ? `for ${categoryName.toLowerCase()}` : "like this"}
      </h2>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-3">
        {related.map((item) => (
          <li key={item.id} className="flex">
            <ProductCard product={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function RelatedSkeleton() {
  return (
    <div className="mt-16 sm:mt-24" aria-busy="true">
      <Skeleton className="mb-6 h-10 w-56 rounded-2xl" />
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="aspect-[4/5] rounded-card" />
        ))}
      </div>
    </div>
  );
}
