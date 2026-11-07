import { ORDER_STATUS_BADGE_CLASSES, ORDER_STATUS_LABELS } from "@/lib/order-status";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

/** Order status pill in the brand's status colors. */
export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium whitespace-nowrap",
        ORDER_STATUS_BADGE_CLASSES[status],
        className,
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
