import { NextResponse, type NextRequest } from "next/server";

import { activeProductExists, orderExists } from "@/lib/data/exists";

/**
 * Proxy (Next 16's name for middleware) runs before a page renders.
 *
 * Real 404s for missing products and orders: with Cache Components, a page's
 * static shell starts streaming with a 200 status before the page itself can
 * call notFound(), so the status can't be changed from inside the page.
 * This checks first, and rewrites a missing (or inactive) product or an
 * unknown order to a static "unavailable" page that is always served as 404.
 * The address bar keeps the original URL.
 *
 * If the check itself fails (e.g. the database is unreachable), the request
 * goes through unchanged and the page handles it.
 */
export async function proxy(request: NextRequest) {
  const [, section, key] = request.nextUrl.pathname.split("/");

  try {
    if (section === "products" && !(await activeProductExists(key))) {
      return NextResponse.rewrite(new URL("/unavailable/product", request.url));
    }
    if (section === "orders" && !(await orderExists(key))) {
      return NextResponse.rewrite(new URL("/unavailable/order", request.url));
    }
  } catch (error) {
    console.error(error);
  }
  return NextResponse.next();
}

export const config = {
  // Only single-segment detail pages: /products/<slug> and /orders/<id>.
  matcher: ["/products/:slug", "/orders/:id"],
};
