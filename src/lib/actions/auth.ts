"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { credentialsMatch } from "@/lib/auth/config";
import { safeAdminRedirect } from "@/lib/auth/redirect";
import { createSession, deleteSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/login";

export type LoginState = {
  error: string | null;
  /** Echoed back so the email field keeps its value after a failed attempt. */
  email: string;
};

// One message for every failure, so it never reveals which field was wrong.
const WRONG_CREDENTIALS = "That email and password don't match the demo account.";

/** Simulated login against the demo account in the environment. */
export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    next: formData.get("next") ?? undefined,
  });
  const email = String(formData.get("email") ?? "");

  if (!parsed.success) {
    return { error: "Enter the demo email and password.", email };
  }
  if (!credentialsMatch(parsed.data.email, parsed.data.password)) {
    return { error: WRONG_CREDENTIALS, email };
  }

  await createSession();
  // Only a relative /admin path is honored; anything else goes to /admin.
  redirect(safeAdminRedirect(parsed.data.next));
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  // Drop any admin pages the browser's router has cached, so Back can't show them.
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}
