import type { ProductCard as ProductCardData } from "@/types/commerce";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

const layouts = {
  /** Full-width page: 2 → 3 → 4 columns. */
  full: {
    grid: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    sizes: "(min-width: 1280px) 300px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
  },
  /** Next to a filter sidebar: 2 → 3 columns. */
  sidebar: {
    grid: "grid-cols-2 lg:grid-cols-3",
    sizes: "(min-width: 1280px) 300px, (min-width: 1024px) 30vw, 50vw",
  },
} as const;

type ProductGridProps = {
  products: ProductCardData[];
  layout?: keyof typeof layouts;
  /** How many leading cards load their image eagerly. */
  priorityCount?: number;
  /** Card heading level (h3 under a section h2, h2 directly under the page h1). */
  cardHeading?: "h2" | "h3";
  className?: string;
};

export function ProductGrid({
  products,
  layout = "full",
  priorityCount = 0,
  cardHeading = "h3",
  className,
}: ProductGridProps) {
  const l = layouts[layout];
  return (
    <ul className={cn("grid gap-3 sm:gap-5", l.grid, className)}>
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} priority={i < priorityCount} sizes={l.sizes} as={cardHeading} />
        </li>
      ))}
    </ul>
  );
}

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl border bg-card", className)}>
      <Skeleton className="aspect-square rounded-none" />
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-2 h-5 w-1/3" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({
  count = 8,
  layout = "full",
  className,
}: {
  count?: number;
  layout?: keyof typeof layouts;
  className?: string;
}) {
  return (
    <div role="status" aria-label="Loading products" className={cn("grid gap-3 sm:gap-5", layouts[layout].grid, className)}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
