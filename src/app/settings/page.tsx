import type { Metadata } from "next";
import SettingsClient from "./SettingsClient";
import { SETTINGS_TABS, type SettingsTab } from "./tabs";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const initial = SETTINGS_TABS.includes(tab as SettingsTab) ? (tab as SettingsTab) : "account";
  return <SettingsClient initialTab={initial} />;
}
