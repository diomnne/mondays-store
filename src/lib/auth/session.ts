import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { readSessionSecret } from "./config";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  signSessionToken,
  verifySessionToken,
  type AdminSession,
} from "./token";

/**
 * Simulated admin session: a signed JWT in an httpOnly cookie. Fine for a
 * demo; not production-safe (one shared account, no rate limiting, no
 * server-side revocation).
 */

const COOKIE_PATH = "/admin"; // the cookie is only sent to admin pages

export async function createSession(): Promise<void> {
  const token = await signSessionToken(readSessionSecret());
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true, // not readable from JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS only when deployed
    sameSite: "lax", // not sent on cross-site POSTs
    path: COOKIE_PATH,
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/** The current session, or null if the cookie is missing, expired, or invalid. */
export async function verifySession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token, readSessionSecret());
}

/**
 * Call at the top of every admin page and admin Server Action. The proxy
 * already redirects logged-out visitors, but it's only a fast first check:
 * Server Actions can be invoked directly, and a matcher typo would silently
 * open a route. The real authorization lives here, next to the data.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await verifySession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function deleteSession(): Promise<void> {
  (await cookies()).delete({ name: SESSION_COOKIE_NAME, path: COOKIE_PATH });
}
