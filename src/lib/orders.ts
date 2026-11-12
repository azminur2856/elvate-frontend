import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/types/commerce";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURN_REQUESTED: "Return requested",
  RETURNED: "Returned",
};

/** The happy path, in order (used for the progress timeline). */
export const ORDER_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export const ALL_ORDER_STATUSES: OrderStatus[] = [...ORDER_FLOW, "CANCELLED", "RETURN_REQUESTED", "RETURNED"];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid",
  PAID: "Paid",
  REFUNDED: "Refunded",
  FAILED: "Failed",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  COD: "Cash on delivery",
  STRIPE: "Card (Stripe)",
};

/** Short text for what a status means to the customer. */
export const ORDER_STATUS_HINTS: Record<OrderStatus, string> = {
  PENDING: "We have received your order and will confirm it soon.",
  CONFIRMED: "Your order is confirmed and will be packed shortly.",
  PROCESSING: "Your order is being packed.",
  SHIPPED: "Your order has left our warehouse.",
  OUT_FOR_DELIVERY: "Your parcel is on its way to you today.",
  DELIVERED: "Your order was delivered.",
  CANCELLED: "This order was cancelled.",
  RETURN_REQUESTED: "The delivery could not be completed. The parcel is on its way back to us.",
  RETURNED: "This order was returned.",
};

/** "Role" strings from the API → a friendly label for timelines. */
export function roleLabel(role: string | null | undefined): string {
  switch ((role ?? "").toUpperCase()) {
    case "ADMIN":
      return "Admin";
    case "STAFF":
      return "Staff";
    case "DELIVERY_MAN":
      return "Delivery";
    case "BUYER":
      return "Customer";
    case "SYSTEM":
      return "System";
    default:
      return role ?? "";
  }
}
