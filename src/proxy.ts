import { NextResponse, type NextRequest } from "next/server";

import { readSessionSecret } from "@/lib/auth/config";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/token";
import { activeProductExists, orderExists } from "@/lib/data/exists";

/**
 * Proxy (Next 16's name for middleware) runs before a page renders.
 * It does two jobs:
 *
 * 1. Admin guard: logged-out visitors to /admin/* go to the login page.
 *    This is only a fast first check. Every admin page and Server Action
 *    also calls requireAdmin() (lib/auth/session.ts), because Server Actions
 *    can be called directly and a matcher mistake would silently open a
 *    route. The real authorization lives next to the data.
 *
 * 2. Real 404s for missing products and orders. With Cache Components, a
 *    page's static shell starts streaming with a 200 before the page can call
 *    notFound(). So this checks first and rewrites missing records to a static
 *    "unavailable" page that is always served as 404 (the URL stays the same).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return guardAdmin(request);
  }
  return checkStorefrontRecord(request);
}

async function guardAdmin(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const onLoginPage = pathname === "/admin/login";

  let loggedIn = false;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    try {
      loggedIn = (await verifySessionToken(token, readSessionSecret())) !== null;
    } catch (error) {
      // Misconfigured secret: treat as logged out (the login page will report it).
      console.error(error);
    }
  }

  if (onLoginPage) {
    return loggedIn ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
  }
  if (!loggedIn) {
    const loginUrl = new URL("/admin/login", request.url);
    // Remember where they were going; the login action only honors safe /admin paths.
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

async function checkStorefrontRecord(request: NextRequest) {
  const [, section, key] = request.nextUrl.pathname.split("/");
  try {
    if (section === "products" && !(await activeProductExists(key))) {
      return NextResponse.rewrite(new URL("/unavailable/product", request.url));
    }
    if (section === "orders" && !(await orderExists(key))) {
      return NextResponse.rewrite(new URL("/unavailable/order", request.url));
    }
  } catch (error) {
    // Database unreachable: let the page handle it.
    console.error(error);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Storefront detail pages (single segment only).
    "/products/:slug",
    "/orders/:id",
    // Every admin route, including /admin itself.
    "/admin/:path*",
  ],
};
