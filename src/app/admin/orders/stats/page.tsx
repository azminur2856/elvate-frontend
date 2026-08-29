import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = { title: "Order stats" };

export default function AdminOrderStatsPage() {
  return (
    <ComingSoon
      title="Order statistics"
      description="Order analytics are under development."
      icon={BarChart3}
      badge="Under development"
      backHref="/admin/dashboard"
      backLabel="Back to dashboard"
    />
  );
}
