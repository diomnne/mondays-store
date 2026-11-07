import type { Metadata } from "next";

import { ComingSoon } from "@/components/admin/coming-soon";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Customers" };

/** Placeholder until the next update. Still checks the session like every admin page. */
export default async function AdminCustomersPage() {
  await requireAdmin();
  return <ComingSoon title="Customers" description="Everyone who has ordered, grouped by email, with their completed totals." />;
}
