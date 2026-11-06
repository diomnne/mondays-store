/**
 * Keeps a requested quantity within 1..max as a whole number.
 * Used by the quantity selector now and the cart in Phase 3.
 * Returns 0 only when nothing can be ordered (max below 1).
 */
export function clampQuantity(requested: number, max: number): number {
  const ceiling = Math.floor(max);
  if (!Number.isFinite(ceiling) || ceiling < 1) return 0;
  if (!Number.isFinite(requested)) return 1;
  return Math.min(Math.max(Math.trunc(requested), 1), ceiling);
}
