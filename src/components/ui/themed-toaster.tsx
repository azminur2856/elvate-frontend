"use client";

import { Toaster } from "react-hot-toast";

/**
 * react-hot-toast styled through the theme tokens so toasts follow
 * light/dark automatically, positioned below the fixed navbar.
 */
export function ThemedToaster() {
  return (
    <Toaster
      position="top-right"
      containerStyle={{ top: 80 }}
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--card)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
          boxShadow: "0 10px 30px -12px rgb(0 0 0 / 0.35)",
        },
        success: {
          iconTheme: {
            primary: "var(--success)",
            secondary: "var(--success-foreground)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--destructive)",
            secondary: "var(--destructive-foreground)",
          },
        },
      }}
    />
  );
}
