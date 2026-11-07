import { AdminSidebar } from "@/components/admin/admin-sidebar";

/**
 * Shell for every signed-in admin page: glass sidebar over a subtle gradient.
 * The layout reads no session itself (so it renders instantly); each page
 * calls requireAdmin() before loading any data.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-gradient-header" />
      <AdminSidebar />
      <main id="main" className="px-3 pt-6 pb-12 sm:px-6 lg:pt-8 lg:pr-8 lg:pl-[19rem]">
        {children}
      </main>
    </div>
  );
}
