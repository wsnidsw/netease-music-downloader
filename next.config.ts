import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  serverExternalPackages: ["NeteaseCloudMusicApi"],
};

export default nextConfig;
