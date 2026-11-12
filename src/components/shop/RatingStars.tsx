import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const starSize = { sm: "size-3.5", md: "size-4", lg: "size-5" } as const;

type RatingStarsProps = {
  /** 0–5, fractional values fill partial stars. */
  rating: number;
  /** Number of reviews, shown as "(12)". */
  count?: number;
  size?: keyof typeof starSize;
  /** Show the numeric value ("4.3") before the stars. */
  showValue?: boolean;
  className?: string;
};

/** Read-only star rating. Announced as one phrase to screen readers. */
export function RatingStars({ rating, count, size = "md", showValue = false, className }: RatingStarsProps) {
  const value = Math.max(0, Math.min(5, Number.isFinite(rating) ? rating : 0));
  const rounded = Math.round(value * 10) / 10;
  const label =
    `Rated ${rounded} out of 5` +
    (count !== undefined ? `, ${count} ${count === 1 ? "review" : "reviews"}` : "");

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span role="img" aria-label={label} className="inline-flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, value - i));
          return (
            <span key={i} className={cn("relative inline-block", starSize[size])} aria-hidden="true">
              <Star className={cn("absolute inset-0 text-muted-foreground/40", starSize[size])} />
              {fill > 0 ? (
                <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                  <Star className={cn("fill-warning text-warning", starSize[size])} />
                </span>
              ) : null}
            </span>
          );
        })}
      </span>
      {showValue ? (
        <span aria-hidden="true" className="text-sm font-medium tabular-nums">
          {rounded.toFixed(1)}
        </span>
      ) : null}
      {count !== undefined ? (
        <span aria-hidden="true" className="text-xs text-muted-foreground tabular-nums">
          ({count})
        </span>
      ) : null}
    </span>
  );
}
