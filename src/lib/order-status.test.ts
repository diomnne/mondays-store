import { describe, expect, it } from "vitest";

import {
  ORDER_STATUSES,
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  allowedNextStatuses,
  canTransition,
  isOrderStatus,
} from "./order-status";

describe("allowedNextStatuses", () => {
  it("moves forward one step at a time", () => {
    expect(allowedNextStatuses("preparing")).toEqual(["shipped"]);
    expect(allowedNextStatuses("shipped")).toEqual(["completed"]);
  });

  it("offers cancellation only from pending or confirmed", () => {
    expect(allowedNextStatuses("pending")).toEqual(["confirmed", "cancelled"]);
    expect(allowedNextStatuses("confirmed")).toEqual(["preparing", "cancelled"]);
    expect(allowedNextStatuses("preparing")).not.toContain("cancelled");
    expect(allowedNextStatuses("shipped")).not.toContain("cancelled");
  });

  it("treats completed and cancelled as final", () => {
    expect(allowedNextStatuses("completed")).toEqual([]);
    expect(allowedNextStatuses("cancelled")).toEqual([]);
  });
});

describe("canTransition", () => {
  it("rejects skipping steps, going backward, and repeating a status", () => {
    expect(canTransition("pending", "preparing")).toBe(false);
    expect(canTransition("shipped", "confirmed")).toBe(false);
    expect(canTransition("cancelled", "cancelled")).toBe(false);
    expect(canTransition("pending", "pending")).toBe(false);
  });

  it("accepts each valid step", () => {
    expect(canTransition("pending", "confirmed")).toBe(true);
    expect(canTransition("confirmed", "cancelled")).toBe(true);
  });
});

describe("labels and badges", () => {
  it("has a label and badge style for every status", () => {
    for (const status of ORDER_STATUSES) {
      expect(ORDER_STATUS_LABELS[status]).toBeTruthy();
      expect(ORDER_STATUS_BADGE_CLASSES[status]).toBeTruthy();
    }
    expect(ORDER_STATUS_LABELS.pending).toBe("Pending");
  });

  it("labels payment methods for display", () => {
    expect(PAYMENT_METHOD_LABELS).toEqual({
      cash_on_delivery: "Cash on Delivery",
      e_wallet: "E-Wallet",
      bank_transfer: "Bank Transfer",
    });
  });

  it("recognizes valid status strings only", () => {
    expect(isOrderStatus("shipped")).toBe(true);
    expect(isOrderStatus("Shipped")).toBe(false);
    expect(isOrderStatus(undefined)).toBe(false);
  });
});
