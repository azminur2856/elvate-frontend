import type { Metadata } from "next";
import { Store } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = { title: "Shop" };

export default function ShopPage() {
  return (
    <ComingSoon
      title="The Elvate shop is on its way"
      description="We're building a curated selection of products with exclusive offers. Check back soon."
      icon={Store}
    />
  );
}
