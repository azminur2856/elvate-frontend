import type { Metadata } from "next";
import SubscriptionsClient from "./SubscriptionsClient";

export const metadata: Metadata = { title: "Subscription history" };

export default function AdminSubscriptionsPage() {
  return <SubscriptionsClient />;
}
