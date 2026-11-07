/**
 * Where to send the admin after logging in. The `next` value comes from the
 * URL, so anyone can craft it: only a relative path inside /admin is
 * allowed. Anything else, such as "https://evil.example", "//evil.example",
 * or "/\evil.example" (both of which browsers treat as another site), falls
 * back to /admin. This prevents an open redirect.
 */
export const ADMIN_HOME = "/admin";

export function safeAdminRedirect(next: unknown): string {
  if (typeof next !== "string" || next.length > 2048) return ADMIN_HOME;
  // Must be a plain path: starts with one "/" and has no backslashes or control characters.
  if (!next.startsWith("/") || next.startsWith("//") || /[\\\u0000-\u001f]/.test(next)) return ADMIN_HOME;

  // Resolve against a dummy origin; a real relative path keeps that origin.
  let url: URL;
  try {
    url = new URL(next, "http://admin.invalid");
  } catch {
    return ADMIN_HOME;
  }
  if (url.origin !== "http://admin.invalid") return ADMIN_HOME;

  const path = url.pathname;
  const insideAdmin = path === "/admin" || path.startsWith("/admin/");
  // Sending a logged-in admin back to the login page would just bounce.
  if (!insideAdmin || path === "/admin/login") return ADMIN_HOME;

  return `${path}${url.search}${url.hash}`;
}
