import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backend}/:path*`,
      },
    ];
  },
};

export default nextConfig;
