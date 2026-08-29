"use client";

import React, { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Item = { quote: string; name: string; title: string };

function TestimonialCard({ item }: { item: Item }) {
  return (
    <figure className="flex h-full w-[320px] max-w-full shrink-0 flex-col justify-between rounded-2xl border border-border bg-card px-7 py-6 md:w-[420px]">
      <blockquote className="text-sm leading-relaxed">{item.quote}</blockquote>
      <figcaption className="mt-6 text-sm">
        <span className="block font-medium">{item.name}</span>
        <span className="block text-muted-foreground">{item.title}</span>
      </figcaption>
    </figure>
  );
}

/**
 * Marquee of cards (Aceternity). Pauses on hover; under
 * prefers-reduced-motion it renders a plain horizontally scrollable list
 * instead of an animation.
 */
export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: Item[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const reduced = useReducedMotion();
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (!reduced) setStart(true);
  }, [reduced]);

  if (reduced) {
    return (
      <ul className={cn("flex snap-x gap-4 overflow-x-auto py-4", className)}>
        {items.map((item) => (
          <li key={item.name} className="snap-start">
            <TestimonialCard item={item} />
          </li>
        ))}
      </ul>
    );
  }

  const duration = speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s";

  return (
    <div
      className={cn(
        "relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]",
        className
      )}
      style={
        {
          "--animation-duration": duration,
          "--animation-direction": direction === "left" ? "forwards" : "reverse",
        } as React.CSSProperties
      }
    >
      <ul
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
        )}
      >
        {items.map((item) => (
          <li key={item.name}>
            <TestimonialCard item={item} />
          </li>
        ))}
        {/* Duplicate set for the seamless loop; hidden from assistive tech. */}
        {items.map((item) => (
          <li key={`${item.name}-dup`} aria-hidden="true">
            <TestimonialCard item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
};
