"use client";

import { useId, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/**
 * 1–5 star picker built on native radio buttons, so arrow keys, focus and
 * screen-reader announcements work out of the box.
 */
export function RatingInput({
  value,
  onChange,
  error,
  legend = "Your rating",
}: {
  value: number;
  onChange: (rating: number) => void;
  error?: string;
  legend?: string;
}) {
  const name = useId();
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;

  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="mb-2 text-sm font-medium">
        {legend}
        <span aria-hidden="true" className="text-destructive">
          {" "}
          *
        </span>
      </legend>
      <div className="flex items-center gap-3">
        <div className="flex" onMouseLeave={() => setHover(null)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer p-0.5" onMouseEnter={() => setHover(n)}>
              <input
                type="radio"
                name={name}
                value={n}
                checked={value === n}
                onChange={() => onChange(n)}
                className="peer sr-only"
              />
              <span className="block rounded-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                <Star
                  aria-hidden="true"
                  className={cn(
                    "size-7 transition-colors",
                    n <= shown ? "fill-warning text-warning" : "text-muted-foreground/50"
                  )}
                />
              </span>
              <span className="sr-only">
                {n} {n === 1 ? "star" : "stars"}, {LABELS[n]}
              </span>
            </label>
          ))}
        </div>
        <span aria-hidden="true" className="text-sm text-muted-foreground">
          {shown ? LABELS[shown] : "Choose a rating"}
        </span>
      </div>
      {error ? (
        <p id={`${name}-error`} role="alert" className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
