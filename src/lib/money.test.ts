import { describe, expect, it } from "vitest";

import { formatPHP, lineTotal, sumCents } from "./money";

describe("formatPHP", () => {
  it("formats with the PHP prefix, thousands separators, and two decimals", () => {
    expect(formatPHP(107700)).toBe("PHP 1,077.00");
    expect(formatPHP(12345678)).toBe("PHP 123,456.78");
  });

  it("always shows two decimals for small amounts", () => {
    expect(formatPHP(0)).toBe("PHP 0.00");
    expect(formatPHP(5)).toBe("PHP 0.05");
    expect(formatPHP(8550)).toBe("PHP 85.50");
  });

  it("puts the sign before the prefix for negative amounts", () => {
    expect(formatPHP(-1050)).toBe("-PHP 10.50");
  });

  it("rejects amounts that are not whole centavos", () => {
    expect(() => formatPHP(85.5)).toThrow(TypeError);
    expect(() => formatPHP(Number.NaN)).toThrow(TypeError);
  });
});

describe("lineTotal", () => {
  it("multiplies unit price by quantity", () => {
    expect(lineTotal(12000, 2)).toBe(24000);
    expect(lineTotal(8550, 1)).toBe(8550);
    expect(lineTotal(8550, 0)).toBe(0);
  });

  it("rejects fractional or negative quantities", () => {
    expect(() => lineTotal(12000, 1.5)).toThrow(TypeError);
    expect(() => lineTotal(12000, -1)).toThrow(TypeError);
  });
});

describe("sumCents", () => {
  it("returns 0 for no amounts", () => {
    expect(sumCents([])).toBe(0);
  });

  it("adds exactly where floating-point pesos would drift", () => {
    // 0.1 + 0.2 !== 0.3 in floating point, but 10 + 20 centavos is exactly 30.
    expect(sumCents([10, 20])).toBe(30);
  });

  it("passes the brief's example: 2 × PHP 120.00 + 1 × PHP 85.50 = PHP 325.50", () => {
    const total = sumCents([lineTotal(12000, 2), lineTotal(8550, 1)]);
    expect(total).toBe(32550);
    expect(formatPHP(total)).toBe("PHP 325.50");
  });
});
