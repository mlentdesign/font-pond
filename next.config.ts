import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
// Staged builds write to a separate folder so the served out/ folder never breaks mid-build (see scripts/build-live.sh).
const stagedDir = process.env.BUILD_OUT_DIR;

const nextConfig: NextConfig = {
  devIndicators: false,
  ...(isProd && stagedDir ? { distDir: stagedDir } : {}),
  ...(isProd ? { output: "export" } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
