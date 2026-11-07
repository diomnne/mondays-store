"use client";

import Link from "next/link";
import { Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cartTotals } from "@/lib/cart";
import { categoryTheme } from "@/lib/category-theme";
import { formatPHP, lineTotal } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { CartProduct } from "@/types/cart";

import { useCart } from "./cart-provider";
import { CartNotices } from "./cart-notices";
import { ProductImage } from "./product-image";
import { QuantityStepper } from "./quantity-stepper";
import { useResolvedCart, type CartItemView } from "./use-resolved-cart";

/** The /cart page body: lines, totals, and the way to checkout. */
export function CartView() {
  const { setQuantity, remove } = useCart();
  const { status, items, notices, dismissNotices, refresh } = useResolvedCart();

  if (status === "empty") {
    return (
      <div className="space-y-6">
        <CartNotices notices={notices} onDismiss={dismissNotices} />
        <div className="rounded-card border bg-card px-6 py-14 text-center">
          <h2 className="text-title">Your cart is empty.</h2>
          <p className="mx-auto mt-2 max-w-sm text-muted-foreground">Nothing in here yet. The shop is a click away.</p>
          <Button asChild className="mt-6">
            <Link href="/products">Shop all</Link>
          </Button>
        </div>
      </div>
    );
  }

  // First load: nothing resolved yet, so there are no prices to show.
  if (items.every((item) => !item.product)) {
    return status === "error" ? <ResolveError onRetry={refresh} /> : <CartSkeleton />;
  }

  const priced = items.filter((item): item is CartItemView & { product: CartProduct } => Boolean(item.product));
  const totals = cartTotals(priced.map((item) => ({ unitPriceCents: item.product.priceCents, quantity: item.line.quantity })));
  const canCheckout = status === "ready";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div className="space-y-4">
        <CartNotices notices={notices} onDismiss={dismissNotices} />
        {status === "error" && <ResolveError onRetry={refresh} />}

        <ul className="divide-y rounded-card border bg-card">
          {items.map(({ line, product }) =>
            product ? (
              <li key={line.productId} className="flex gap-4 p-4 sm:p-5">
                <Link
                  href={`/products/${product.slug}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  className={cn(
                    "@container relative size-20 shrink-0 overflow-hidden rounded-2xl sm:size-24",
                    categoryTheme(product.categoryName).gradient,
                  )}
                >
                  <ProductImage
                    src={product.imageSrc}
                    name={product.name}
                    categoryName={product.categoryName}
                    sizes="96px"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-start justify-between gap-x-4">
                    <div className="min-w-0">
                      <Link
                        href={`/products/${product.slug}`}
                        className="inline-flex min-h-11 items-center font-medium hover:underline hover:underline-offset-4"
                      >
                        {product.name}
                      </Link>
                      <p className="text-caption text-muted-foreground">{formatPHP(product.priceCents)} each</p>
                    </div>
                    <p className="pt-2.5 font-medium">
                      <span className="sr-only">Line total: </span>
                      {formatPHP(lineTotal(product.priceCents, line.quantity))}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <QuantityStepper
                      compact
                      label={`Quantity of ${product.name}`}
                      value={line.quantity}
                      max={Math.max(product.stock, 1)}
                      onChange={(quantity) => setQuantity(line.productId, quantity, product.stock)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(line.productId)}
                      aria-label={`Remove ${product.name} from cart`}
                    >
                      <Trash2Icon aria-hidden="true" />
                      Remove
                    </Button>
                  </div>
                </div>
              </li>
            ) : (
              // Added in another tab and not checked yet.
              <li key={line.productId} className="p-4 sm:p-5">
                <Skeleton className="h-20 w-full rounded-2xl" />
              </li>
            ),
          )}
        </ul>
      </div>

      <aside aria-labelledby="cart-summary-heading" className="space-y-4 rounded-card border bg-card p-6 lg:sticky lg:top-28">
        <h2 id="cart-summary-heading" className="text-title">
          Summary
        </h2>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPHP(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between border-t pt-3 text-lead font-bold">
            <dt>Total</dt>
            <dd>{formatPHP(totals.total)}</dd>
          </div>
        </dl>
        <p className="text-caption text-muted-foreground">No shipping, tax, or fees. The total is what you pay.</p>
        {canCheckout ? (
          <Button asChild size="lg" className="w-full">
            <Link href="/checkout">Checkout</Link>
          </Button>
        ) : (
          <Button size="lg" className="w-full" disabled>
            {status === "error" ? "Checkout unavailable" : "Checking prices…"}
          </Button>
        )}
      </aside>
    </div>
  );
}

function ResolveError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-card border border-destructive/30 bg-destructive-soft p-5 text-destructive">
      <p className="font-medium">We couldn&apos;t check current prices and stock.</p>
      <p className="mt-1 text-caption">Your cart is safe. Check your connection and try again.</p>
      <Button type="button" variant="destructive" size="sm" className="mt-3" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]" aria-busy="true">
      <span className="sr-only">Loading your cart</span>
      <div className="space-y-3 rounded-card border bg-card p-5">
        {Array.from({ length: 2 }, (_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-56 rounded-card" />
    </div>
  );
}
