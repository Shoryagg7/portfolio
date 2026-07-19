import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow opening the dev server from other devices on the LAN
  // (Next 16 blocks cross-origin dev resources by default).
  allowedDevOrigins: ["192.168.0.103", "192.168.0.*"],
};

export default nextConfig;
