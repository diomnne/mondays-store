"use server";

import { resolveCartLines } from "@/lib/data/cart";
import { cartLinesSchema } from "@/lib/validation/cart";
import type { ResolvedCartLine } from "@/types/cart";

export type ResolveCartResult =
  | { ok: true; lines: ResolvedCartLine[] }
  | { ok: false; code: "invalid_items" | "server_error" };

/**
 * Called by the cart and checkout pages with the lines from localStorage.
 * Input comes from the browser, so it's validated before touching the database.
 */
export async function resolveCartAction(input: unknown): Promise<ResolveCartResult> {
  const parsed = cartLinesSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_items" };
  }

  try {
    return { ok: true, lines: await resolveCartLines(parsed.data) };
  } catch (error) {
    console.error(error);
    return { ok: false, code: "server_error" };
  }
}
