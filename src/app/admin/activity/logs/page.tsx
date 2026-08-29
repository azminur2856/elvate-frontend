import type { Metadata } from "next";
import ActivityLogsClient from "./ActivityLogsClient";

export const metadata: Metadata = { title: "Activity logs" };

export default function AdminActivityLogsPage() {
  return <ActivityLogsClient />;
}
