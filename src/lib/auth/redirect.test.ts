import { describe, expect, it } from "vitest";

import { safeAdminRedirect } from "./redirect";

describe("safeAdminRedirect", () => {
  it("allows relative paths inside /admin, keeping the query string", () => {
    expect(safeAdminRedirect("/admin")).toBe("/admin");
    expect(safeAdminRedirect("/admin/orders")).toBe("/admin/orders");
    expect(safeAdminRedirect("/admin/products?status=inactive")).toBe("/admin/products?status=inactive");
  });

  it("falls back to /admin when next is missing or not a string", () => {
    expect(safeAdminRedirect(undefined)).toBe("/admin");
    expect(safeAdminRedirect(null)).toBe("/admin");
    expect(safeAdminRedirect("")).toBe("/admin");
    expect(safeAdminRedirect(["/admin/orders"])).toBe("/admin");
  });

  it("blocks other sites (open redirects)", () => {
    for (const evil of [
      "https://evil.example/admin",
      "//evil.example/admin",
      "/\\evil.example/admin",
      "\\\\evil.example",
      "javascript:alert(1)",
      "http:/admin",
    ]) {
      expect(safeAdminRedirect(evil)).toBe("/admin");
    }
  });

  it("blocks paths outside /admin, including look-alikes", () => {
    expect(safeAdminRedirect("/")).toBe("/admin");
    expect(safeAdminRedirect("/products")).toBe("/admin");
    expect(safeAdminRedirect("/administrator")).toBe("/admin");
    expect(safeAdminRedirect("/admin/../products")).toBe("/admin");
  });

  it("never sends a logged-in admin back to the login page", () => {
    expect(safeAdminRedirect("/admin/login")).toBe("/admin");
    expect(safeAdminRedirect("/admin/login?next=/admin")).toBe("/admin");
  });

  it("rejects control characters", () => {
    expect(safeAdminRedirect("/admin\n/orders")).toBe("/admin");
  });
});
