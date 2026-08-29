import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      description="Account settings are under development. For now, manage your details from your profile."
      icon={Settings}
      backHref="/profile"
      backLabel="Go to profile"
    />
  );
}
