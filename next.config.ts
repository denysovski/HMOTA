import type { NextConfig } from "next";

/**
 * Two targets:
 * - GitHub Pages (GITHUB_PAGES=true): a static export served from /HMOTA/.
 * - Vercel or any Node host: the normal build, with security headers.
 */
const pages = process.env.GITHUB_PAGES === "true";
const basePath = pages ? "/HMOTA" : "";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  ...(pages
    ? { output: "export", trailingSlash: true, images: { unoptimized: true } }
    : {
        images: { formats: ["image/avif", "image/webp"] },
        async headers() {
          return [{ source: "/(.*)", headers: securityHeaders }];
        },
      }),
};

export default nextConfig;
