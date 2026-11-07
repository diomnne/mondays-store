import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Compares two strings in constant time, so the response time doesn't leak
 * how many leading characters were right. Both sides are hashed first
 * because timingSafeEqual needs equal-length inputs.
 */
export function safeEqual(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}
