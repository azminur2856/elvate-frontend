import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_FRONTEND_URL?.replace(/\/+$/, "") || "http://localhost:3000";

const publicRoutes = [
  "",
  "/about",
  "/contact",
  "/terms",
  "/digitalServices",
  "/digitalServices/pdfToText",
  "/digitalServices/imageToText",
  "/digitalServices/imageResize",
  "/digitalServices/backgroundRemove",
  "/digitalServices/editImage",
  "/shop",
  "/subscription",
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
