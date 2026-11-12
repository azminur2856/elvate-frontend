/**
 * Admin feature switches (API-CONTRACT.md → "Admin settings", BE-25 / FE-25).
 */

/** `GET /settings/public` (no login needed). */
export type PublicSettings = {
  smsOtpEnabled: boolean;
};

export type AdminSettingKey = "sms_otp";

/** A row of `GET /admin/settings`; `PATCH /admin/settings/:key` returns the same shape. */
export type AdminSetting = {
  key: AdminSettingKey;
  enabled: boolean;
  label: string;
  description: string;
  /** ISO date of the last change. */
  updatedAt: string;
  updatedBy: { name: string } | null;
  /** False when the provider is not configured: turning it on answers 409. */
  available: boolean;
};

/** The 403 message the SMS routes send while `sms_otp` is off. */
export const SMS_TURNED_OFF_MESSAGE = "SMS verification is turned off";
