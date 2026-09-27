import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  devIndicators: false,
  ...(isProd ? { output: "export" } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
