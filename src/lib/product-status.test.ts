import { describe, expect, it } from "vitest";

import { categoryTheme, sortCategories } from "./category-theme";
import { productStatus, stockLabel } from "./product-status";

describe("stockLabel", () => {
  it("says in stock at 10 or more", () => {
    expect(stockLabel(10)).toBe("In stock");
    expect(stockLabel(40)).toBe("In stock");
  });

  it("warns when fewer than 10 are left", () => {
    expect(stockLabel(9)).toBe("Only 9 left");
    expect(stockLabel(1)).toBe("Only 1 left");
  });

  it("says out of stock at 0", () => {
    expect(stockLabel(0)).toBe("Out of stock");
  });
});

describe("productStatus", () => {
  it("is active when active with stock", () => {
    expect(productStatus({ is_active: true, stock: 3 })).toBe("active");
  });

  it("is out of stock when active with 0 stock", () => {
    expect(productStatus({ is_active: true, stock: 0 })).toBe("out_of_stock");
  });

  it("is inactive whenever the product is turned off, regardless of stock", () => {
    expect(productStatus({ is_active: false, stock: 10 })).toBe("inactive");
    expect(productStatus({ is_active: false, stock: 0 })).toBe("inactive");
  });
});

describe("categoryTheme", () => {
  it("maps the seeded categories to their brand colors, ignoring case", () => {
    expect(categoryTheme("Lips").gradient).toBe("bg-gradient-rose");
    expect(categoryTheme("face").gradient).toBe("bg-gradient-powder");
    expect(categoryTheme(" SKIN ").gradient).toBe("bg-gradient-sage");
  });

  it("falls back to the neutral gradient for unknown or missing categories", () => {
    expect(categoryTheme("Nails").gradient).toBe("bg-gradient-header");
    expect(categoryTheme(null).gradient).toBe("bg-gradient-header");
  });
});

describe("sortCategories", () => {
  it("puts Lips, Face, Skin first, then others alphabetically", () => {
    const sorted = sortCategories([
      { name: "Skin" },
      { name: "Nails" },
      { name: "Face" },
      { name: "Body" },
      { name: "Lips" },
    ]);
    expect(sorted.map((category) => category.name)).toEqual(["Lips", "Face", "Skin", "Body", "Nails"]);
  });
});
