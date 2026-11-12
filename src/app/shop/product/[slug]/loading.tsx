import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <span className="sr-only" role="status">
        Loading product
      </span>
      <Skeleton className="h-4 w-64" />
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="grid gap-3">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
        <div className="grid content-start gap-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-11 w-64" />
        </div>
      </div>
    </div>
  );
}
