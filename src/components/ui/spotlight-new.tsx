"use client";
import React from "react";
import { motion, useReducedMotion } from "motion/react";

type SpotlightProps = {
  gradientFirst?: string;
  gradientSecond?: string;
  gradientThird?: string;
  translateY?: number;
  width?: number;
  height?: number;
  smallWidth?: number;
  duration?: number;
  xOffset?: number;
};

/**
 * Ambient light beams for the hero (Aceternity). Purely decorative:
 * pointer-events off, hidden from assistive tech by the parent, and static
 * under prefers-reduced-motion.
 */
export const Spotlight = ({
  gradientFirst = "radial-gradient(68.54% 68.72% at 55.02% 31.46%, color-mix(in srgb, var(--primary) 14%, transparent) 0, color-mix(in srgb, var(--primary) 4%, transparent) 50%, transparent 80%)",
  gradientSecond = "radial-gradient(50% 50% at 50% 50%, color-mix(in srgb, var(--primary) 10%, transparent) 0, color-mix(in srgb, var(--primary) 3%, transparent) 80%, transparent 100%)",
  gradientThird = "radial-gradient(50% 50% at 50% 50%, color-mix(in srgb, var(--primary) 7%, transparent) 0, color-mix(in srgb, var(--primary) 3%, transparent) 80%, transparent 100%)",
  translateY = -350,
  width = 560,
  height = 1380,
  smallWidth = 240,
  duration = 7,
  xOffset = 100,
}: SpotlightProps = {}) => {
  const reduced = useReducedMotion();
  const sweep = (offset: number) =>
    reduced
      ? undefined
      : {
          animate: { x: [0, offset, 0] },
          transition: { duration, repeat: Infinity, repeatType: "reverse" as const, ease: "easeInOut" as const },
        };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.div {...sweep(xOffset)} className="pointer-events-none absolute inset-y-0 left-0 w-full">
        <div
          style={{ transform: `translateY(${translateY}px) rotate(-45deg)`, background: gradientFirst, width, height }}
          className="absolute left-0 top-0"
        />
        <div
          style={{ transform: "rotate(-45deg) translate(5%, -50%)", background: gradientSecond, width: smallWidth, height }}
          className="absolute left-0 top-0 origin-top-left"
        />
        <div
          style={{ transform: "rotate(-45deg) translate(-180%, -70%)", background: gradientThird, width: smallWidth, height }}
          className="absolute left-0 top-0 origin-top-left"
        />
      </motion.div>

      <motion.div {...sweep(-xOffset)} className="pointer-events-none absolute inset-y-0 right-0 w-full">
        <div
          style={{ transform: `translateY(${translateY}px) rotate(45deg)`, background: gradientFirst, width, height }}
          className="absolute right-0 top-0"
        />
        <div
          style={{ transform: "rotate(45deg) translate(-5%, -50%)", background: gradientSecond, width: smallWidth, height }}
          className="absolute right-0 top-0 origin-top-right"
        />
        <div
          style={{ transform: "rotate(45deg) translate(180%, -70%)", background: gradientThird, width: smallWidth, height }}
          className="absolute right-0 top-0 origin-top-right"
        />
      </motion.div>
    </motion.div>
  );
};
