import { describe, expect, it } from "vitest";

import { validateCheckout } from "./checkout";

const valid = {
  customer_name: "Ana Reyes",
  customer_email: "ana.reyes@example.com",
  contact_number: "+63 917 000 1234",
  delivery_address: "123 Sample Street, Sample City",
  payment_method: "cash_on_delivery",
  notes: "",
};

describe("validateCheckout", () => {
  it("accepts a complete form and normalizes it", () => {
    const result = validateCheckout({ ...valid, customer_name: "  Ana Reyes ", customer_email: " Ana.Reyes@Example.COM " });
    expect(result).toEqual({
      ok: true,
      data: { ...valid, customer_name: "Ana Reyes", customer_email: "ana.reyes@example.com" },
    });
  });

  it("rejects a whitespace-only name", () => {
    expect(validateCheckout({ ...valid, customer_name: "   " })).toEqual({
      ok: false,
      errors: { customer_name: "Enter your name." },
    });
  });

  it("rejects a badly formatted email", () => {
    for (const email of ["ana", "ana@", "ana@example", "ana reyes@example.com"]) {
      const result = validateCheckout({ ...valid, customer_email: email });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.customer_email).toMatch(/valid email/);
    }
  });

  it("rejects an empty contact number but allows common formatting", () => {
    const empty = validateCheckout({ ...valid, contact_number: "  " });
    expect(empty).toEqual({ ok: false, errors: { contact_number: "Enter a contact number." } });

    for (const phone of ["09170001234", "+63 917 000 1234", "(02) 8123-4567", "0917.000.1234"]) {
      expect(validateCheckout({ ...valid, contact_number: phone }).ok).toBe(true);
    }
    expect(validateCheckout({ ...valid, contact_number: "call me" }).ok).toBe(false);
    expect(validateCheckout({ ...valid, contact_number: "123" }).ok).toBe(false);
  });

  it("rejects a missing or unknown payment method", () => {
    for (const method of [undefined, "", "credit_card", "Cash on Delivery"]) {
      const result = validateCheckout({ ...valid, payment_method: method });
      expect(result).toEqual({ ok: false, errors: { payment_method: "Choose a payment method." } });
    }
  });

  it("rejects a blank delivery address", () => {
    expect(validateCheckout({ ...valid, delivery_address: "" })).toEqual({
      ok: false,
      errors: { delivery_address: "Enter a delivery address." },
    });
  });

  it("treats notes as optional", () => {
    const withoutNotes: Partial<typeof valid> = { ...valid };
    delete withoutNotes.notes;
    const result = validateCheckout(withoutNotes);
    expect(result.ok && result.data.notes).toBe("");
  });

  it("reports every invalid field at once", () => {
    const result = validateCheckout({});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(
        ["contact_number", "customer_email", "customer_name", "delivery_address", "payment_method"].sort(),
      );
    }
  });
});
