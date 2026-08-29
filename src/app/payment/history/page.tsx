import type { Metadata } from "next";
import PaymentHistoryClient from "./PaymentHistoryClient";

export const metadata: Metadata = { title: "Payment history" };

export default function PaymentHistoryPage() {
  return <PaymentHistoryClient />;
}
