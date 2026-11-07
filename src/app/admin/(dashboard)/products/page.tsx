import type { Metadata } from "next";

import { ComingSoon } from "@/components/admin/coming-soon";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Products" };

/** Placeholder until the next update. Still checks the session like every admin page. */
export default async function AdminProductsPage() {
  await requireAdmin();
  return <ComingSoon title="Products" description="Add, edit, and retire products, and filter by category and status." />;
}
