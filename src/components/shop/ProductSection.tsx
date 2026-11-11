import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProductCard } from "@/types/commerce";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductGrid } from "./ProductGrid";

type ProductSectionProps = {
  /** Used for the heading id (aria-labelledby). */
  id: string;
  title: string;
  description?: string;
  /** "View all" target; omitted = no link. */
  href?: string;
  products: ProductCard[];
  priorityCount?: number;
  className?: string;
};

/** A titled row of product cards. Renders nothing when there are no products. */
export function ProductSection({
  id,
  title,
  description,
  href,
  products,
  priorityCount,
  className,
}: ProductSectionProps) {
  if (!products.length) return null;
  return (
    <section aria-labelledby={id} className={cn("grid gap-5", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id={id} className="text-2xl font-bold tracking-tight">
            {title}
          </h2>
          {description ? <p className="mt-1 text-muted-foreground">{description}</p> : null}
        </div>
        {href ? (
          <Button asChild variant="ghost" className="-mr-3">
            <Link href={href}>
              View all<span className="sr-only"> {title.toLowerCase()}</span>
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        ) : null}
      </div>
      <ProductGrid products={products} priorityCount={priorityCount} />
    </section>
  );
}
