"use client";

/**
 * Cart state. The shop is not built yet, so this returns an empty cart
 * instead of the previous hard-coded "3 items / $199". Replace with a real
 * store/API when the shop ships.
 */
export type Cart = { count: number; total: number; currency: string };

export function useCart(): Cart {
  return { count: 0, total: 0, currency: "৳" };
}
