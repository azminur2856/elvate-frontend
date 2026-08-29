import { Skeleton } from "@/components/ui/skeleton";

/** Loading placeholder for stats pages: a row of cards + two charts. */
export function StatsSkeleton({ cards = 4, label = "Loading statistics" }: { cards?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}
