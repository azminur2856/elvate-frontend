/**
 * Admin feature switches (API-CONTRACT.md → "Admin settings", BE-25 / FE-25,
 * the face login switch, BE-27 / FE-27) and delivery fees (BE-30 / FE-30).
 */

/** The three delivery numbers, whole BDT. `freeThreshold` 0 = free delivery off. */
export type ShippingFees = {
  insideDhaka: number;
  outsideDhaka: number;
  /** Compared with the subtotal minus any coupon discount. */
  freeThreshold: number;
};

/** `GET` / `PATCH /admin/settings/shipping` (ADMIN only). */
export type ShippingSettings = ShippingFees & {
  /** ISO date of the last change; `null` if never changed. */
  updatedAt: string | null;
  updatedBy: { name: string } | null;
};

/** `GET /settings/public` (no login needed). */
export type PublicSettings = {
  smsOtpEnabled: boolean;
  faceLoginEnabled: boolean;
  /** BE-30; missing on older servers. */
  shipping?: ShippingFees;
};

export type AdminSettingKey = "sms_otp" | "face_login";

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

/** The 403 message face setup and face login send while `face_login` is off. */
export const FACE_LOGIN_TURNED_OFF_MESSAGE = "Face login is turned off";
