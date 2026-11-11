import type { Metadata } from "next";
import { TicketPercent } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = { title: "Coupons" };

export default function AdminCouponsPage() {
  return (
    <ComingSoon
      title="Coupons"
      description="Coupon management is under development."
      icon={TicketPercent}
      badge="Under development"
      backHref="/admin/dashboard"
      backLabel="Back to dashboard"
    />
  );
}
