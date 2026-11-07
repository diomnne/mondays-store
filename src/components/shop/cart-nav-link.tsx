"use client";

import Link from "next/link";
import { ShoppingBagIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useCart } from "./cart-provider";

/**
 * Cart button in the nav with a lilac count badge. The count is 0 during the
 * server render and hydration, then shows the stored total, so server and
 * client HTML always match.
 */
export function CartNavLink() {
  const { itemCount } = useCart();
  const label = itemCount === 0 ? "Cart, empty" : `Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  return (
    <Button asChild variant="secondary" className="relative">
      <Link href="/cart" aria-label={label}>
        <ShoppingBagIcon aria-hidden="true" />
        Cart
        {itemCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-lilac px-1.5 text-caption font-bold text-ink ring-2 ring-background"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
