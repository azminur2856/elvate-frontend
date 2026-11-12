import type { Metadata } from "next";
import AdminSettingsClient from "./AdminSettingsClient";

export const metadata: Metadata = { title: "Settings" };

/** ADMIN only: middleware sends STAFF and everyone else to /403. */
export default function AdminSettingsPage() {
  return <AdminSettingsClient />;
}
