import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRightIcon } from "lucide-react";

import { FeaturedProductCard } from "@/components/shop/featured-product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryKey, categoryTheme } from "@/lib/category-theme";
import { listCategories } from "@/lib/data/categories";
import { getFeaturedProducts } from "@/lib/data/products";
import { cn } from "@/lib/utils";
import { buildProductsHref } from "@/lib/validation/product-filters";

export const metadata: Metadata = {
  title: { absolute: "Mondays | Easy on the face. Easy on the week." },
};

const VALUES = [
  {
    title: "Five minutes, tops.",
    body: "Everything goes on with fingers and a mirror. No brushes, no tutorials.",
  },
  {
    title: "Gentle by default.",
    body: "Formulas for skin that has had a long week, and would like a quiet one.",
  },
  {
    title: "Pay how you like.",
    body: "Cash on delivery, e-wallet, or bank transfer. Prices in plain pesos.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <Hero />

      <section aria-labelledby="featured-heading" className="mx-auto w-full max-w-7xl px-4 pt-16 sm:px-6 sm:pt-24">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 id="featured-heading" className="text-[clamp(2rem,5vw,3rem)] leading-none">
            This week&apos;s favorites
          </h2>
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center gap-1.5 font-medium underline underline-offset-4 hover:decoration-2"
          >
            See everything <ArrowRightIcon aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <Suspense fallback={<FeaturedSkeleton />}>
          <FeaturedProducts />
        </Suspense>
      </section>

      <section aria-labelledby="categories-heading" className="mx-auto w-full max-w-7xl px-4 pt-16 sm:px-6 sm:pt-24">
        <h2 id="categories-heading" className="sr-only">
          Shop by category
        </h2>
        <Suspense fallback={<CategorySkeleton />}>
          <CategoryLinks />
        </Suspense>
      </section>

      <section aria-labelledby="values-heading" className="mx-auto w-full max-w-7xl px-4 pt-16 sm:px-6 sm:pt-24">
        <h2 id="values-heading" className="sr-only">
          Why Mondays
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {VALUES.map((value) => (
            <li key={value.title} className="rounded-card border bg-card p-6 sm:p-8">
              <h3 className="mb-2 text-title">{value.title}</h3>
              <p className="text-muted-foreground">{value.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/**
 * Split hero. The negative top margin slides it up under the sticky nav
 * (70px = the header's height) so the glass pill floats over the color.
 */
function Hero() {
  return (
    <section className="mx-auto -mt-[70px] grid w-full max-w-7xl gap-3 px-4 sm:px-6 md:grid-cols-2">
      {/* Featured image placeholder until the real hero photo exists. */}
      <div
        role="img"
        aria-label="Monday Tint, this week's featured lip tint (photo coming soon)"
        className="relative flex min-h-[22rem] items-end overflow-hidden rounded-card bg-gradient-rose p-6 pt-24 sm:min-h-[30rem] sm:p-8"
      >
        <span aria-hidden="true" className="font-heading text-[clamp(3rem,10vw,6.5rem)] leading-none text-ink/45 lowercase">
          tint
        </span>
      </div>

      <div className="flex flex-col justify-end gap-6 rounded-card bg-gradient-header p-6 sm:p-10 md:pt-28">
        <h1 className="text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.02]">
          Easy on the face. Easy on the week.
        </h1>
        <p className="max-w-md text-lead text-muted-foreground">
          Tints, balms, and creams for ordinary days. Nothing to learn, nothing to fix.
        </p>
        <div>
          <Button asChild size="lg">
            <Link href="/products">Shop all</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

async function FeaturedProducts() {
  const products = await getFeaturedProducts(4);

  if (products.length === 0) {
    return (
      <p className="text-muted-foreground">
        Nothing featured this week. <Link href="/products" className="underline underline-offset-4">Browse the shop</Link>.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
      {products.map((product) => (
        <li key={product.id} className="flex">
          <FeaturedProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

/** Giant stacked category names, each linking to the pre-filtered listing. */
async function CategoryLinks() {
  const categories = await listCategories();

  return (
    <ul className="border-t border-ink/15">
      {categories.map((category) => (
        <li key={category.id} className="border-b border-ink/15">
          <Link
            href={buildProductsHref({ category: categoryKey(category.name) })}
            className="group flex items-center justify-between gap-4 py-3 sm:py-4"
          >
            <span className="font-heading text-[clamp(3.5rem,15vw,9.5rem)] leading-[0.95] group-hover:underline group-hover:decoration-4 group-hover:underline-offset-8">
              {category.name}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-full text-ink transition-transform group-hover:translate-x-1 sm:size-20",
                categoryTheme(category.name).gradient,
              )}
            >
              <ArrowRightIcon className="size-5 sm:size-7" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4" aria-busy="true">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="aspect-[4/5] rounded-card" />
          <Skeleton className="mx-auto h-4 w-2/3" />
          <Skeleton className="mx-auto h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-[clamp(3.5rem,15vw,9.5rem)] w-2/3 rounded-2xl" />
      ))}
    </div>
  );
}
