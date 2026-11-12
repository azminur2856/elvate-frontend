"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import { SMS_TURNED_OFF_MESSAGE, type PublicSettings } from "@/types/settings";

type FeatureFlags = PublicSettings & {
  /** True until the first answer (the flags read as OFF meanwhile). */
  loading: boolean;
  /** Re-read the switches, e.g. after an admin change or a 403 "turned off". */
  refresh: () => Promise<void>;
};

/** Safe default: every switch OFF while loading, on error, or before BE-25 is live. */
const ALL_OFF: PublicSettings = { smsOtpEnabled: false };

const FeatureFlagsContext = createContext<FeatureFlags | null>(null);

/** Reads `GET /settings/public` once per page load and shares the switches. */
export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<PublicSettings>(ALL_OFF);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get<PublicSettings>("/settings/public");
      setFlags({ smsOtpEnabled: res.data?.smsOtpEnabled === true });
    } catch {
      setFlags(ALL_OFF);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(() => ({ ...flags, loading, refresh }), [flags, loading, refresh]);
  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>;
}

const NO_PROVIDER: FeatureFlags = { ...ALL_OFF, loading: false, refresh: async () => {} };

export function useFeatureFlags(): FeatureFlags {
  return useContext(FeatureFlagsContext) ?? NO_PROVIDER;
}

/** The SMS routes answer 403 "SMS verification is turned off" while the switch is OFF. */
export function isSmsTurnedOff(err: unknown): boolean {
  if (!isAxiosError(err) || err.response?.status !== 403) return false;
  const message = (err.response.data as { message?: unknown } | undefined)?.message;
  return typeof message !== "string" || message.toLowerCase().includes(SMS_TURNED_OFF_MESSAGE.toLowerCase());
}
