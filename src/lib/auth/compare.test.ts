import { describe, expect, it } from "vitest";

import { safeEqual } from "./compare";

describe("safeEqual", () => {
  it("matches identical strings", () => {
    expect(safeEqual("mondays-demo", "mondays-demo")).toBe(true);
  });

  it("rejects different strings, including different lengths and case", () => {
    expect(safeEqual("mondays-demo", "mondays-demO")).toBe(false);
    expect(safeEqual("mondays-demo", "mondays-demo ")).toBe(false);
    expect(safeEqual("mondays-demo", "")).toBe(false);
  });
});
