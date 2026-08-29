import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_FRONTEND_URL?.replace(/\/+$/, "") || "http://localhost:3000";

// Only routes an anonymous crawler can actually load (the individual tools
// and /subscription redirect to /login — see middleware.ts).
const publicRoutes = [
  "",
  "/about",
  "/contact",
  "/terms",
  "/digitalServices",
  "/shop",
  "/shop/men",
  "/shop/women",
  "/shop/children",
  "/sales&offer",
  "/login",
  "/signup",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return publicRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
