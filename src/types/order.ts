import type { Database, OrderStatus, PaymentMethod } from "./database";

export type { OrderStatus, PaymentMethod };

type Tables = Database["public"]["Tables"];

export type Order = Tables["orders"]["Row"];
export type OrderItem = Tables["order_items"]["Row"];
export type DashboardStats = Database["public"]["Views"]["dashboard_stats"]["Row"];
export type CustomerSummary = Database["public"]["Views"]["customer_summary"]["Row"];

/** One line sent to the place_order RPC. */
export type PlaceOrderItem = {
  product_id: string;
  quantity: number;
  expected_unit_price_cents: number;
};

/**
 * One cart line that no longer matches the database at checkout, as returned
 * by place_order. The extra fields say how to correct the cart.
 */
export type CartChange =
  // Inactive or deleted. `name` is null when the product no longer exists.
  | { reason: "unavailable"; product_id: string; name: string | null }
  | {
      reason: "insufficient_stock";
      product_id: string;
      name: string;
      available_stock: number;
      requested: number;
    }
  | {
      reason: "price_changed";
      product_id: string;
      name: string;
      old_price_cents: number;
      new_price_cents: number;
    };

export type CartChangeReason = CartChange["reason"];

/** JSON returned by the place_order RPC. */
export type PlaceOrderResult =
  | { ok: true; order_id: string; order_number: string; total_cents: number }
  | { ok: false; code: "invalid_fields"; errors: Record<string, string> }
  | { ok: false; code: "empty_cart" | "invalid_items" }
  | { ok: false; code: "cart_changed"; changes: CartChange[] };

/** JSON returned by the update_order_status RPC. */
export type UpdateOrderStatusResult =
  | { ok: true; order_id: string; status: OrderStatus }
  | { ok: false; code: "invalid_transition"; from: OrderStatus; to: OrderStatus }
  | { ok: false; code: "not_found" | "invalid_status" };
