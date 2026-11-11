/**
 * Post-login redirect helpers ("?next=/checkout").
 *
 * `next` comes from the URL, so it is untrusted: only same-origin, absolute
 * paths are accepted. Anything else (other origins, protocol-relative
 * "//evil.com", backslash tricks, auth pages that would loop) falls back.
 * Pure functions: safe in middleware (edge), server and client code.
 */

/** Auth pages never make sense as a destination (they would loop or bounce). */
const AUTH_PATHS = [
  "/login",
  "/signup",
  "/faceLogin",
  "/google",
  "/forgotPassword",
  "/resetPassword",
  "/verifyRegistration",
];

/** sessionStorage key that carries `next` through the Google OAuth round trip. */
export const LOGIN_NEXT_KEY = "elvate:login-next";

export function safeNextPath(raw: string | null | undefined, fallback = "/"): string {
  if (!raw || typeof raw !== "string") return fallback;
  const value = raw.trim();
  // Must be a root-relative path, not "//host" or "/\host".
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  // No control characters (newline / tab injection).
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;
  try {
    const base = "http://elvate.local";
    const url = new URL(value, base);
    if (url.origin !== base) return fallback;
    const path = url.pathname;
    if (AUTH_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) return fallback;
    return `${path}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

/** `/login`, or `/login?next=<path>` when there is somewhere worth returning to. */
export function loginHref(next?: string | null): string {
  const safe = safeNextPath(next, "");
  return safe && safe !== "/" ? `/login?next=${encodeURIComponent(safe)}` : "/login";
}

/** Role-aware landing route (see app/after-login/route.ts). */
export const AFTER_LOGIN = "/after-login";

/** Where to send the browser after a successful login. */
export const afterLoginTarget = (next: string) => (next === "/" ? AFTER_LOGIN : next);
