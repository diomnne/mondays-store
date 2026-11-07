"use client";

import { useFormStatus } from "react-dom";
import { LogOutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" size="sm" className="w-full" disabled={pending}>
      <LogOutIcon aria-hidden="true" />
      {pending ? "Logging out…" : "Log out"}
    </Button>
  );
}

/** A form, not a link: logging out changes state, so it's a POST to a Server Action. */
export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <SubmitButton />
    </form>
  );
}
