import { describe, expect, it } from "vitest";

import {
  MAX_SEARCH_LENGTH,
  buildProductsHref,
  escapeLikePattern,
  parseProductFilters,
} from "./product-filters";

describe("parseProductFilters", () => {
  it("returns defaults when nothing is set", () => {
    expect(parseProductFilters({})).toEqual({ q: "", category: "", sort: "name" });
  });

  it("trims search text and lowercases the category", () => {
    expect(parseProductFilters({ q: "  Tint ", category: " LIPS " })).toEqual({
      q: "Tint",
      category: "lips",
      sort: "name",
    });
  });

  it("accepts known sorts and falls back on unknown ones", () => {
    expect(parseProductFilters({ sort: "price-desc" }).sort).toBe("price-desc");
    expect(parseProductFilters({ sort: "cheapest" }).sort).toBe("name");
  });

  it("uses the first value when a param is repeated", () => {
    expect(parseProductFilters({ q: ["gloss", "balm"] }).q).toBe("gloss");
  });

  it("caps very long search text", () => {
    expect(parseProductFilters({ q: "a".repeat(500) }).q).toHaveLength(MAX_SEARCH_LENGTH);
  });
});

describe("buildProductsHref", () => {
  it("returns the bare listing URL with no filters", () => {
    expect(buildProductsHref({})).toBe("/products");
    expect(buildProductsHref({ q: "", category: "", sort: "name" })).toBe("/products");
  });

  it("includes only the filters that are set", () => {
    expect(buildProductsHref({ category: "lips" })).toBe("/products?category=lips");
    expect(buildProductsHref({ q: "lip tint", category: "lips", sort: "price-asc" })).toBe(
      "/products?q=lip+tint&category=lips&sort=price-asc",
    );
  });
});

describe("escapeLikePattern", () => {
  it("escapes LIKE wildcards and backslashes", () => {
    expect(escapeLikePattern("50%_off\\")).toBe("50\\%\\_off\\\\");
  });

  it("leaves ordinary text alone", () => {
    expect(escapeLikePattern("Monday Tint")).toBe("Monday Tint");
  });
});
