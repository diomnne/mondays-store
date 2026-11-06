import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10" aria-busy="true">
      <span className="sr-only">Loading product</span>
      <Skeleton className="mb-4 h-11 w-40 rounded-full" />
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <Skeleton className="aspect-square rounded-card md:aspect-[4/5]" />
        <div className="space-y-4 md:py-6">
          <Skeleton className="h-11 w-20 rounded-full" />
          <Skeleton className="h-14 w-3/4 rounded-2xl" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-20 w-full max-w-prose" />
          <Skeleton className="h-11 w-40 rounded-full" />
          <Skeleton className="h-11 w-full max-w-sm rounded-full" />
        </div>
      </div>
    </div>
  );
}
