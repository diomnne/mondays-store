"use client";

import { useCallback, useEffect, useState } from "react";

import { resolveCartAction } from "@/lib/actions/cart";
import { applyResolution, sameLines, serializeCart } from "@/lib/cart";
import type { CartLine, CartProduct } from "@/types/cart";

import { useCart } from "./cart-provider";

export type ResolvedCartStatus = "loading" | "empty" | "ready" | "error";

export type CartItemView = { line: CartLine; product: CartProduct | undefined };

/**
 * Loads current product data for the stored cart from the server, and keeps
 * the cart honest: unavailable lines are removed and over-stock lines are
 * lowered, each with a notice. Runs again whenever the cart changes.
 *
 * Prices shown anywhere in the cart or checkout come from here, never from
 * storage.
 */
export function useResolvedCart() {
  const { lines, hydrated, replace } = useCart();
  const [products, setProducts] = useState<Record<string, CartProduct>>({});
  const [notices, setNotices] = useState<string[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);
  // Which cart contents (+ refresh count) the current data or error belongs to.
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const requestKey = `${serializeCart(lines)}#${refreshCount}`;

  useEffect(() => {
    if (!hydrated || lines.length === 0) return;

    let cancelled = false; // ignore answers to an outdated cart
    const key = `${serializeCart(lines)}#${refreshCount}`;

    resolveCartAction(lines)
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setErrorKey(key);
          return;
        }
        setProducts((previous) => {
          const next = { ...previous };
          for (const resolved of result.lines) {
            if (resolved.product) next[resolved.productId] = resolved.product;
          }
          return next;
        });

        const update = applyResolution(lines, result.lines);
        if (update.notices.length > 0) setNotices((previous) => [...previous, ...update.notices]);
        if (!sameLines(update.lines, lines)) {
          // Writing the corrected cart changes `lines`, which runs this effect
          // once more; that second check finds nothing to change.
          replace(update.lines);
        }
        setResolvedKey(key);
      })
      .catch(() => {
        // Network failure: keep the cart as it is and offer a retry.
        if (!cancelled) setErrorKey(key);
      });

    return () => {
      cancelled = true;
    };
  }, [lines, hydrated, refreshCount, replace]);

  let status: ResolvedCartStatus = "loading";
  if (hydrated && lines.length === 0) status = "empty";
  else if (resolvedKey === requestKey) status = "ready";
  else if (errorKey === requestKey) status = "error";

  const items: CartItemView[] = lines.map((line) => ({ line, product: products[line.productId] }));

  return {
    status,
    items,
    notices,
    /** Fetch fresh prices again, e.g. after checkout reports a price change. */
    refresh: useCallback(() => setRefreshCount((count) => count + 1), []),
    addNotices: useCallback((more: string[]) => setNotices((previous) => [...previous, ...more]), []),
    dismissNotices: useCallback(() => setNotices([]), []),
  };
}
