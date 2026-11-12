/**
 * Delivery fees (API-CONTRACT.md → "Delivery fees — BE-30 / FE-30"): the
 * admin form's checks (same rules and texts as the API), its example line,
 * and the cart's free-delivery progress.
 *
 * Only relative `.ts` imports so `npm test` can load it directly.
 */
import { formatBDT } from "./format.ts";
import type { ShippingFees } from "../types/settings.ts";

export const FEE_MAX = 5000;
export const FREE_THRESHOLD_MIN = 100;
export const FREE_THRESHOLD_MAX = 100000;

/** The API's 400 texts, used for the same checks in the form. */
export const FEE_MESSAGE = "Delivery fees must be whole numbers from 0 to 5,000.";
export const FREE_THRESHOLD_MESSAGE = "Free delivery must be 0 (off) or a whole number from 100 to 100,000.";

export type ShippingField = keyof ShippingFees;
/** What the admin typed, field by field. */
export type ShippingForm = Record<ShippingField, string>;
export type ShippingErrors = Partial<Record<ShippingField, string>>;

/** "60" → 60; anything that is not a plain whole number (empty, "1.5", "-3", "6e1") → null. */
export function parseWhole(text: string): number | null {
  const t = text.trim();
  if (!/^\d{1,7}$/.test(t)) return null;
  return Number(t);
}

export const isValidFee = (n: number | null): n is number => n !== null && n >= 0 && n <= FEE_MAX;

export const isValidFreeThreshold = (n: number | null): n is number =>
  n !== null && (n === 0 || (n >= FREE_THRESHOLD_MIN && n <= FREE_THRESHOLD_MAX));

/** Saved numbers → form text. */
export const toShippingForm = (fees: ShippingFees): ShippingForm => ({
  insideDhaka: String(fees.insideDhaka),
  outsideDhaka: String(fees.outsideDhaka),
  freeThreshold: String(fees.freeThreshold),
});

/** Checks the form; `fees` is set only when every field is valid. */
export function checkShippingForm(form: ShippingForm): { fees: ShippingFees | null; errors: ShippingErrors } {
  const insideDhaka = parseWhole(form.insideDhaka);
  const outsideDhaka = parseWhole(form.outsideDhaka);
  const freeThreshold = parseWhole(form.freeThreshold);
  const errors: ShippingErrors = {};
  if (!isValidFee(insideDhaka)) errors.insideDhaka = FEE_MESSAGE;
  if (!isValidFee(outsideDhaka)) errors.outsideDhaka = FEE_MESSAGE;
  if (!isValidFreeThreshold(freeThreshold)) errors.freeThreshold = FREE_THRESHOLD_MESSAGE;
  const ok = isValidFee(insideDhaka) && isValidFee(outsideDhaka) && isValidFreeThreshold(freeThreshold);
  return { fees: ok ? { insideDhaka, outsideDhaka, freeThreshold } : null, errors };
}

export const sameFees = (a: ShippingFees, b: ShippingFees) =>
  a.insideDhaka === b.insideDhaka && a.outsideDhaka === b.outsideDhaka && a.freeThreshold === b.freeThreshold;

/**
 * An order amount for the example line: the highest round amount below the
 * free-delivery threshold, at least three quarters of it (3,000 → 2,500;
 * 1,000 → 900; 100 → 90).
 */
export function exampleOrderAmount(threshold: number): number {
  for (const step of [500, 100, 50, 10]) {
    const amount = Math.floor((threshold - 1) / step) * step;
    if (amount > 0 && amount >= threshold * 0.75) return amount;
  }
  return Math.max(threshold - 1, 1);
}

/** The live example under the admin's fields. */
export function shippingExample(fees: ShippingFees): string {
  if (fees.freeThreshold === 0) return "Free delivery is off: every order pays the delivery fee.";
  const amount = exampleOrderAmount(fees.freeThreshold);
  return (
    `Example: a ${formatBDT(amount)} order inside Dhaka pays ${formatBDT(fees.insideDhaka)}. ` +
    `Orders of ${formatBDT(fees.freeThreshold)} or more ship free.`
  );
}

/**
 * Cart note: how far the subtotal is from free delivery. `null` when free
 * delivery is off (threshold 0 or unknown).
 */
export function freeDeliveryProgress(
  subtotal: number,
  threshold: number | null | undefined
): { free: boolean; remaining: number; percent: number } | null {
  if (!threshold || threshold <= 0) return null;
  const remaining = Math.max(0, Math.round((threshold - subtotal) * 100) / 100);
  const percent = Math.min(100, Math.max(0, Math.floor((subtotal / threshold) * 100)));
  return { free: remaining === 0, remaining, percent };
}
