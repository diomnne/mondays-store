import { CART_STORAGE_KEY, parseStoredCart, serializeCart } from "@/lib/cart";
import type { CartLine } from "@/types/cart";

/**
 * A tiny external store around localStorage, read with React's
 * useSyncExternalStore (see cart-provider.tsx).
 *
 * Why this shape:
 * - Hydration-safe: the server snapshot is always the empty cart, so the
 *   first client render matches the server HTML; React then re-renders with
 *   the stored cart.
 * - Cross-tab sync: the browser fires a `storage` event in *other* tabs when
 *   this key changes, and we notify subscribers so their UI updates.
 * - Storage can be unavailable (private mode, blocked site data), so every
 *   access is wrapped in try/catch and falls back to an empty cart.
 */

const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();

// Cache the parsed lines per raw string so getSnapshot returns the same array
// until storage actually changes (useSyncExternalStore requires this).
let cachedRaw: string | null | undefined;
let cachedLines: CartLine[] = EMPTY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(CART_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getCartSnapshot(): CartLine[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedLines = parseStoredCart(raw);
  }
  return cachedLines;
}

export function getServerCartSnapshot(): CartLine[] {
  return EMPTY;
}

export function writeCart(lines: readonly CartLine[]): void {
  try {
    if (lines.length === 0) window.localStorage.removeItem(CART_STORAGE_KEY);
    else window.localStorage.setItem(CART_STORAGE_KEY, serializeCart(lines));
  } catch {
    // Storage full or blocked: keep going with what we have in memory.
  }
  listeners.forEach((notify) => notify());
}

export function subscribeToCart(notify: () => void): () => void {
  listeners.add(notify);
  const onStorage = (event: StorageEvent) => {
    // key is null when another tab calls localStorage.clear().
    if (event.key === CART_STORAGE_KEY || event.key === null) notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}
