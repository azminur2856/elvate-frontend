/** Settings sections (`/settings?tab=…`). Plain module: usable from server and client. */
export const SETTINGS_TABS = ["account", "addresses", "security", "appearance", "danger"] as const;
export type SettingsTab = (typeof SETTINGS_TABS)[number];
