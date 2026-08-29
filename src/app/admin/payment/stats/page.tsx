import type { Metadata } from "next";
import PaymentStatsClient from "./PaymentStatsClient";

export const metadata: Metadata = { title: "Payment stats" };

export default function PaymentStatsPage() {
  return <PaymentStatsClient />;
}
