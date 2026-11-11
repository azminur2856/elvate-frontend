import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/shop/ProductGrid";

export default function OffersLoading() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-8 sm:px-6">
      <span className="sr-only" role="status">
        Loading offers
      </span>
      <div className="grid gap-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
      <ProductGridSkeleton count={4} />
    </div>
  );
}
