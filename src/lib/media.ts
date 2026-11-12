/**
 * Photos (API-CONTRACT.md → "Face setup option A, Face login switch, photo
 * system", BE-28 / FE-28).
 *
 * - People's photos come from the API as our own paths (`/media/me/avatar?…`,
 *   `/media/users/<id>/avatar?…`, `/media/avatar/<key>`). The browser loads
 *   them through the same-origin `/api/backend` proxy, so private pictures
 *   travel with the session cookie and no image host appears in the site.
 * - Shop photos come as `/img/<path>`, served by this app's own `/img` rewrite.
 *
 * Kept free of imports so `npm test` can load it directly.
 */

/** Same value as `BACKEND_URL` in constants.ts. */
const PROXY = process.env.NEXT_PUBLIC_BACKEND_URL || "/api/backend";

/** An API photo path → its URL through the proxy; anything else → undefined (show initials). */
export function mediaSrc(path: string | null | undefined): string | undefined {
  if (!path || !path.startsWith("/media/")) return undefined;
  return `${PROXY}${path}`;
}

/** Up to two capital letters for an avatar without a photo. */
export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  return letters || "?";
}

/** Shop photo served by the `/img` rewrite (BE-28). */
export function isShopImagePath(src: string): boolean {
  return src.startsWith("/img/");
}

/**
 * next/image loader for `/img/...`: asks the image CDN for the width the
 * browser needs (`tr=w-…,q-…`), so Vercel's own image optimiser is not used.
 */
export function shopImageLoader({ src, width, quality }: { src: string; width: number; quality?: number }): string {
  return `${src}${src.includes("?") ? "&" : "?"}tr=w-${width},q-${quality ?? 75}`;
}
