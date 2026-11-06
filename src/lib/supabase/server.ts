import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * Server-only Supabase client using the secret key. RLS is on with no
 * policies, so this key is the only way in, and it must never reach the
 * browser (the `server-only` import above makes that a build error).
 */

function requireEnv(name: "SUPABASE_URL" | "SUPABASE_SECRET_KEY"): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

function readSupabaseUrl(): string {
  const raw = requireEnv("SUPABASE_URL");
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("SUPABASE_URL is not a valid URL. Expected https://<project-ref>.supabase.co");
  }
  // supabase-js adds /rest/v1 itself; a URL that already has a path breaks every request.
  if (url.pathname !== "/") {
    throw new Error(
      `SUPABASE_URL must be the project URL only (https://<project-ref>.supabase.co), without "${url.pathname}".`,
    );
  }
  return url.origin;
}

let client: SupabaseClient<Database> | undefined;

/** Returns the shared service client, creating it on first use. */
export function getSupabase(): SupabaseClient<Database> {
  if (!client) {
    client = createClient<Database>(readSupabaseUrl(), requireEnv("SUPABASE_SECRET_KEY"), {
      // No user sessions: this client acts as the app itself.
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
