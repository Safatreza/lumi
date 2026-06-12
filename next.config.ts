import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // All ML packages (@huggingface/transformers, tesseract.js, pdfjs-dist) run
  // ONLY in the browser via dynamic imports inside event handlers. Stub them
  // out of the server bundle entirely, and stub the Node-only optional deps
  // (sharp, onnxruntime-node) out of the client bundle.
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
      ...(isServer
        ? {
            "@huggingface/transformers": false,
            "tesseract.js": false,
            "pdfjs-dist": false,
          }
        : {}),
    };
    return config;
  },
  // Keep the heavy ML packages (incl. onnxruntime's ~300MB native binaries)
  // out of the serverless function output — they'd blow Vercel's 250MB
  // function limit and fail the deploy at "Deploying outputs".
  outputFileTracingExcludes: {
    "/*": [
      "node_modules/@huggingface/transformers/**",
      "node_modules/onnxruntime-node/**",
      "node_modules/onnxruntime-web/**",
      "node_modules/sharp/**",
      "node_modules/tesseract.js/**",
      "node_modules/tesseract.js-core/**",
      "node_modules/pdfjs-dist/**",
    ],
  },
};

export default nextConfig;
