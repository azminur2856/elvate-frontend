import type { Metadata } from "next";
import { Tags } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = { title: "Product categories" };

export default function AdminProductCategoriesPage() {
  return (
    <ComingSoon
      title="Product categories"
      description="Category management is under development."
      icon={Tags}
      badge="Under development"
      backHref="/admin/dashboard"
      backLabel="Back to dashboard"
    />
  );
}
