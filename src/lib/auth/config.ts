import "server-only";

import { safeEqual } from "./compare";

/**
 * Admin settings from the environment. Each reader throws a clear error when
 * a variable is missing, and instrumentation.ts calls assertAdminEnv() when
 * the server starts, so a misconfigured deploy fails immediately instead of
 * on the first login.
 */

export const MIN_SECRET_LENGTH = 32;

function requireEnv(name: "ADMIN_EMAIL" | "ADMIN_PASSWORD" | "ADMIN_SESSION_SECRET"): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing environment variable ${name}. See .env.example.`);
  }
  return value;
}

/** The key that signs session tokens. */
export function readSessionSecret(): Uint8Array {
  const secret = requireEnv("ADMIN_SESSION_SECRET");
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `ADMIN_SESSION_SECRET must be at least ${MIN_SECRET_LENGTH} characters (it has ${secret.length}). ` +
        `Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`,
    );
  }
  return new TextEncoder().encode(secret);
}

export function readAdminCredentials(): { email: string; password: string } {
  return { email: requireEnv("ADMIN_EMAIL"), password: requireEnv("ADMIN_PASSWORD") };
}

export function assertAdminEnv(): void {
  readSessionSecret();
  readAdminCredentials();
}

/**
 * Simulated login: checks the submitted pair against the demo account in the
 * environment. Email is compared ignoring case and surrounding spaces;
 * the password exactly. Both comparisons always run, in constant time.
 */
export function credentialsMatch(email: string, password: string): boolean {
  const expected = readAdminCredentials();
  const emailOk = safeEqual(email.trim().toLowerCase(), expected.email.trim().toLowerCase());
  const passwordOk = safeEqual(password, expected.password);
  return emailOk && passwordOk;
}
