import type { Metadata } from "next";
import { Tag } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = { title: "Sales & Offers" };

export default function SalesAndOffersPage() {
  return (
    <ComingSoon
      title="Sales & offers"
      description="Discounts and exclusive deals on Elvate products and services will appear here soon."
      icon={Tag}
    />
  );
}
