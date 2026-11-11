import { Badge } from "@/components/ui/badge";
import { formatBDT } from "@/lib/format";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { now: "text-base", was: "text-xs" },
  md: { now: "text-lg", was: "text-sm" },
  lg: { now: "text-3xl", was: "text-base" },
} as const;

type PriceTagProps = {
  /** Regular price. */
  price: number;
  /** What the customer pays now (flash sale > sale price > price). */
  effectivePrice: number;
  /** Rounded discount; computed from the two prices when omitted. */
  discountPercent?: number;
  size?: keyof typeof sizes;
  /** Show the "-20%" badge next to the price. */
  showBadge?: boolean;
  className?: string;
};

/** Price with strike-through original + discount badge when on sale. */
export function PriceTag({
  price,
  effectivePrice,
  discountPercent,
  size = "md",
  showBadge = true,
  className,
}: PriceTagProps) {
  const discounted = effectivePrice < price;
  const pct =
    discountPercent ?? (discounted && price > 0 ? Math.round((1 - effectivePrice / price) * 100) : 0);
  const s = sizes[size];

  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      {discounted ? <span className="sr-only">Sale price</span> : <span className="sr-only">Price</span>}
      <span className={cn("font-heading font-semibold tabular-nums text-foreground", s.now)}>
        {formatBDT(effectivePrice)}
      </span>
      {discounted ? (
        <>
          <span className="sr-only">, original price</span>
          <del className={cn("tabular-nums text-muted-foreground", s.was)}>{formatBDT(price)}</del>
          {showBadge && pct > 0 ? (
            <Badge variant="brand" className="self-center">
              <span className="sr-only">save </span>−{pct}%
            </Badge>
          ) : null}
        </>
      ) : null}
    </p>
  );
}
