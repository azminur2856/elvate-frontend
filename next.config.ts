import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Report-only for now: violations show in the browser console without
// blocking anything. Switch the header name to Content-Security-Policy once
// every page is clean. Next.js (streaming RSC payload) and next-themes inject
// inline scripts, so 'unsafe-inline' stays until nonces are added; React's
// dev overlay needs 'unsafe-eval' in development only.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://cdn.jsdelivr.net`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://ik.imagekit.io https://lh3.googleusercontent.com",
  "font-src 'self' data:",
  // Every API call goes through /api/backend (same origin). The face-api
  // models still come from GitHub Pages until they are self-hosted.
  "connect-src 'self' https://justadudewhohacks.github.io",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Face login and face setup use the camera; nothing uses the mic or location.
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  /* config options here */
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io", pathname: "/**" },
    ],
  },
  // Proxy every backend call through this app's own origin so the backend's
  // `session` cookie is stored first-party (under this domain) and is visible to
  // middleware.ts / getSession(). Without this, the cookie lives on the Render
  // domain and Next.js on Vercel can never read it.
  async rewrites() {
    const backend = (process.env.BACKEND_URL ?? "http://localhost:8000").replace(
      /\/+$/,
      ""
    );
    // Shop photos (BE-28 / FE-28): the API sends `/img/<path>` and this app
    // serves it from the image CDN, so its address never reaches the browser.
    // Server-only env; without it /img is simply not served.
    const images = process.env.IMAGEKIT_URL_ENDPOINT?.replace(/\/+$/, "");
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backend}/:path*`,
      },
      ...(images ? [{ source: "/img/:path*", destination: `${images}/:path*` }] : []),
    ];
  },
  // Old URLs that moved. `&` in a path is fragile (shells, analytics, some
  // proxies), so the offers page now lives at /offers.
  async redirects() {
    return [
      { source: "/sales&offer", destination: "/offers", permanent: true },
      { source: "/sales%26offer", destination: "/offers", permanent: true },
    ];
  },
};

export default nextConfig;
