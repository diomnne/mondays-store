import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Cart",
};

/**
 * Placeholder so the nav's Cart link goes somewhere real.
 * Replaced by the working cart in Phase 3.
 */
export default function CartPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-5 px-4 py-20 text-center">
      <h1 className="text-[clamp(2.25rem,6vw,3.5rem)] leading-tight">Your cart</h1>
      <p className="text-lead text-muted-foreground">
        The cart opens in the next update. For now, have a look around.
      </p>
      <Button asChild>
        <Link href="/products">Shop all</Link>
      </Button>
    </div>
  );
}
