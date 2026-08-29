import type { Metadata } from "next";
import SubscriptionDetailsClient from "./SubscriptionDetailsClient";

export const metadata: Metadata = { title: "Your subscriptions" };

export default function SubscriptionDetailsPage() {
  return <SubscriptionDetailsClient />;
}
