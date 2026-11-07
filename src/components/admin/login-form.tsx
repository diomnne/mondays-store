"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "@/lib/actions/auth";

const INITIAL_STATE: LoginState = { error: null, email: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Checking…" : "Log in"}
    </Button>
  );
}

/** `next` is where to go after logging in; the server only honors safe /admin paths. */
export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, INITIAL_STATE);
  const describedBy = state.error ? "login-error" : undefined;

  return (
    <form action={formAction} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}

      {state.error && (
        <p id="login-error" role="alert" className="rounded-lg border border-destructive/30 bg-destructive-soft p-3 text-destructive">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          aria-invalid={Boolean(state.error)}
          aria-describedby={describedBy}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.error)}
          aria-describedby={describedBy}
        />
      </div>
      <SubmitButton />
    </form>
  );
}
