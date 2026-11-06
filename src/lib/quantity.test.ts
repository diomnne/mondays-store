import { describe, expect, it } from "vitest";

import { clampQuantity } from "./quantity";

describe("clampQuantity", () => {
  it("keeps valid quantities as they are", () => {
    expect(clampQuantity(3, 10)).toBe(3);
    expect(clampQuantity(10, 10)).toBe(10);
  });

  it("raises zero and negatives to 1", () => {
    expect(clampQuantity(0, 10)).toBe(1);
    expect(clampQuantity(-4, 10)).toBe(1);
  });

  it("caps at the available stock", () => {
    expect(clampQuantity(25, 9)).toBe(9);
  });

  it("drops fractions and treats junk as 1", () => {
    expect(clampQuantity(2.7, 10)).toBe(2);
    expect(clampQuantity(Number.NaN, 10)).toBe(1);
  });

  it("returns 0 when nothing is in stock", () => {
    expect(clampQuantity(1, 0)).toBe(0);
  });
});
