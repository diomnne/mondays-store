import { z } from "zod";

import { PAYMENT_METHODS } from "@/lib/order-status";

/**
 * Checkout form rules, shared by the browser (inline errors while typing)
 * and the Server Action (the check that counts). Field names match the
 * place_order RPC's error keys, so server errors land on the right input.
 */

const requiredText = (message: string, max: number) =>
  z.string({ error: message }).trim().min(1, message).max(max, `Keep this under ${max} characters.`);

export const checkoutSchema = z.object({
  // trim() first, so whitespace-only input counts as empty.
  customer_name: requiredText("Enter your name.", 100),
  customer_email: z
    .string({ error: "Enter your email address." })
    .trim()
    .toLowerCase()
    .min(1, "Enter your email address.")
    .pipe(z.email("Enter a valid email address, like name@example.com.")),
  contact_number: requiredText("Enter a contact number.", 30)
    // Digits plus the usual formatting: +63 917 000 1234, (02) 8123-4567.
    .regex(/^[0-9+()\-.\s]+$/, "Use digits and common symbols like + ( ) -.")
    .refine((value) => {
      const digits = value.replace(/\D/g, "").length;
      return digits >= 7 && digits <= 15;
    }, "Enter a contact number with 7 to 15 digits."),
  delivery_address: requiredText("Enter a delivery address.", 300),
  payment_method: z.enum(PAYMENT_METHODS, { error: "Choose a payment method." }),
  notes: z.string().trim().max(500, "Keep notes under 500 characters.").optional().default(""),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutFields = z.output<typeof checkoutSchema>;
export type CheckoutFieldName = keyof CheckoutFields;
export type CheckoutFieldErrors = Partial<Record<CheckoutFieldName, string>>;

export type CheckoutValidation =
  | { ok: true; data: CheckoutFields }
  | { ok: false; errors: CheckoutFieldErrors };

/** Validates the form and returns the first error message per field. */
export function validateCheckout(input: unknown): CheckoutValidation {
  const result = checkoutSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };

  const errors: CheckoutFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as CheckoutFieldName | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { ok: false, errors };
}
