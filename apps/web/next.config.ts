import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: ["@meme-launchpad/shared", "@meme-launchpad/sdk"],
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"]
    };

    return config;
  }
};

export default nextConfig;
