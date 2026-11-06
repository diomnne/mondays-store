import { describe, expect, it } from "vitest";

import { categoryTheme } from "./category-theme";
import { productStatus } from "./product-status";

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
