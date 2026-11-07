import { SignJWT, jwtVerify } from "jose";

/**
 * The admin session token: a JWT signed with HS256 using
 * ADMIN_SESSION_SECRET. Pure functions (the secret is passed in), so they can
 * be unit-tested and used from both the proxy and server code.
 */

export const SESSION_COOKIE_NAME = "mondays_admin";
export const SESSION_SUBJECT = "demo-admin";
export const SESSION_DURATION_SECONDS = 8 * 60 * 60; // 8 hours

export type AdminSession = {
  subject: typeof SESSION_SUBJECT;
  expiresAt: Date;
};

export async function signSessionToken(secret: Uint8Array, issuedAt: Date = new Date()): Promise<string> {
  const iat = Math.floor(issuedAt.getTime() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(SESSION_SUBJECT)
    .setIssuedAt(iat)
    .setExpirationTime(iat + SESSION_DURATION_SECONDS)
    .sign(secret);
}

/**
 * Returns the session if the token is genuine and current, otherwise null.
 * jwtVerify checks the signature (a tampered token fails), the algorithm
 * (only HS256, so "alg: none" tricks fail), the expiry, and the subject.
 */
export async function verifySessionToken(
  token: string,
  secret: Uint8Array,
  now: Date = new Date(),
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      subject: SESSION_SUBJECT,
      requiredClaims: ["exp"],
      currentDate: now,
    });
    return { subject: SESSION_SUBJECT, expiresAt: new Date((payload.exp as number) * 1000) };
  } catch {
    // Expired, tampered, signed with another secret, or not a JWT at all.
    return null;
  }
}
