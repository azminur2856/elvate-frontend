"use client";

import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import type { AdminSetting, AdminSettingKey } from "@/types/settings";
import { DeliveryFeesCard } from "@/components/admin/settings/DeliveryFeesCard";
import { FormMessage } from "@/components/forms/FormMessage";
import { useFeatureFlags } from "@/components/settings/FeatureFlagsProvider";
import { LocalTime } from "@/components/shared/LocalTime";
import { PageShell } from "@/components/shared/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

type Confirm = { to: boolean; title: string; description: string; confirmLabel: string };

/** Switches that ask first: SMS before going on (it costs money), face login before going off (users lose it). */
const CONFIRM: Partial<Record<AdminSettingKey, Confirm>> = {
  sms_otp: {
    to: true,
    title: "Turn on SMS codes?",
    description:
      "This sends real SMS and uses SMS credits. Customers can then verify their phone and reset their password by SMS.",
    confirmLabel: "Turn on",
  },
  face_login: {
    to: false,
    title: "Turn off face login?",
    description:
      "Users won't be able to set up or sign in with face login until it's turned back on. Existing setups are kept.",
    confirmLabel: "Turn off",
  },
};

/** Shown when a switch can't be turned on (`available: false`). */
const UNAVAILABLE_NOTE: Partial<Record<AdminSettingKey, string>> = {
  sms_otp: "SMS provider not configured",
  face_login: "Face service not configured",
};

const ON_OFF_TOAST: Partial<Record<AdminSettingKey, [on: string, off: string]>> = {
  sms_otp: ["SMS codes are on.", "SMS codes are off."],
  face_login: ["Face login is on.", "Face login is off."],
};

export default function AdminSettingsClient() {
  const { refresh: refreshFlags } = useFeatureFlags();
  const [settings, setSettings] = useState<AdminSetting[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState<AdminSettingKey | null>(null);
  const [confirming, setConfirming] = useState<{ setting: AdminSetting; enabled: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const res = await api.get<AdminSetting[]>("/admin/settings");
      setSettings(res.data);
    } catch (err) {
      setSettings(null);
      setLoadError(
        isAxiosError(err) && err.response?.status === 404
          ? "Settings are not available on this server yet."
          : getErrorMessage(err, "Could not load the settings.")
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (setting: AdminSetting, enabled: boolean) => {
    setSaving(setting.key);
    try {
      const res = await api.patch<AdminSetting>(`/admin/settings/${encodeURIComponent(setting.key)}`, { enabled });
      setSettings((rows) => rows?.map((r) => (r.key === res.data.key ? res.data : r)) ?? rows);
      const [onText, offText] = ON_OFF_TOAST[setting.key] ?? [`${setting.label} is on.`, `${setting.label} is off.`];
      toast.success(res.data.enabled ? onText : offText);
      // Profile, forgot password etc. read the public switch.
      void refreshFlags();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change the setting."));
      // 409 = provider not configured: reload to show the real state.
      if (isAxiosError(err) && err.response?.status === 409) void load();
    } finally {
      setSaving(null);
      setConfirming(null);
    }
  };

  const toggle = (setting: AdminSetting, enabled: boolean) => {
    if (CONFIRM[setting.key]?.to === enabled) {
      setConfirming({ setting, enabled });
      return;
    }
    void save(setting, enabled);
  };

  const confirmCopy = confirming ? CONFIRM[confirming.setting.key] : undefined;

  return (
    <PageShell
      width="md"
      title="Settings"
      description="Switch features on or off and set the delivery fees for the whole site."
    >
      <div className="grid gap-4">
        {loadError ? (
          <div className="grid justify-items-start gap-3">
            <FormMessage variant="error">{loadError}</FormMessage>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              Try again
            </Button>
          </div>
        ) : !settings ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : settings.length === 0 ? (
          <p className="text-muted-foreground">There are no settings to change.</p>
        ) : (
          <div className="grid gap-4">
            {settings.map((s) => {
              const switchId = `setting-${s.key}`;
              const descriptionId = `${switchId}-description`;
              // Not configured: can't be turned on (409), but an "on" switch can still be turned off.
              const unavailable = !s.available && !s.enabled;
              return (
                <Card key={s.key}>
                  <CardContent className="grid gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Label htmlFor={switchId} className="text-base font-semibold">
                            {s.label}
                          </Label>
                          <Badge variant={s.enabled ? "success" : "secondary"}>{s.enabled ? "On" : "Off"}</Badge>
                        </div>
                        <p id={descriptionId} className="text-sm text-muted-foreground">
                          {s.description}
                        </p>
                      </div>
                      <Switch
                        id={switchId}
                        checked={s.enabled}
                        onCheckedChange={(v) => toggle(s, v)}
                        disabled={saving === s.key || unavailable}
                        aria-describedby={descriptionId}
                      />
                    </div>
                    {!s.available ? (
                      <p className="text-sm font-medium text-warning">
                        {UNAVAILABLE_NOTE[s.key] ?? "Not available on this server"}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      {s.updatedBy ? (
                        <>
                          Last changed by {s.updatedBy.name} · <LocalTime value={s.updatedAt} mode="datetime" />
                        </>
                      ) : (
                        "Not changed yet (default)"
                      )}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* BE-30: its own load, so it works even if the switches fail to load. */}
        <DeliveryFeesCard onSaved={() => void refreshFlags()} />
      </div>

      <ConfirmDialog
        open={Boolean(confirming)}
        onOpenChange={(open) => !open && saving === null && setConfirming(null)}
        title={confirmCopy?.title ?? ""}
        description={confirmCopy?.description}
        confirmLabel={confirmCopy?.confirmLabel}
        destructive={confirming?.enabled === false}
        loading={Boolean(confirming) && saving === confirming?.setting.key}
        onConfirm={() => (confirming ? save(confirming.setting, confirming.enabled) : undefined)}
      />
    </PageShell>
  );
}
