"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

import {
  addToCart,
  cartItemCount,
  clearCart,
  removeLine,
  setLineQuantity,
  type AddResult,
} from "@/lib/cart";
import { getCartSnapshot, getServerCartSnapshot, subscribeToCart, writeCart } from "@/lib/cart-store";
import type { CartLine } from "@/types/cart";

type CartContextValue = {
  lines: CartLine[];
  /** False during the server render and hydration; true once the stored cart is read. */
  hydrated: boolean;
  itemCount: number;
  add: (productId: string, quantity: number, stock: number) => AddResult;
  setQuantity: (productId: string, quantity: number, stock?: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  /** Replaces every line, e.g. after the server says something changed. */
  replace: (lines: CartLine[]) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const noopSubscribe = () => () => {};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerCartSnapshot);
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  // Each action reads the latest stored cart, so two quick clicks can't
  // overwrite each other with a stale copy.
  const add = useCallback((productId: string, quantity: number, stock: number) => {
    const result = addToCart(getCartSnapshot(), productId, quantity, stock);
    if (result.added > 0) writeCart(result.lines);
    return result;
  }, []);
  const setQuantity = useCallback((productId: string, quantity: number, stock?: number) => {
    writeCart(setLineQuantity(getCartSnapshot(), productId, quantity, stock));
  }, []);
  const remove = useCallback((productId: string) => writeCart(removeLine(getCartSnapshot(), productId)), []);
  const clear = useCallback(() => writeCart(clearCart()), []);
  const replace = useCallback((next: CartLine[]) => writeCart(next), []);

  const value = useMemo<CartContextValue>(
    () => ({ lines, hydrated, itemCount: cartItemCount(lines), add, setQuantity, remove, clear, replace }),
    [lines, hydrated, add, setQuantity, remove, clear, replace],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>.");
  return context;
}
