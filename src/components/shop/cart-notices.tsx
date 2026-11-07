"use client";

import { useEffect, useRef } from "react";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type CartNoticesProps = {
  notices: string[];
  title?: string;
  onDismiss?: () => void;
};

/**
 * Lists what changed in the cart (removed, lowered, repriced). When new
 * notices arrive it moves focus here, so the change is both seen and read
 * out by screen readers.
 */
export function CartNotices({ notices, title = "Your cart was updated", onDismiss }: CartNoticesProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (notices.length > 0) ref.current?.focus();
  }, [notices.length]);

  if (notices.length === 0) return null;

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="relative rounded-card border border-status-pending-foreground/25 bg-status-pending p-5 pr-14 text-status-pending-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring"
    >
      <h2 className="mb-2 font-sans text-body font-bold">{title}</h2>
      <ul className="list-disc space-y-1 pl-5">
        {notices.map((notice, index) => (
          <li key={`${index}-${notice}`}>{notice}</li>
        ))}
      </ul>
      {onDismiss && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          aria-label="Dismiss cart updates"
          className="absolute top-1.5 right-1.5"
        >
          <XIcon aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
