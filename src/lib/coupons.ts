import type { Coupon } from "@/types/commerce";
import { formatBDT } from "./format";

type CouponTerms = Pick<Coupon, "type" | "value" | "minOrderAmount" | "maxDiscount">;

/** "10% off" / "৳200 off" */
export function couponHeadline(c: Pick<Coupon, "type" | "value">): string {
  return c.type === "PERCENT" ? `${c.value}% off` : `${formatBDT(c.value)} off`;
}

/** "10% off (up to ৳500) on orders over ৳1,000" */
export function describeCoupon(c: CouponTerms): string {
  let text = couponHeadline(c);
  if (c.type === "PERCENT" && c.maxDiscount) text += ` (up to ${formatBDT(c.maxDiscount)})`;
  if (c.minOrderAmount) text += ` on orders over ${formatBDT(c.minOrderAmount)}`;
  else text += " your order";
  return text;
}
