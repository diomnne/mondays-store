import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminBrand } from "@/components/admin/admin-brand";
import { LoginForm } from "@/components/admin/login-form";
import { readAdminCredentials } from "@/lib/auth/config";

export const metadata: Metadata = { title: "Log in" };

export default function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  // The demo account is meant to be shared with reviewers, so it's shown here
  // (and in the README). The page fails loudly if the variables are missing.
  const demo = readAdminCredentials();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-powder px-4 py-10">
      <div className="glass w-full max-w-md space-y-6 rounded-card p-6 shadow-lg sm:p-8">
        <AdminBrand />
        <div className="space-y-1">
          <h1 className="text-[2.25rem] leading-tight">Log in</h1>
          <p className="text-muted-foreground">Manage products, orders, and customers.</p>
        </div>

        {/* searchParams is request data, so the form that needs `next` sits behind Suspense. */}
        <Suspense fallback={<LoginForm />}>
          <LoginFormWithNext searchParams={searchParams} />
        </Suspense>

        <div className="space-y-2 rounded-2xl border bg-card p-4">
          <p className="font-medium">Demo credentials</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-caption">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-mono break-all">{demo.email}</dd>
            <dt className="text-muted-foreground">Password</dt>
            <dd className="font-mono break-all">{demo.password}</dd>
          </dl>
          <p className="text-caption text-muted-foreground">
            This login is simulated for the demo and isn&apos;t secure. Don&apos;t reuse a real password here.
          </p>
        </div>

        <Link href="/" className="inline-flex min-h-11 items-center text-caption font-medium underline underline-offset-4">
          Back to the store
        </Link>
      </div>
    </main>
  );
}

async function LoginFormWithNext({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const { next } = await searchParams;
  return <LoginForm next={typeof next === "string" ? next : undefined} />;
}
