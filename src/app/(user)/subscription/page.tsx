import type { Metadata } from "next";
import SubscriptionPlansClient from "./SubscriptionPlansClient";

export const metadata: Metadata = { title: "Subscription plans" };

export default function SubscriptionPage() {
  return <SubscriptionPlansClient />;
}
