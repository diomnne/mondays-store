/**
 * Money is stored and calculated as integer centavos (PHP 120.00 = 12000).
 * Integers add and multiply exactly, so totals never pick up floating-point
 * drift like 0.1 + 0.2 = 0.30000000000000004. Converting to pesos happens
 * only when formatting for display.
 */

const groupThousands = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function assertCents(value: number, label: string): void {
  if (!Number.isSafeInteger(value)) {
    throw new TypeError(`${label} must be a whole number of centavos, got ${value}`);
  }
}

/** Formats centavos for display: 107700 → "PHP 1,077.00". */
export function formatPHP(cents: number): string {
  assertCents(cents, "Amount");
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  // Split into whole pesos and leftover centavos with integer math only.
  const pesos = Math.floor(absolute / 100);
  const centavos = absolute % 100;
  return `${sign}PHP ${groupThousands.format(pesos)}.${String(centavos).padStart(2, "0")}`;
}

/** Unit price × quantity, in centavos. */
export function lineTotal(unitPriceCents: number, quantity: number): number {
  assertCents(unitPriceCents, "Unit price");
  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    throw new TypeError(`Quantity must be a whole number of at least 0, got ${quantity}`);
  }
  return unitPriceCents * quantity;
}

/** Adds centavo amounts, e.g. line totals into a cart total. */
export function sumCents(amounts: readonly number[]): number {
  return amounts.reduce((total, amount) => {
    assertCents(amount, "Amount");
    return total + amount;
  }, 0);
}
