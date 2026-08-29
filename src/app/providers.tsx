"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * Client-side providers for the whole app.
 *  - next-themes: `class` strategy (`.dark` on <html>), dark by default,
 *    follows the OS when the user picks "System".
 *  - MotionConfig: makes every `motion` component honour
 *    prefers-reduced-motion automatically.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
