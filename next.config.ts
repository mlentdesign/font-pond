import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "export",
  basePath: "/font-pond",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
