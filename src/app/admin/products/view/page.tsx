import type { Metadata } from "next";
import { Package } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = { title: "Products" };

export default function AdminProductsPage() {
  return (
    <ComingSoon
      title="Products"
      description="Product management is under development."
      icon={Package}
      badge="Under development"
      backHref="/admin/dashboard"
      backLabel="Back to dashboard"
    />
  );
}
