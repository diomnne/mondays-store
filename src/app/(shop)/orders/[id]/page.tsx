import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2Icon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/data/orders";
import { formatPHP } from "@/lib/money";
import { ORDER_STATUS_BADGE_CLASSES, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/order-status";

/*
 * Guest order confirmation, loaded from the database by the order's uuid.
 * There are no customer accounts, so this page has no login. That's
 * acceptable because the uuid is random (122 bits) and only ever given to
 * the customer who placed the order: it can't be guessed or enumerated the
 * way MON-0009 could. The page is also kept out of search engines.
 *
 * Blocking route (no loading.tsx), so an unknown id returns a real 404.
 */
export const instant = false;

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

const placedAtFormat = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Manila",
});

export default async function OrderConfirmationPage({ params }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const firstName = order.customer_name.split(/\s+/)[0];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-8 sm:px-6 sm:pt-12">
      <header className="mb-8 space-y-3">
        <p className="inline-flex items-center gap-2 font-medium">
          <CheckCircle2Icon aria-hidden="true" className="size-5" />
          Order saved
        </p>
        <h1 className="text-[clamp(2.25rem,6vw,3.75rem)] leading-[1.05]">Thank you, {firstName}.</h1>
        <p className="text-lead text-muted-foreground">
          Your order number is <strong className="font-bold text-foreground">{order.order_number}</strong>. Keep it
          handy if you get in touch.
        </p>
      </header>

      <section aria-labelledby="order-heading" className="space-y-6 rounded-card border bg-card p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="order-heading" className="text-title">
            {order.order_number}
          </h2>
          <Badge className={`h-7 px-3 text-caption ${ORDER_STATUS_BADGE_CLASSES[order.status]}`}>
            <span className="sr-only">Status: </span>
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </div>
        <p className="text-caption text-muted-foreground">
          Placed {placedAtFormat.format(new Date(order.created_at))}
        </p>

        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <Detail label="Name">{order.customer_name}</Detail>
          <Detail label="Email">{order.customer_email}</Detail>
          <Detail label="Contact number">{order.contact_number}</Detail>
          <Detail label="Payment method">{PAYMENT_METHOD_LABELS[order.payment_method]}</Detail>
          <Detail label="Delivery address" className="sm:col-span-2">
            <span className="whitespace-pre-line">{order.delivery_address}</span>
          </Detail>
          {order.notes && (
            <Detail label="Notes" className="sm:col-span-2">
              <span className="whitespace-pre-line">{order.notes}</span>
            </Detail>
          )}
        </dl>

        <table className="w-full text-left">
          <caption className="sr-only">Items in order {order.order_number}</caption>
          <thead className="text-caption text-muted-foreground">
            <tr className="border-b">
              <th scope="col" className="pb-2 font-medium">Item</th>
              <th scope="col" className="hidden pb-2 text-right font-medium sm:table-cell">Unit price</th>
              <th scope="col" className="pb-2 text-right font-medium">Qty</th>
              <th scope="col" className="pb-2 text-right font-medium">Line total</th>
            </tr>
          </thead>
          <tbody>
            {/* Names and prices are the snapshot saved with the order, not the current product. */}
            {order.items.map((item) => (
              <tr key={item.id} className="border-b align-top">
                <td className="py-3 pr-2">
                  <span className="block font-medium">{item.product_name}</span>
                  {/* On small screens the unit price sits under the name instead of in its own column. */}
                  <span className="text-caption text-muted-foreground sm:hidden">
                    {formatPHP(item.unit_price_cents)} each
                  </span>
                </td>
                <td className="hidden py-3 pl-2 text-right whitespace-nowrap sm:table-cell">
                  {formatPHP(item.unit_price_cents)}
                </td>
                <td className="py-3 pl-2 text-right">{item.quantity}</td>
                <td className="py-3 pl-2 text-right whitespace-nowrap">{formatPHP(item.line_total_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto max-w-xs space-y-2">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPHP(order.total_cents)}</dd>
          </div>
          <div className="flex justify-between border-t pt-2 text-lead font-bold">
            <dt>Total</dt>
            <dd>{formatPHP(order.total_cents)}</dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-caption text-muted-foreground">
        Mondays is a fictional store, so nothing will be charged or shipped.
      </p>
      <Button asChild variant="outline" className="mt-4">
        <Link href="/products">Keep shopping</Link>
      </Button>
    </div>
  );
}

function Detail({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium wrap-break-word">{children}</dd>
    </div>
  );
}
