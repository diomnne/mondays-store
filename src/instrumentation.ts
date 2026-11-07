/**
 * Runs once when the server starts, before it handles any request.
 * Fails loudly if the admin environment variables are missing or the
 * session secret is too short, instead of failing on the first login.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertAdminEnv } = await import("@/lib/auth/config");
    assertAdminEnv();
  }
}
