import type { Metadata } from "next";
import SubscriptionStatsClient from "./SubscriptionStatsClient";

export const metadata: Metadata = { title: "Subscription stats" };

export default function SubscriptionStatsPage() {
  return <SubscriptionStatsClient />;
}
