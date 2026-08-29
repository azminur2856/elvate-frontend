"use client";

import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import React, { type MouseEvent as ReactMouseEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * Card with a pointer-following highlight (Aceternity). The former WebGL
 * dot-matrix (Three.js) that mounted on every hover is gone; the highlight
 * is a plain radial mask in the theme's primary colour.
 */
export const CardSpotlight = ({
  children,
  radius = 350,
  className,
  ...props
}: {
  radius?: number;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: ReactMouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        "group/spotlight relative rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40",
        className
      )}
      onMouseMove={handleMouseMove}
      {...props}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px z-0 rounded-xl bg-primary/15 opacity-0 transition duration-300 group-hover/spotlight:opacity-100"
        style={{
          maskImage: useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, white, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};
