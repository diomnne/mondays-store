"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cartTotals } from "@/lib/cart";
import { formatPHP } from "@/lib/money";
import type { CartProduct } from "@/types/cart";

import { CartNotices } from "./cart-notices";
import { CheckoutForm } from "./checkout-form";
import { useResolvedCart, type CartItemView } from "./use-resolved-cart";

type PricedItem = CartItemView & { product: CartProduct };

/** The /checkout page body: form plus an order summary priced from the server. */
export function CheckoutView() {
  const { status, items, notices, addNotices, dismissNotices, refresh } = useResolvedCart();
  // Set once the order is saved, so clearing the cart doesn't flash "empty".
  const [placed, setPlaced] = useState(false);

  if (placed) {
    return (
      <p role="status" className="rounded-card border bg-card p-6 text-lead">
        Order placed. Taking you to your confirmation…
      </p>
    );
  }

  if (status === "empty") {
    return (
      <div className="space-y-6">
        <CartNotices notices={notices} title="Your cart changed" onDismiss={dismissNotices} />
        <div className="rounded-card border bg-card px-6 py-14 text-center">
          <h2 className="text-title">There&apos;s nothing to check out.</h2>
          <p className="mx-auto mt-2 max-w-sm text-muted-foreground">Your cart is empty. Add something first.</p>
          <Button asChild className="mt-6">
            <Link href="/products">Shop all</Link>
          </Button>
        </div>
      </div>
    );
  }

  const priced = items.filter((item): item is PricedItem => Boolean(item.product));
  if (priced.length === 0) {
    return status === "error" ? <PriceCheckError onRetry={refresh} /> : <CheckoutSkeleton />;
  }

  // Ordering waits until every line has a fresh price from the server.
  const ready = status === "ready" && priced.length === items.length;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start">
      <div className="space-y-6 lg:order-first">
        <CartNotices
          notices={notices}
          title="Your cart changed. Please review it, then place your order again."
          onDismiss={dismissNotices}
        />
        {status === "error" && <PriceCheckError onRetry={refresh} />}
        <section aria-labelledby="details-heading" className="rounded-card border bg-card p-5 sm:p-8">
          <h2 id="details-heading" className="mb-6 text-title">
            Your details
          </h2>
          <CheckoutForm
            items={priced}
            ready={ready}
            onCartChanged={(changeNotices) => {
              addNotices(changeNotices);
              // Load the new prices; Place order stays disabled until they arrive.
              refresh();
            }}
            onPlaced={() => setPlaced(true)}
          />
        </section>
      </div>

      <OrderSummary items={priced} updating={!ready} />
    </div>
  );
}

function OrderSummary({ items, updating }: { items: PricedItem[]; updating: boolean }) {
  const totals = cartTotals(items.map(({ line, product }) => ({ unitPriceCents: product.priceCents, quantity: line.quantity })));

  return (
    <aside
      aria-labelledby="summary-heading"
      aria-busy={updating}
      className="order-first space-y-4 rounded-card border bg-card p-5 sm:p-6 lg:sticky lg:top-28 lg:order-last"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="summary-heading" className="text-title">
          Order summary
        </h2>
        <Link href="/cart" className="inline-flex min-h-11 items-center text-caption font-medium underline underline-offset-4">
          Edit cart
        </Link>
      </div>

      <table className="w-full text-left text-caption">
        <caption className="sr-only">Items in your order</caption>
        <thead className="text-muted-foreground">
          <tr className="border-b">
            <th scope="col" className="pb-2 font-medium">Item</th>
            <th scope="col" className="pb-2 text-right font-medium">Qty</th>
            <th scope="col" className="pb-2 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map(({ line, product }, index) => (
            <tr key={line.productId} className="border-b align-top last:border-0">
              <td className="py-3 pr-2">
                <span className="block text-body font-medium">{product.name}</span>
                <span className="text-muted-foreground">{formatPHP(product.priceCents)} each</span>
              </td>
              <td className="py-3 text-right">{line.quantity}</td>
              <td className="py-3 pl-2 text-right font-medium whitespace-nowrap">{formatPHP(totals.lineTotals[index])}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="space-y-2 border-t pt-4">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatPHP(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between text-lead font-bold">
          <dt>Total</dt>
          <dd>{formatPHP(totals.total)}</dd>
        </div>
      </dl>
      <p className="text-caption text-muted-foreground">
        {updating ? "Checking current prices…" : "Prices checked just now. No shipping, tax, or fees."}
      </p>
    </aside>
  );
}

function PriceCheckError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-card border border-destructive/30 bg-destructive-soft p-5 text-destructive">
      <p className="font-medium">We couldn&apos;t check current prices and stock, so ordering is paused.</p>
      <p className="mt-1 text-caption">Your cart is safe. Check your connection and try again.</p>
      <Button type="button" variant="destructive" size="sm" className="mt-3" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_24rem]" aria-busy="true">
      <span className="sr-only">Loading checkout</span>
      <Skeleton className="h-[36rem] rounded-card" />
      <Skeleton className="order-first h-64 rounded-card lg:order-last" />
    </div>
  );
}
