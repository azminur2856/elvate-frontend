import {
  Ban,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Package,
  PackageCheck,
  RotateCcw,
  Truck,
  Undo2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { OrderStatus, PaymentStatus } from "@/types/commerce";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/orders";
import { Badge } from "@/components/ui/badge";

type Variant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "brand";

export const STATUS_STYLE: Record<OrderStatus, { variant: Variant; icon: LucideIcon }> = {
  PENDING: { variant: "warning", icon: Clock },
  CONFIRMED: { variant: "default", icon: CheckCircle2 },
  PROCESSING: { variant: "default", icon: Package },
  SHIPPED: { variant: "default", icon: Truck },
  OUT_FOR_DELIVERY: { variant: "brand", icon: Truck },
  DELIVERED: { variant: "success", icon: PackageCheck },
  CANCELLED: { variant: "destructive", icon: Ban },
  RETURNED: { variant: "secondary", icon: Undo2 },
};

const PAYMENT_STYLE: Record<PaymentStatus, { variant: Variant; icon: LucideIcon }> = {
  UNPAID: { variant: "outline", icon: CircleDollarSign },
  PAID: { variant: "success", icon: CheckCircle2 },
  REFUNDED: { variant: "secondary", icon: RotateCcw },
  FAILED: { variant: "destructive", icon: XCircle },
};

/** Order status as icon + text (never colour alone). */
export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const { variant, icon: Icon } = STATUS_STYLE[status] ?? STATUS_STYLE.PENDING;
  return (
    <Badge variant={variant} className={className}>
      <Icon aria-hidden="true" />
      {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  const { variant, icon: Icon } = PAYMENT_STYLE[status] ?? PAYMENT_STYLE.UNPAID;
  return (
    <Badge variant={variant} className={className}>
      <Icon aria-hidden="true" />
      {PAYMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
