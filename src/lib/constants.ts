// Base URL for all browser-side API calls. Defaults to the same-origin proxy
// path handled by the rewrite in next.config.ts, which keeps the backend's
// `session` cookie first-party so middleware.ts can read it.
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api/backend";
