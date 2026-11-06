"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/** Catches unexpected errors (for example, the database is unreachable). */
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-5 px-4 py-20 text-center">
      <h1 className="text-[2.5rem] leading-tight">Something went wrong.</h1>
      <p className="text-lead text-muted-foreground">
        We couldn&apos;t load this page. Give it another go in a moment.
      </p>
      <Button onClick={() => retry()}>Try again</Button>
    </main>
  );
}
