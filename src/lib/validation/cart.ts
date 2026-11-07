import { z } from "zod";

/** Same shape the database checks: 8-4-4-4-12 hex digits. */
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const MAX_CART_LINES = 50;
/** Upper bound for a single line before stock is known (e.g. read from storage). */
export const MAX_LINE_QUANTITY = 999;

export const productIdSchema = z.string().regex(UUID_PATTERN);
export const quantitySchema = z.number().int().min(1).max(MAX_LINE_QUANTITY);

/** One stored or submitted cart line. */
export const cartLineSchema = z.object({
  productId: productIdSchema,
  quantity: quantitySchema,
});

/** What the client sends to resolve its cart against the database. */
export const cartLinesSchema = z.array(cartLineSchema).max(MAX_CART_LINES);

/** What the client sends at checkout: each line plus the price the customer was shown. */
export const checkoutItemsSchema = z
  .array(
    cartLineSchema.extend({
      expectedUnitPriceCents: z.number().int().positive(),
    }),
  )
  .max(MAX_CART_LINES);

export type CheckoutItem = z.infer<typeof checkoutItemsSchema>[number];
