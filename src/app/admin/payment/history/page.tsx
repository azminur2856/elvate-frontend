import type { Metadata } from "next";
import PaymentsClient from "./PaymentsClient";

export const metadata: Metadata = { title: "Payment history" };

export default function AdminPaymentsPage() {
  return <PaymentsClient />;
}
