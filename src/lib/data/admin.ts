import "server-only";

import { connection } from "next/server";

import { LOW_STOCK_THRESHOLD } from "@/lib/product-status";
import { getSupabase } from "@/lib/supabase/server";
import type { DashboardStats, Order } from "@/types/order";
import type { Product } from "@/types/catalog";

/**
 * Reads for the admin overview. Callers must have checked the session with
 * requireAdmin() first; these functions don't know who's asking.
 */

/** The six overview figures, computed by the dashboard_stats view. */
export async function getDashboardStats(): Promise<DashboardStats> {
  await connection();
  const { data, error } = await getSupabase().from("dashboard_stats").select("*").single();
  if (error) throw new Error(`Could not load dashboard figures: ${error.message}`);
  return data;
}

export type RecentOrder = Pick<
  Order,
  "id" | "order_number" | "customer_name" | "created_at" | "total_cents" | "status" | "payment_method"
>;

export async function getRecentOrders(limit = 5): Promise<RecentOrder[]> {
  await connection();
  const { data, error } = await getSupabase()
    .from("orders")
    .select("id, order_number, customer_name, created_at, total_cents, status, payment_method")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Could not load recent orders: ${error.message}`);
  return data;
}

export type StockWatchItem = Pick<Product, "id" | "name" | "slug" | "stock">;

/** Active products that are out of stock or running low, emptiest first. */
export async function getStockWatch(): Promise<StockWatchItem[]> {
  await connection();
  const { data, error } = await getSupabase()
    .from("products")
    .select("id, name, slug, stock")
    .eq("is_active", true)
    .lt("stock", LOW_STOCK_THRESHOLD)
    .order("stock")
    .order("name");
  if (error) throw new Error(`Could not load stock watch: ${error.message}`);
  return data;
}
