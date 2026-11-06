"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AddToCartButtonProps = {
  productName: string;
  stock: number;
  /** How many to add; the details page passes the selected quantity. */
  quantity?: number;
  /** Glass on product tiles (over color), ink everywhere else. */
  variant?: "glass" | "secondary";
  size?: "default" | "sm";
  className?: string;
};

/**
 * Add to cart. Out-of-stock products get a disabled "Out of stock" button.
 *
 * Phase 2: the cart doesn't exist yet, so in-stock buttons are disabled too
 * (with a tooltip saying why) instead of pretending to add anything. Phase 3
 * replaces this with the real cart action.
 */
export function AddToCartButton({
  productName,
  stock,
  quantity = 1,
  variant = "secondary",
  size = "default",
  className,
}: AddToCartButtonProps) {
  const outOfStock = stock <= 0;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled
      title={outOfStock ? undefined : "The cart opens in the next update"}
      aria-label={
        outOfStock
          ? `${productName} is out of stock`
          : `Add ${quantity} ${productName} to cart (not available yet)`
      }
      data-quantity={quantity}
      className={cn("w-full", className)}
    >
      {outOfStock ? "Out of stock" : "Add to cart"}
    </Button>
  );
}
