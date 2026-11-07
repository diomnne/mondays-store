"use server";

import { revalidatePath } from "next/cache";

import { getSupabase } from "@/lib/supabase/server";
import { checkoutItemsSchema } from "@/lib/validation/cart";
import { validateCheckout, type CheckoutFieldErrors } from "@/lib/validation/checkout";
import type { CartChange, PlaceOrderItem, PlaceOrderResult } from "@/types/order";

export type PlaceOrderActionResult =
  | { ok: true; orderId: string; orderNumber: string }
  | { ok: false; code: "invalid_fields"; errors: CheckoutFieldErrors }
  | { ok: false; code: "cart_changed"; changes: CartChange[] }
  | { ok: false; code: "empty_cart" | "invalid_items" | "server_error" };

/**
 * Places an order. Expected failures come back as `ok: false` with a code;
 * nothing here throws to the client.
 *
 * The browser's validation is only for quick feedback. This action validates
 * again, and place_order then rechecks every product, price, and stock level
 * inside one database transaction, so a stale or tampered cart can't get
 * through: if anything differs from what the customer saw, nothing is saved.
 */
export async function placeOrderAction(input: { fields: unknown; items: unknown }): Promise<PlaceOrderActionResult> {
  const fields = validateCheckout(input.fields);
  if (!fields.ok) {
    return { ok: false, code: "invalid_fields", errors: fields.errors };
  }

  const items = checkoutItemsSchema.safeParse(input.items);
  if (!items.success) {
    return { ok: false, code: "invalid_items" };
  }
  if (items.data.length === 0) {
    return { ok: false, code: "empty_cart" };
  }

  // expected_unit_price_cents is the price the customer was shown. If the
  // database price differs, place_order answers cart_changed instead of saving.
  const rpcItems: PlaceOrderItem[] = items.data.map((item) => ({
    product_id: item.productId,
    quantity: item.quantity,
    expected_unit_price_cents: item.expectedUnitPriceCents,
  }));

  const { data, error } = await getSupabase().rpc("place_order", {
    p_customer_name: fields.data.customer_name,
    p_customer_email: fields.data.customer_email,
    p_contact_number: fields.data.contact_number,
    p_delivery_address: fields.data.delivery_address,
    p_payment_method: fields.data.payment_method,
    p_notes: fields.data.notes || null,
    p_items: rpcItems,
  });
  if (error || !data) {
    console.error("place_order failed", error);
    return { ok: false, code: "server_error" };
  }

  const result = data as PlaceOrderResult;
  if (result.ok) {
    // Stock changed, so the storefront pages should show the new numbers.
    revalidatePath("/", "layout");
    return { ok: true, orderId: result.order_id, orderNumber: result.order_number };
  }

  switch (result.code) {
    case "invalid_fields":
      return { ok: false, code: "invalid_fields", errors: result.errors };
    case "cart_changed":
      return { ok: false, code: "cart_changed", changes: result.changes };
    case "empty_cart":
    case "invalid_items":
      return { ok: false, code: result.code };
    default:
      console.error("place_order returned an unknown result", result);
      return { ok: false, code: "server_error" };
  }
}
