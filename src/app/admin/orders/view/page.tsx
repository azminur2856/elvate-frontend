import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = { title: "Orders" };

export default function AdminOrdersPage() {
  return (
    <ComingSoon
      title="Orders"
      description="Order management is under development."
      icon={ClipboardList}
      badge="Under development"
      backHref="/admin/dashboard"
      backLabel="Back to dashboard"
    />
  );
}
