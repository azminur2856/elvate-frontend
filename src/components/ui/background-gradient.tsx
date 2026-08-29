"use client";
import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const GRADIENT =
  "bg-[radial-gradient(circle_farthest-side_at_0_100%,var(--chart-2),transparent),radial-gradient(circle_farthest-side_at_100%_0,var(--chart-4),transparent),radial-gradient(circle_farthest-side_at_100%_100%,var(--chart-3),transparent),radial-gradient(circle_farthest-side_at_0_0,var(--chart-1),var(--card))]";

/**
 * Animated gradient border (Aceternity), coloured from the chart tokens so it
 * works on both themes. Static under prefers-reduced-motion.
 */
export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  const reduced = useReducedMotion();
  const shouldAnimate = animate && !reduced;

  const motionProps = shouldAnimate
    ? {
        initial: { backgroundPosition: "0% 50%" },
        animate: { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] },
        transition: { duration: 5, repeat: Infinity, repeatType: "reverse" as const },
        style: { backgroundSize: "400% 400%" },
      }
    : {};

  return (
    <div className={cn("group relative p-[3px]", containerClassName)}>
      <motion.div
        aria-hidden="true"
        {...motionProps}
        className={cn(
          "absolute inset-0 z-[1] rounded-2xl opacity-50 blur-xl transition-opacity duration-500 group-hover:opacity-90",
          GRADIENT
        )}
      />
      <motion.div
        aria-hidden="true"
        {...motionProps}
        className={cn("absolute inset-0 z-[1] rounded-2xl", GRADIENT)}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};
