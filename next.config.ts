import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  enlist: {
    ignoreDuringBuild: true, // Ignore during build
  },
};

export default nextConfig;
