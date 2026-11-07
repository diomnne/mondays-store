import "server-only";

import { connection } from "next/server";
import { cache } from "react";

import { getSupabase } from "@/lib/supabase/server";
import { UUID_PATTERN } from "@/lib/validation/cart";
import type { Order, OrderItem } from "@/types/order";

export type OrderWithItems = Order & {
  items: Pick<OrderItem, "id" | "product_name" | "unit_price_cents" | "quantity" | "line_total_cents">[];
};

/**
 * One order and its line items, by id. Returns null for an unknown or
 * malformed id. Wrapped in React `cache` so the page and its metadata share
 * one query per request.
 */
export const getOrderById = cache(async (id: string): Promise<OrderWithItems | null> => {
  await connection();

  // Skip the query entirely for something that can't be an order id.
  if (!UUID_PATTERN.test(id)) return null;

  const { data, error } = await getSupabase()
    .from("orders")
    .select("*, items:order_items(id, product_name, unit_price_cents, quantity, line_total_cents)")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(`Could not load order: ${error.message}`);
  }
  if (!data) return null;

  return { ...data, items: [...data.items].sort((a, b) => a.product_name.localeCompare(b.product_name)) };
});
