import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/debug": ["./.debug-dist/**/*"],
    "/debug/assets/*": ["./.debug-dist/assets/**/*"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
