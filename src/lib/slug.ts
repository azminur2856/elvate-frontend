/** "Men's T-Shirts & Polos" → "mens-t-shirts-polos" (same idea as the backend slugify). */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Lowercase letters, digits and single dashes. */
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
