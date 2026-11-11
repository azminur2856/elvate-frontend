import type { Metadata } from "next";
import { Truck } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = { title: "Deliveries" };

export default function DeliveryPage() {
  return (
    <ComingSoon
      title="Deliveries"
      description="Assigned deliveries will appear here."
      icon={Truck}
      badge="Under development"
    />
  );
}
