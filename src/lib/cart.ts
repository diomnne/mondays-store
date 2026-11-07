import { formatPHP, lineTotal, sumCents } from "@/lib/money";
import { clampQuantity } from "@/lib/quantity";
import { MAX_CART_LINES, MAX_LINE_QUANTITY, cartLineSchema } from "@/lib/validation/cart";
import type { CartLine, ResolvedCartLine } from "@/types/cart";
import type { CartChange } from "@/types/order";

/**
 * Pure cart logic. Every function takes the current lines and returns new
 * ones (never mutates), so it's easy to test and safe to use from React state.
 * Reading and writing localStorage lives in cart-store.ts.
 */

/** Versioned so a future shape change can ignore old data instead of misreading it. */
export const CART_STORAGE_KEY = "mondays.cart.v1";

// ---------------------------------------------------------------------------
// Storage format
// ---------------------------------------------------------------------------

/**
 * Turns whatever is in storage into valid cart lines. Anything malformed
 * (bad JSON, wrong shape, bad ids, fractional or negative quantities) is
 * dropped rather than crashing the shop. Duplicate ids are merged.
 */
export function parseStoredCart(raw: string | null): CartLine[] {
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  let lines: CartLine[] = [];
  for (const entry of parsed) {
    const result = cartLineSchema.safeParse(entry);
    if (!result.success) continue;
    lines = mergeLine(lines, result.data.productId, result.data.quantity, MAX_LINE_QUANTITY);
  }
  return lines.slice(0, MAX_CART_LINES);
}

/** Only ids and quantities are ever written: never prices or names. */
export function serializeCart(lines: readonly CartLine[]): string {
  return JSON.stringify(lines.map(({ productId, quantity }) => ({ productId, quantity })));
}

// ---------------------------------------------------------------------------
// Editing
// ---------------------------------------------------------------------------

function mergeLine(lines: readonly CartLine[], productId: string, quantity: number, max: number): CartLine[] {
  const existing = lines.find((line) => line.productId === productId);
  if (!existing) return [...lines, { productId, quantity: Math.min(quantity, max) }];
  return lines.map((line) =>
    line.productId === productId ? { ...line, quantity: Math.min(line.quantity + quantity, max) } : line,
  );
}

export type AddResult = {
  lines: CartLine[];
  /** How many were actually added (0 if the cart already held all the stock). */
  added: number;
  /** The line's quantity after adding. */
  quantity: number;
  /** True when the request was cut down to the available stock. */
  capped: boolean;
};

/**
 * Adds a product. If it's already in the cart, its quantity goes up instead
 * of creating a second line. The total is capped at the available stock.
 */
export function addToCart(lines: readonly CartLine[], productId: string, quantity: number, stock: number): AddResult {
  const current = lines.find((line) => line.productId === productId)?.quantity ?? 0;
  const requested = current + Math.max(Math.trunc(quantity), 0);
  const ceiling = Math.min(Math.floor(stock), MAX_LINE_QUANTITY);

  // Nothing in stock, or the cart already holds all of it: nothing to add.
  if (ceiling < 1 || current >= ceiling) {
    return { lines: [...lines], added: 0, quantity: current, capped: true };
  }
  if (requested <= current) {
    return { lines: [...lines], added: 0, quantity: current, capped: false };
  }

  const next = Math.min(requested, ceiling);
  const updated =
    current === 0
      ? [...lines, { productId, quantity: next }]
      : lines.map((line) => (line.productId === productId ? { ...line, quantity: next } : line));
  return { lines: updated, added: next - current, quantity: next, capped: requested > ceiling };
}

/** Sets a line's quantity, kept within 1..stock (or 1..999 when stock is unknown). */
export function setLineQuantity(
  lines: readonly CartLine[],
  productId: string,
  quantity: number,
  stock: number = MAX_LINE_QUANTITY,
): CartLine[] {
  const next = clampQuantity(quantity, Math.min(stock, MAX_LINE_QUANTITY));
  if (next === 0) return removeLine(lines, productId);
  return lines.map((line) => (line.productId === productId ? { ...line, quantity: next } : line));
}

