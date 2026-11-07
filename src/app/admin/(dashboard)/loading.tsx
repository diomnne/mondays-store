import { Skeleton } from "@/components/ui/skeleton";

/** Shown while the page checks the session and loads its data. */
export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6" aria-busy="true">
      <span className="sr-only">Loading</span>
      <Skeleton className="h-12 w-48 rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-card" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-card" />
    </div>
  );
}
