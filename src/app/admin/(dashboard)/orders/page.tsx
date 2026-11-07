import type { Metadata } from "next";

import { ComingSoon } from "@/components/admin/coming-soon";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Orders" };

/** Placeholder until the next update. Still checks the session like every admin page. */
export default async function AdminOrdersPage() {
  await requireAdmin();
  return <ComingSoon title="Orders" description="Every order, newest first, with details and status updates." />;
}
