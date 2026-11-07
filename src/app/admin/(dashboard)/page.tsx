import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { requireAdmin } from "@/lib/auth/session";
import { getDashboardStats, getRecentOrders, getStockWatch } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/dates";
import { formatPHP } from "@/lib/money";
import { PRODUCT_STATUS_BADGE_CLASSES, stockLabel } from "@/lib/product-status";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  // Authorization first, before any data is read (the proxy is not enough on its own).
  await requireAdmin();

  const [stats, recentOrders, stockWatch] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(5),
    getStockWatch(),
  ]);

  // Labels and definitions as the brief defines them; figures come from the dashboard_stats view.
  const cards = [
    { label: "Total products", value: String(stats.total_products), note: "Includes inactive products" },
    { label: "Total orders", value: String(stats.total_orders), note: "Includes cancelled orders" },
    { label: "Pending orders", value: String(stats.pending_orders), note: "Waiting to be confirmed" },
    { label: "Completed orders", value: String(stats.completed_orders), note: "Delivered and closed" },
    { label: "Total customers", value: String(stats.total_customers), note: "Unique checkout emails" },
    { label: "Total sales", value: formatPHP(stats.total_sales_cents), note: "Completed orders only" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-[clamp(2.25rem,5vw,3rem)] leading-tight">Overview</h1>
        <p className="text-muted-foreground">Live figures from the store. Refresh to update.</p>
      </header>

      <section aria-labelledby="figures-heading">
        <h2 id="figures-heading" className="sr-only">
          Store figures
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} className="rounded-card border bg-card p-5 sm:p-6">
              <dt className="font-medium">{card.label}</dt>
              <dd className="mt-2 font-heading text-[2.25rem] leading-none">{card.value}</dd>
              <dd className="mt-2 text-caption text-muted-foreground">{card.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <section aria-labelledby="recent-heading" className="rounded-card border bg-card p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 id="recent-heading" className="text-title">
              Recent orders
            </h2>
            <Link
              href="/admin/orders"
              className="inline-flex min-h-11 items-center gap-1.5 text-caption font-medium underline underline-offset-4"
            >
              All orders <ArrowRightIcon aria-hidden="true" className="size-4" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="divide-y">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="-mx-2 flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1 rounded-xl px-2 py-3 hover:bg-muted"
                  >
                    {/* Full width on phones (total and status wrap below); one line from sm up. */}
                    <span className="min-w-0 basis-full sm:basis-0 sm:flex-1">
                      <span className="block font-medium">
                        {order.order_number}
                        <span className="sr-only">, view details</span>
                      </span>
                      <span className="block text-caption text-muted-foreground">
                        {order.customer_name} · {formatDateTime(order.created_at)}
                      </span>
                    </span>
                    <span className="font-medium">{formatPHP(order.total_cents)}</span>
                    <OrderStatusBadge status={order.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="stock-heading" className="rounded-card border bg-card p-5 sm:p-6">
          <h2 id="stock-heading" className="text-title">
            Stock watch
          </h2>
          <p className="mb-4 text-caption text-muted-foreground">Active products with fewer than 10 left.</p>
          {stockWatch.length === 0 ? (
            <p className="text-muted-foreground">Everything active has 10 or more in stock.</p>
          ) : (
            <ul className="divide-y">
              {stockWatch.map((product) => (
                <li key={product.id} className="flex min-h-11 items-center justify-between gap-3 py-2.5">
                  <span className="font-medium">{product.name}</span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-caption font-medium whitespace-nowrap",
                      product.stock <= 0
                        ? PRODUCT_STATUS_BADGE_CLASSES.out_of_stock
                        : "bg-status-pending text-status-pending-foreground",
                    )}
                  >
                    {stockLabel(product.stock)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
