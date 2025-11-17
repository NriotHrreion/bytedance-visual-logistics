import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "build",
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  reactStrictMode: false
};

export default nextConfig;
