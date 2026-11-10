import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // `npm run dev` sets this to `.next-dev` (see scripts/dev.mjs) so a local
  // production build in `.next` can never corrupt the running dev server.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
