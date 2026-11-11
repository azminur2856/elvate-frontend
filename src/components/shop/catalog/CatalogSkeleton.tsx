import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "../ProductGrid";

/** Loading state for every listing page (same frame as CatalogPage). */
export function CatalogSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <span className="sr-only" role="status">
        Loading products
      </span>
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-5 mb-8 h-10 w-72 max-w-full" />
      <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="hidden gap-6 lg:grid lg:content-start">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid content-start gap-6">
          <div className="flex justify-between border-b pb-4">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-56" />
          </div>
          <ProductGridSkeleton count={6} layout="sidebar" />
        </div>
      </div>
    </div>
  );
}
