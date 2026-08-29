"use client";
import React, { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "@/lib/utils";

type StickyScrollItem = {
  title: string;
  description: string;
  content?: React.ReactNode;
};

/**
 * Scroll-linked feature list (Aceternity). Uses the PAGE scroll — the
 * previous nested 30rem scroll container trapped the wheel/touch scroll.
 */
export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: StickyScrollItem[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const breakpoints = content.map((_, index) => index / cardLength);
    const closest = breakpoints.reduce((acc, bp, index) => {
      return Math.abs(latest - bp) < Math.abs(latest - breakpoints[acc]) ? index : acc;
    }, 0);
    if (closest !== activeCard) setActiveCard(closest);
  });

  // Decorative gradients for the sticky visual (theme-independent artwork).
  const gradients = [
    "linear-gradient(to bottom right, var(--chart-1), var(--chart-2))",
    "linear-gradient(to bottom right, var(--chart-5), var(--chart-4))",
    "linear-gradient(to bottom right, var(--chart-3), var(--brand))",
  ];

  return (
    <div ref={ref} className="relative mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_20rem]">
      <div>
        {content.map((item, index) => (
          <div key={item.title + index} className="py-16 first:pt-4 last:pb-4">
            <motion.h3
              animate={{ opacity: activeCard === index ? 1 : 0.4 }}
              className="text-2xl font-bold"
            >
              {item.title}
            </motion.h3>
            <motion.p
              animate={{ opacity: activeCard === index ? 1 : 0.4 }}
              className="mt-4 max-w-prose text-lg leading-relaxed text-muted-foreground"
            >
              {item.description}
            </motion.p>
          </div>
        ))}
      </div>
      <div
        aria-hidden="true"
        style={{ background: gradients[activeCard % gradients.length] }}
        className={cn(
          "sticky top-[calc(var(--navbar-h)+2rem)] hidden h-60 w-80 overflow-hidden rounded-xl border border-border transition-[background] duration-500 lg:block",
          contentClassName
        )}
      >
        {content[activeCard].content ?? null}
      </div>
    </div>
  );
};
