import { SignJWT } from "jose";
import { describe, expect, it } from "vitest";

import { SESSION_DURATION_SECONDS, SESSION_SUBJECT, signSessionToken, verifySessionToken } from "./token";

const secret = new TextEncoder().encode("test-secret-that-is-at-least-32-characters-long");
const otherSecret = new TextEncoder().encode("another-secret-that-is-also-32-characters-long");

describe("session tokens", () => {
  it("round-trips: a freshly signed token verifies with an 8 hour expiry", async () => {
    const issuedAt = new Date("2026-11-07T09:00:00Z");
    const token = await signSessionToken(secret, issuedAt);
    const session = await verifySessionToken(token, secret, issuedAt);
    expect(session).toEqual({
      subject: SESSION_SUBJECT,
      expiresAt: new Date(issuedAt.getTime() + SESSION_DURATION_SECONDS * 1000),
    });
  });

  it("is still valid just before 8 hours", async () => {
    const issuedAt = new Date("2026-11-07T09:00:00Z");
    const token = await signSessionToken(secret, issuedAt);
    const almost = new Date(issuedAt.getTime() + (SESSION_DURATION_SECONDS - 60) * 1000);
    expect(await verifySessionToken(token, secret, almost)).not.toBeNull();
  });

  it("rejects an expired token", async () => {
    const issuedAt = new Date("2026-11-07T09:00:00Z");
    const token = await signSessionToken(secret, issuedAt);
    const later = new Date(issuedAt.getTime() + (SESSION_DURATION_SECONDS + 60) * 1000);
    expect(await verifySessionToken(token, secret, later)).toBeNull();
  });

  it("rejects a tampered token", async () => {
    const token = await signSessionToken(secret);
    const [header, payload, signature] = token.split(".");

    // Change the payload (e.g. a longer expiry) but keep the old signature.
    const forgedPayload = Buffer.from(JSON.stringify({ sub: SESSION_SUBJECT, exp: 9999999999 })).toString("base64url");
    expect(await verifySessionToken(`${header}.${forgedPayload}.${signature}`, secret)).toBeNull();

    // Flip one character of the signature.
    const flipped = signature.slice(0, -1) + (signature.endsWith("A") ? "B" : "A");
    expect(await verifySessionToken(`${header}.${payload}.${flipped}`, secret)).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signSessionToken(otherSecret);
    expect(await verifySessionToken(token, secret)).toBeNull();
  });

  it("rejects an unsigned token (alg: none)", async () => {
    const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({ sub: SESSION_SUBJECT, exp: 9999999999 })).toString("base64url");
    expect(await verifySessionToken(`${header}.${payload}.`, secret)).toBeNull();
  });

  it("rejects a validly signed token for a different subject", async () => {
    const token = await new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject("someone-else").setExpirationTime("1h").sign(secret);
    expect(await verifySessionToken(token, secret)).toBeNull();
  });

  it("rejects malformed values", async () => {
    for (const value of ["", "abc", "a.b.c", "not.a.jwt.at.all"]) {
      expect(await verifySessionToken(value, secret)).toBeNull();
    }
  });
});
