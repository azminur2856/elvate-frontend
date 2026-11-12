import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/shop/ProductGrid";

/** Default skeleton for every /shop/* route (listing pages override it). */
export default function ShopLoading() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-6">
      <span className="sr-only" role="status">
        Loading the shop
      </span>
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="aspect-[4/3] rounded-xl" />
        <Skeleton className="aspect-[4/3] rounded-xl" />
        <Skeleton className="aspect-[4/3] rounded-xl" />
      </div>
      <ProductGridSkeleton count={4} />
    </div>
  );
}
