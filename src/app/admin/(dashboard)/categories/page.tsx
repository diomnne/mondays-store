import type { Metadata } from "next";

import { ComingSoon } from "@/components/admin/coming-soon";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Categories" };

/** Placeholder until the next update. Still checks the session like every admin page. */
export default async function AdminCategoriesPage() {
  await requireAdmin();
  return <ComingSoon title="Categories" description="Add, rename, and remove categories." />;
}
