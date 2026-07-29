import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site uses local, pre-compressed campaign photography. Serving these
  // files directly also keeps local preview independent of Cloudflare's
  // production-only ASSETS and IMAGES bindings.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
