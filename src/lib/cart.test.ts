import { describe, expect, it } from "vitest";

import {
  addToCart,
  applyCartChanges,
  applyResolution,
  cartItemCount,
  cartTotals,
  parseStoredCart,
  removeLine,
  serializeCart,
  setLineQuantity,
} from "./cart";
import { formatPHP } from "./money";
import type { CartLine, CartProduct, ResolvedCartLine } from "@/types/cart";

const TINT = "a0000000-0000-4000-8000-000000000001";
const GLOSS = "a0000000-0000-4000-8000-000000000002";
const BALM = "a0000000-0000-4000-8000-000000000004";

describe("parseStoredCart", () => {
  it("reads valid stored lines", () => {
    expect(parseStoredCart(JSON.stringify([{ productId: TINT, quantity: 2 }]))).toEqual([
      { productId: TINT, quantity: 2 },
    ]);
  });

  it("returns an empty cart for missing or malformed data instead of throwing", () => {
    expect(parseStoredCart(null)).toEqual([]);
    expect(parseStoredCart("")).toEqual([]);
    expect(parseStoredCart("{not json")).toEqual([]);
    expect(parseStoredCart(JSON.stringify({ productId: TINT, quantity: 1 }))).toEqual([]);
    expect(parseStoredCart("42")).toEqual([]);
  });

  it("drops bad entries and keeps the good ones", () => {
    const raw = JSON.stringify([
      { productId: TINT, quantity: 1 },
      { productId: "not-a-uuid", quantity: 1 },
      { productId: GLOSS, quantity: 0 },
      { productId: GLOSS, quantity: -2 },
      { productId: GLOSS, quantity: 1.5 },
      { productId: GLOSS, quantity: "3" },
      { productId: BALM },
      null,
      "junk",
    ]);
    expect(parseStoredCart(raw)).toEqual([{ productId: TINT, quantity: 1 }]);
  });

  it("merges duplicate ids", () => {
    const raw = JSON.stringify([
      { productId: TINT, quantity: 1 },
      { productId: TINT, quantity: 2 },
    ]);
    expect(parseStoredCart(raw)).toEqual([{ productId: TINT, quantity: 3 }]);
  });

  it("ignores extra fields such as a stored price", () => {
    const raw = JSON.stringify([{ productId: TINT, quantity: 1, price_cents: 1 }]);
    expect(parseStoredCart(raw)).toEqual([{ productId: TINT, quantity: 1 }]);
  });
});

describe("serializeCart", () => {
  it("writes ids and quantities only", () => {
    const line = { productId: TINT, quantity: 2, name: "Monday Tint" } as CartLine;
    expect(JSON.parse(serializeCart([line]))).toEqual([{ productId: TINT, quantity: 2 }]);
  });
});

describe("addToCart", () => {
  it("adds a new line", () => {
    const result = addToCart([], TINT, 2, 24);
    expect(result).toEqual({ lines: [{ productId: TINT, quantity: 2 }], added: 2, quantity: 2, capped: false });
  });

  it("increases the quantity of an existing line instead of duplicating it", () => {
    const result = addToCart([{ productId: TINT, quantity: 2 }], TINT, 1, 24);
    expect(result.lines).toEqual([{ productId: TINT, quantity: 3 }]);
    expect(result.added).toBe(1);
  });

  it("caps at the available stock and says so", () => {
    const result = addToCart([{ productId: TINT, quantity: 7 }], TINT, 5, 9);
    expect(result.lines).toEqual([{ productId: TINT, quantity: 9 }]);
    expect(result).toMatchObject({ added: 2, quantity: 9, capped: true });
  });

  it("adds nothing when the cart already holds all the stock", () => {
    const result = addToCart([{ productId: TINT, quantity: 9 }], TINT, 1, 9);
    expect(result).toMatchObject({ added: 0, quantity: 9, capped: true });
  });

  it("adds nothing for an out-of-stock product", () => {
    const result = addToCart([], TINT, 1, 0);
    expect(result).toMatchObject({ lines: [], added: 0, capped: true });
  });

  it("does not mutate the original lines", () => {
    const lines = [{ productId: TINT, quantity: 1 }];
    addToCart(lines, TINT, 1, 24);
    expect(lines).toEqual([{ productId: TINT, quantity: 1 }]);
  });
});

describe("setLineQuantity", () => {
  const lines = [{ productId: TINT, quantity: 2 }];

  it("sets a valid quantity", () => {
    expect(setLineQuantity(lines, TINT, 5, 24)).toEqual([{ productId: TINT, quantity: 5 }]);
  });

  it("keeps the quantity a whole number between 1 and stock", () => {
    expect(setLineQuantity(lines, TINT, 50, 9)).toEqual([{ productId: TINT, quantity: 9 }]);
    expect(setLineQuantity(lines, TINT, 0, 9)).toEqual([{ productId: TINT, quantity: 1 }]);
    expect(setLineQuantity(lines, TINT, 2.8, 9)).toEqual([{ productId: TINT, quantity: 2 }]);
  });

  it("removes the line when nothing is in stock", () => {
    expect(setLineQuantity(lines, TINT, 1, 0)).toEqual([]);
  });
});

