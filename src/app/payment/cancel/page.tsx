import type { Metadata } from "next";
import { StatusPage } from "@/components/shared/StatusPage";

export const metadata: Metadata = { title: "Payment cancelled" };

export default function PaymentCancelPage() {
  return (
    <StatusPage
      title="Payment cancelled"
      description="Your payment was cancelled or didn't go through. Nothing was charged — you can try subscribing again whenever you like."
      action={{ href: "/subscription", label: "Try again" }}
    />
  );
}
