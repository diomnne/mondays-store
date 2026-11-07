import type { Metadata } from "next";

/** Everything under /admin is private: kept out of search engines. */
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Mondays admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
