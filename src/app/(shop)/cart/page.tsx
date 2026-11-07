import type { Metadata } from "next";

import { CartView } from "@/components/shop/cart-view";

export const metadata: Metadata = {
  title: "Cart",
};

/**
 * The cart lives in the browser (localStorage), so the page is a static shell
 * and CartView fills it in after loading current prices from the server.
 */
export default function CartPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12">
      <h1 className="mb-8 text-[clamp(2.5rem,7vw,4.5rem)] leading-none">Your cart</h1>
      <CartView />
    </div>
  );
}
