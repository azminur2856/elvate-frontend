import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/shared/PageShell";

export default function Loading() {
  return (
    <PageShell>
      <div role="status" aria-label="Loading page" className="grid gap-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96 max-w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    </PageShell>
  );
}
