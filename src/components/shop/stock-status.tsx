import { LOW_STOCK_THRESHOLD, PRODUCT_STATUS_BADGE_CLASSES, stockLabel } from "@/lib/product-status";
import { cn } from "@/lib/utils";

/** "In stock", "Only N left", or an "Out of stock" badge. */
export function StockStatus({ stock, className }: { stock: number; className?: string }) {
  if (stock <= 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium",
          PRODUCT_STATUS_BADGE_CLASSES.out_of_stock,
          className,
        )}
      >
        {stockLabel(stock)}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "text-caption",
        stock < LOW_STOCK_THRESHOLD ? "font-medium text-status-preparing-foreground" : "text-muted-foreground",
        className,
      )}
    >
      {stockLabel(stock)}
    </span>
  );
}
