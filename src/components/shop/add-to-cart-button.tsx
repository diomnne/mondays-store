"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useCart } from "./cart-provider";

type AddToCartButtonProps = {
  productId: string;
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
 * Adds a product to the cart. Out-of-stock products get a disabled
 * "Out of stock" button. If the request goes past the available stock, the
 * cart is capped at the stock and the toast says so.
 */
export function AddToCartButton({
  productId,
  productName,
  stock,
  quantity = 1,
  variant = "secondary",
  size = "default",
  className,
}: AddToCartButtonProps) {
  const router = useRouter();
  const { add } = useCart();
  const outOfStock = stock <= 0;

  function handleClick() {
    const result = add(productId, quantity, stock);
    const viewCart = { label: "View cart", onClick: () => router.push("/cart") };

    if (result.added === 0) {
      toast.info(`Your cart already has all ${stock} ${productName}.`, { action: viewCart });
    } else if (result.capped) {
      toast.success("Added to cart", {
        description: `Only ${stock} ${productName} available, so your cart now has ${result.quantity}.`,
        action: viewCart,
      });
    } else {
      toast.success("Added to cart", {
        description: `${result.added} × ${productName}`,
        action: viewCart,
      });
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={outOfStock}
      onClick={handleClick}
      aria-label={outOfStock ? `${productName} is out of stock` : `Add ${quantity} ${productName} to cart`}
      className={cn("w-full", className)}
    >
      {outOfStock ? "Out of stock" : "Add to cart"}
    </Button>
  );
}
