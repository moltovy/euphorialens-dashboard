import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, "../../.."),
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/next/dist/compiled/source-map/**/*",
      "../../../node_modules/next/dist/compiled/source-map/**/*",
    ],
  },
};

export default nextConfig;
