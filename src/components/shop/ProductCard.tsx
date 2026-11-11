import Link from "next/link";
import type { ProductCard as ProductCardData } from "@/types/commerce";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { productHref } from "@/lib/catalog-url";
import { CountdownTimer } from "./CountdownTimer";
import { PriceTag } from "./PriceTag";
import { ProductImage } from "./ProductImage";
import { RatingStars } from "./RatingStars";

type ProductCardProps = {
  product: ProductCardData;
  /** Eager-load the image (first row of a grid, LCP). */
  priority?: boolean;
  /** Responsive `sizes` for the image. */
  sizes?: string;
  as?: "h2" | "h3";
  className?: string;
};

/**
 * Product tile. Server-renderable: the only client part is the flash-sale
 * countdown. The whole card is clickable through the title link's `::after`
 * overlay, so there is a single tab stop and a single announced link.
 */
export function ProductCard({ product: p, priority, sizes, as: Heading = "h3", className }: ProductCardProps) {
  const discounted = p.effectivePrice < p.price;
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow",
        "hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        className
      )}
    >
      <div className="relative aspect-square">
        <ProductImage
          src={p.mainImage}
          alt=""
          sizes={sizes}
          priority={priority}
          className="transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          {discounted && p.discountPercent > 0 ? (
            <Badge variant="brand">
              <span className="sr-only">Save </span>−{p.discountPercent}%
            </Badge>
          ) : null}
          {p.isNewArrival ? <Badge>New</Badge> : null}
        </div>
        {!p.inStock ? (
          <div className="absolute inset-x-0 bottom-0 bg-background/85 py-1.5 text-center text-xs font-semibold text-foreground backdrop-blur-sm">
            Out of stock
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        {p.brand ? (
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">{p.brand}</p>
        ) : null}
        <Heading className="line-clamp-2 font-sans text-sm font-medium leading-snug sm:text-base">
          <Link
            href={productHref(p.slug)}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
          >
            {p.name}
          </Link>
        </Heading>
        {p.reviewCount > 0 ? <RatingStars rating={p.rating} count={p.reviewCount} size="sm" /> : null}
        <div className="mt-auto flex flex-col gap-1 pt-1">
          <PriceTag price={p.price} effectivePrice={p.effectivePrice} size="sm" showBadge={false} />
          {p.flashSaleEndsAt ? <CountdownTimer endsAt={p.flashSaleEndsAt} label="Flash sale ends in" compact /> : null}
          {!p.inStock ? <span className="sr-only">Out of stock</span> : null}
        </div>
      </div>
    </article>
  );
}
