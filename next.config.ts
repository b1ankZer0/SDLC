import { server } from "@/backend/server";
import type { NextConfig } from "next";

server();

const nextConfig: NextConfig = {
  // Tell Next.js to ignore TS errors during production builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // (Optional) Also ignore ESLint errors on build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
