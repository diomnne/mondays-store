import type { OrderStatus, PaymentMethod } from "@/types/order";

/**
 * Order status rules shown in the UI. The database (update_order_status RPC)
 * enforces the same rules; this module only decides what to offer and how to
 * label it.
 */

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "completed",
  "cancelled",
] as const satisfies readonly OrderStatus[];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Badge colors come from the status tokens in globals.css. */
export const ORDER_STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  pending: "bg-status-pending text-status-pending-foreground",
  confirmed: "bg-status-confirmed text-status-confirmed-foreground",
  preparing: "bg-status-preparing text-status-preparing-foreground",
  shipped: "bg-status-shipped text-status-shipped-foreground ring-1 ring-inset ring-ink",
  completed: "bg-status-completed text-status-completed-foreground",
  cancelled: "bg-status-cancelled text-status-cancelled-foreground",
};

export const PAYMENT_METHODS = [
  "cash_on_delivery",
  "e_wallet",
  "bank_transfer",
] as const satisfies readonly PaymentMethod[];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash_on_delivery: "Cash on Delivery",
  e_wallet: "E-Wallet",
  bank_transfer: "Bank Transfer",
};

/** The forward path. Each order moves one step at a time. */
const FORWARD_FLOW: readonly OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "completed",
];

/** Cancellation is only allowed before the order is being prepared. */
const CANCELLABLE: readonly OrderStatus[] = ["pending", "confirmed"];

/**
 * Statuses an admin may move an order to next. Completed and cancelled are
 * final, so they return an empty list.
 */
export function allowedNextStatuses(current: OrderStatus): OrderStatus[] {
  const next: OrderStatus[] = [];
  const position = FORWARD_FLOW.indexOf(current);
  if (position !== -1 && position < FORWARD_FLOW.length - 1) {
    next.push(FORWARD_FLOW[position + 1]);
  }
  if (CANCELLABLE.includes(current)) {
    next.push("cancelled");
  }
  return next;
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return allowedNextStatuses(from).includes(to);
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);
}
