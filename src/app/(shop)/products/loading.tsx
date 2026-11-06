import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12" aria-busy="true">
      <span className="sr-only">Loading products</span>
      <Skeleton className="mb-3 h-14 w-56 rounded-2xl" />
      <Skeleton className="mb-8 h-5 w-72" />
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Skeleton className="h-11 w-full rounded-lg sm:max-w-md" />
        <Skeleton className="h-11 w-56 rounded-lg" />
      </div>
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-11 w-20 rounded-full" />
        ))}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="aspect-[4/5] rounded-card" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
