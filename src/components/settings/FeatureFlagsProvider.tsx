"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import { FACE_LOGIN_TURNED_OFF_MESSAGE, SMS_TURNED_OFF_MESSAGE, type PublicSettings } from "@/types/settings";

type FeatureFlags = PublicSettings & {
  /** True until the first answer (the flags read as OFF meanwhile). */
  loading: boolean;
  /** Re-read the switches, e.g. after an admin change or a 403 "turned off". */
  refresh: () => Promise<void>;
};

/** Safe default: every switch OFF while loading, on error, or before BE-25 is live. */
const ALL_OFF: PublicSettings = { smsOtpEnabled: false, faceLoginEnabled: false };

const FeatureFlagsContext = createContext<FeatureFlags | null>(null);

/** Reads `GET /settings/public` once per page load and shares the switches. */
export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<PublicSettings>(ALL_OFF);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get<PublicSettings>("/settings/public");
      setFlags({
        smsOtpEnabled: res.data?.smsOtpEnabled === true,
        // Until BE-27 the answer has no `faceLoginEnabled`: face login works as
        // before. Once the field is there, only `true` counts as on.
        faceLoginEnabled: res.data?.faceLoginEnabled !== false,
      });
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

function isTurnedOff(err: unknown, text: string, anyMessage: boolean): boolean {
  if (!isAxiosError(err) || err.response?.status !== 403) return false;
  const message = (err.response.data as { message?: unknown } | undefined)?.message;
  if (typeof message !== "string") return anyMessage;
  return message.toLowerCase().includes(text.toLowerCase());
}

/** The SMS routes answer 403 "SMS verification is turned off" while the switch is OFF. */
export function isSmsTurnedOff(err: unknown): boolean {
  return isTurnedOff(err, SMS_TURNED_OFF_MESSAGE, true);
}

/** Face setup and face login answer 403 "Face login is turned off" while the switch is OFF (BE-27). */
export function isFaceLoginTurnedOff(err: unknown): boolean {
  return isTurnedOff(err, FACE_LOGIN_TURNED_OFF_MESSAGE, false);
}
