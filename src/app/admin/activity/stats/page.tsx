import type { Metadata } from "next";
import ActivityStatsClient from "./ActivityStatsClient";

export const metadata: Metadata = { title: "Activity stats" };

export default function ActivityStatsPage() {
  return <ActivityStatsClient />;
}
