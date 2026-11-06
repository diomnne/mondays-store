import type { Metadata } from "next";
import Link from "next/link";

import { Wordmark } from "@/components/shared/wordmark";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-5 px-4 py-20 text-center">
      <Link href="/" aria-label="Mondays home" className="text-[2rem]">
        <Wordmark />
      </Link>
      <h1 className="text-[2.5rem] leading-tight">Nothing here.</h1>
      <p className="text-lead text-muted-foreground">
        This page doesn&apos;t exist, or it&apos;s no longer available.
      </p>
      <Button asChild>
        <Link href="/products">Back to the shop</Link>
      </Button>
    </main>
  );
}
