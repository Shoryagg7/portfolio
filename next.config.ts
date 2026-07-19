import type { NextConfig } from "next";

// GITHUB_PAGES=true switches to a fully static export served from
// https://<user>.github.io/portfolio — no server, so no ISR (a scheduled
// GitHub Action rebuilds daily to refresh live stats).
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  // Allow opening the dev server from other devices on the LAN
  // (Next 16 blocks cross-origin dev resources by default).
  allowedDevOrigins: ["192.168.0.103", "192.168.0.*"],
  ...(isGithubPages && {
    output: "export" as const,
    basePath: "/portfolio",
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default nextConfig;
