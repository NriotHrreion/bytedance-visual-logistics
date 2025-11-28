import type { NextConfig } from "next";
import path from "path";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(path.resolve(process.cwd(), "../../"));

const nextConfig: NextConfig = {
  distDir: "build",
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  reactStrictMode: false
};

export default nextConfig;
