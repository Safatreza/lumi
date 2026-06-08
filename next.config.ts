import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @huggingface/transformers (transformers.js) ships optional Node-only deps
  // (onnxruntime-node, sharp). We only ever run it client-side via dynamic
  // import, so stub those out to keep the bundle + Vercel build clean.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
    };
    return config;
  },
  // Don't try to bundle these heavy/native packages on the server.
  serverExternalPackages: ["@huggingface/transformers"],
};

export default nextConfig;
