import type { Metadata } from "next";

import { CheckoutView } from "@/components/shop/checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

/** Static shell; CheckoutView reads the cart and prices it from the server. */
export default function CheckoutPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12">
      <h1 className="mb-8 text-[clamp(2.5rem,7vw,4.5rem)] leading-none">Checkout</h1>
      <CheckoutView />
    </div>
  );
}
