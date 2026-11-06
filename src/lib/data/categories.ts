import "server-only";

import { connection } from "next/server";

import { sortCategories } from "@/lib/category-theme";
import { getSupabase } from "@/lib/supabase/server";
import type { Category } from "@/types/catalog";

/** All categories, in the design's order (Lips, Face, Skin, then others A–Z). */
export async function listCategories(): Promise<Pick<Category, "id" | "name">[]> {
  await connection();

  const { data, error } = await getSupabase().from("categories").select("id, name");
  if (error) {
    throw new Error(`Could not load categories: ${error.message}`);
  }
  return sortCategories(data);
}