export function removeLine(lines: readonly CartLine[], productId: string): CartLine[] {
  return lines.filter((line) => line.productId !== productId);
}

export function clearCart(): CartLine[] {
  return [];
}

/** Total number of units, for the nav badge. */
export function cartItemCount(lines: readonly CartLine[]): number {
  return lines.reduce((count, line) => count + line.quantity, 0);
}

export function sameLines(a: readonly CartLine[], b: readonly CartLine[]): boolean {
  return a.length === b.length && a.every((line, i) => line.productId === b[i].productId && line.quantity === b[i].quantity);
}

// ---------------------------------------------------------------------------
// Totals (all integer centavos)
// ---------------------------------------------------------------------------

export type PricedLine = { unitPriceCents: number; quantity: number };

/** Line totals and the cart total. Subtotal equals total: no shipping, tax, or fees. */
export function cartTotals(lines: readonly PricedLine[]): { lineTotals: number[]; subtotal: number; total: number } {
  const lineTotals = lines.map((line) => lineTotal(line.unitPriceCents, line.quantity));
  const subtotal = sumCents(lineTotals);
  return { lineTotals, subtotal, total: subtotal };
}

// ---------------------------------------------------------------------------
// Reconciling with the server
// ---------------------------------------------------------------------------

export type CartUpdate = { lines: CartLine[]; notices: string[] };

/**
 * Applies a fresh server check of the cart: unavailable lines are removed,
 * lines over the stock are lowered to it (or removed at 0 stock), and each
 * change gets a plain-language notice.
 */
export function applyResolution(lines: readonly CartLine[], resolved: readonly ResolvedCartLine[]): CartUpdate {
  const byId = new Map(resolved.map((line) => [line.productId, line]));
  const notices: string[] = [];
  const next: CartLine[] = [];

  for (const line of lines) {
    const check = byId.get(line.productId);
    if (!check || check.status === "ok") {
      next.push(line);
      continue;
    }
    const name = check.product?.name ?? "An item";
    if (check.status === "unavailable") {
      notices.push(`${name} is no longer available, so it was removed from your cart.`);
    } else if (!check.product || check.product.stock <= 0) {
      notices.push(`${name} is out of stock, so it was removed from your cart.`);
    } else {
      const stock = check.product.stock;
      notices.push(`Only ${stock} of ${name} left, so your quantity went from ${line.quantity} to ${stock}.`);
      next.push({ ...line, quantity: stock });
    }
  }
  return { lines: next, notices };
}

/**
 * Turns a place_order `cart_changed` response into cart updates and notices.
 * Price changes don't change the cart (it stores no prices); they're reported
 * so the customer can review the new total before ordering again.
 */
export function applyCartChanges(lines: readonly CartLine[], changes: readonly CartChange[]): CartUpdate {
  let next = [...lines];
  const notices: string[] = [];

  for (const change of changes) {
    switch (change.reason) {
      case "unavailable":
        next = removeLine(next, change.product_id);
        notices.push(`${change.name ?? "An item"} is no longer available, so it was removed from your cart.`);
        break;
      case "insufficient_stock":
        if (change.available_stock <= 0) {
          next = removeLine(next, change.product_id);
          notices.push(`${change.name} is out of stock, so it was removed from your cart.`);
        } else {
          next = next.map((line) =>
            line.productId === change.product_id ? { ...line, quantity: change.available_stock } : line,
          );
          notices.push(
            `Only ${change.available_stock} of ${change.name} left, so your quantity went from ${change.requested} to ${change.available_stock}.`,
          );
        }
        break;
      case "price_changed":
        notices.push(
          `${change.name} changed price from ${formatPHP(change.old_price_cents)} to ${formatPHP(change.new_price_cents)}.`,
        );
        break;
    }
  }
  return { lines: next, notices };
}
