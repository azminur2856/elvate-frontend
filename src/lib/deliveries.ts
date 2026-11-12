import type { OrderStatus, OrderSummary } from "@/types/commerce";

/**
 * Filters of the delivery management page (`/admin/deliveries`, FE-29),
 * mapped to the `GET /admin/orders` query (`statuses`, `unassigned`, BE-29).
 */
export const DELIVERY_VIEWS = {
  all: {
    label: "All deliveries",
    statuses: ["PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "RETURN_REQUESTED", "DELIVERED", "RETURNED"],
  },
  waiting: { label: "Waiting for a delivery man", statuses: ["PROCESSING", "SHIPPED"], unassigned: true },
  assigned: { label: "Assigned, not picked up", statuses: ["SHIPPED"] },
  out: { label: "Out for delivery", statuses: ["OUT_FOR_DELIVERY"] },
  returns: { label: "Return requests", statuses: ["RETURN_REQUESTED"] },
  delivered: { label: "Delivered", statuses: ["DELIVERED"] },
  returned: { label: "Returned", statuses: ["RETURNED"] },
} satisfies Record<string, { label: string; statuses: OrderStatus[]; unassigned?: boolean }>;

export type DeliveryView = keyof typeof DELIVERY_VIEWS;

export const isDeliveryView = (v: string | null | undefined): v is DeliveryView =>
  Boolean(v) && Object.prototype.hasOwnProperty.call(DELIVERY_VIEWS, v as string);

/** Today as "YYYY-MM-DD" in the browser's time zone (for date inputs). */
export function todayInput(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Link to the delivery page with a filter, e.g. from the dashboard cards. */
export function deliveriesHref(view: DeliveryView, opts: { today?: boolean } = {}): string {
  const params = new URLSearchParams({ view });
  if (opts.today) params.set("day", "today");
  return `/admin/deliveries?${params}`;
}

/** Cash the delivery man still has to collect: unpaid COD orders on their way. */
export function cashToCollect(o: Pick<OrderSummary, "paymentMethod" | "paymentStatus" | "status" | "total">): number {
  const onTheWay = !["CANCELLED", "RETURNED", "DELIVERED", "RETURN_REQUESTED"].includes(o.status);
  return o.paymentMethod === "COD" && o.paymentStatus === "UNPAID" && onTheWay ? o.total : 0;
}