describe("removeLine and cartItemCount", () => {
  const lines = [
    { productId: TINT, quantity: 2 },
    { productId: GLOSS, quantity: 1 },
  ];

  it("removes only the chosen line", () => {
    expect(removeLine(lines, TINT)).toEqual([{ productId: GLOSS, quantity: 1 }]);
  });

  it("counts units, not lines", () => {
    expect(cartItemCount(lines)).toBe(3);
    expect(cartItemCount([])).toBe(0);
  });
});

describe("cartTotals", () => {
  it("passes the brief's example: 2 × PHP 120.00 + 1 × PHP 85.50 = PHP 325.50", () => {
    const totals = cartTotals([
      { unitPriceCents: 12000, quantity: 2 },
      { unitPriceCents: 8550, quantity: 1 },
    ]);
    expect(totals.lineTotals).toEqual([24000, 8550]);
    expect(totals.subtotal).toBe(32550);
    expect(totals.total).toBe(totals.subtotal);
    expect(formatPHP(totals.total)).toBe("PHP 325.50");
  });
});

function product(overrides: Partial<CartProduct>): CartProduct {
  return {
    id: TINT,
    name: "Monday Tint",
    slug: "monday-tint",
    imageSrc: null,
    categoryName: "Lips",
    priceCents: 34900,
    stock: 24,
    isActive: true,
    ...overrides,
  };
}

describe("applyResolution", () => {
  it("leaves the cart alone when everything is fine", () => {
    const lines = [{ productId: TINT, quantity: 2 }];
    const resolved: ResolvedCartLine[] = [{ productId: TINT, quantity: 2, status: "ok", product: product({}) }];
    expect(applyResolution(lines, resolved)).toEqual({ lines, notices: [] });
  });

  it("removes unavailable lines and lowers over-stock lines, with a notice for each", () => {
    const lines = [
      { productId: TINT, quantity: 12 },
      { productId: GLOSS, quantity: 1 },
      { productId: BALM, quantity: 2 },
    ];
    const resolved: ResolvedCartLine[] = [
      { productId: TINT, quantity: 12, status: "over_stock", product: product({ stock: 9 }) },
      { productId: GLOSS, quantity: 1, status: "unavailable", product: product({ id: GLOSS, name: "Friday Gloss", isActive: false }) },
      { productId: BALM, quantity: 2, status: "over_stock", product: product({ id: BALM, name: "Sunday Balm", stock: 0 }) },
    ];
    const result = applyResolution(lines, resolved);
    expect(result.lines).toEqual([{ productId: TINT, quantity: 9 }]);
    expect(result.notices).toEqual([
      "Only 9 of Monday Tint left, so your quantity went from 12 to 9.",
      "Friday Gloss is no longer available, so it was removed from your cart.",
      "Sunday Balm is out of stock, so it was removed from your cart.",
    ]);
  });

  it("handles a product that was deleted entirely", () => {
    const lines = [{ productId: TINT, quantity: 1 }];
    const resolved: ResolvedCartLine[] = [{ productId: TINT, quantity: 1, status: "unavailable", product: null }];
    expect(applyResolution(lines, resolved)).toEqual({
      lines: [],
      notices: ["An item is no longer available, so it was removed from your cart."],
    });
  });
});

describe("applyCartChanges", () => {
  const lines = [
    { productId: TINT, quantity: 2 },
    { productId: GLOSS, quantity: 5 },
    { productId: BALM, quantity: 1 },
  ];

  it("reports price changes without changing the cart", () => {
    const result = applyCartChanges(lines, [
      { reason: "price_changed", product_id: TINT, name: "Monday Tint", old_price_cents: 34900, new_price_cents: 39900 },
    ]);
    expect(result.lines).toEqual(lines);
    expect(result.notices).toEqual(["Monday Tint changed price from PHP 349.00 to PHP 399.00."]);
  });

  it("lowers quantities to what's left, and removes out-of-stock and unavailable lines", () => {
    const result = applyCartChanges(lines, [
      { reason: "insufficient_stock", product_id: GLOSS, name: "Friday Gloss", available_stock: 3, requested: 5 },
      { reason: "insufficient_stock", product_id: BALM, name: "Sunday Balm", available_stock: 0, requested: 1 },
      { reason: "unavailable", product_id: TINT, name: null },
    ]);
    expect(result.lines).toEqual([{ productId: GLOSS, quantity: 3 }]);
    expect(result.notices).toEqual([
      "Only 3 of Friday Gloss left, so your quantity went from 5 to 3.",
      "Sunday Balm is out of stock, so it was removed from your cart.",
      "An item is no longer available, so it was removed from your cart.",
    ]);
  });
});
