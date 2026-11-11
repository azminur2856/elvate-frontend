import type { Metadata } from "next";
import { Package } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = { title: "My orders" };

export default function OrdersPage() {
  return (
    <ComingSoon
      title="My orders"
      description="Your order history will appear here once the shop opens."
      icon={Package}
      backHref="/shop"
      backLabel="Go to the shop"
    />
  );
}
