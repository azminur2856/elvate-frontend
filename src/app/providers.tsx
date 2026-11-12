"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/components/cart/CartProvider";
import { FeatureFlagsProvider } from "@/components/settings/FeatureFlagsProvider";

/**
 * Client-side providers for the whole app.
 *  - next-themes: `class` strategy (`.dark` on <html>), dark by default,
 *    follows the OS when the user picks "System".
 *  - FeatureFlagsProvider: admin on/off switches (SMS), OFF until loaded.
 *  - MotionConfig: makes every `motion` component honour
 *    prefers-reduced-motion automatically.
 */
export function Providers({
  loggedIn,
  children,
}: {
  /** From the session cookie (root layout); picks guest vs server cart. */
  loggedIn: boolean;
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={200}>
          <FeatureFlagsProvider>
            <CartProvider loggedIn={loggedIn}>{children}</CartProvider>
          </FeatureFlagsProvider>
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
