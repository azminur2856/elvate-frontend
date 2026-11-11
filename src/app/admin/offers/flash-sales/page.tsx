import type { Metadata } from "next";
import { Zap } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = { title: "Flash sales" };

export default function AdminFlashSalesPage() {
  return (
    <ComingSoon
      title="Flash sales"
      description="Flash sale management is under development."
      icon={Zap}
      badge="Under development"
      backHref="/admin/dashboard"
      backLabel="Back to dashboard"
    />
  );
}
