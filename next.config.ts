import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this app so a stray parent lockfile does not
  // confuse Turbopack's root inference.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
