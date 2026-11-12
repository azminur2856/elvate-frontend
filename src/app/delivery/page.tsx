import type { Metadata } from "next";
import DeliveryClient from "./DeliveryClient";

export const metadata: Metadata = { title: "Deliveries", robots: { index: false } };

export default function DeliveryPage() {
  return <DeliveryClient />;
}
