import type { Metadata } from "next";
import ActivityLogsClient from "./ActivityLogsClient";

export const metadata: Metadata = { title: "Activity logs" };

export default async function AdminActivityLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string | string[] }>;
}) {
  const { userId } = await searchParams;
  return <ActivityLogsClient initialUserId={typeof userId === "string" && userId ? userId : undefined} />;
}
