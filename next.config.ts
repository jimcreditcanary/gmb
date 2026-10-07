import type { NextConfig } from "next";
import redirects from "./lib/redirects.json";

const isProd = process.env.VERCEL_ENV === "production" || process.env.NEXT_PUBLIC_SITE_ENV === "production";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Content-Security-Policy", value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'" + (isProd ? "" : " 'unsafe-eval'") + " https://www.googletagmanager.com https://widget.trustpilot.com https://www.moneyadviceservice.org.uk https://partner-tools.moneyadviceservice.org.uk https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://www.google-analytics.com https://www.moneyadviceservice.org.uk https://*.google-analytics.com https://www.googletagmanager.com https://*.inbest.ai https://widget.trustpilot.com",
    "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://widget.trustpilot.com https://partner-tools.moneyadviceservice.org.uk https://*.moneyhelper.org.uk https://benefits.inbest.ai https://challenges.cloudflare.com https://www.googletagmanager.com",
    "worker-src 'self' blob:",
    "child-src 'self' blob: https://www.youtube-nocookie.com https://www.youtube.com https://widget.trustpilot.com https://partner-tools.moneyadviceservice.org.uk https://*.moneyhelper.org.uk https://benefits.inbest.ai https://challenges.cloudflare.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self' https://gmbcreditunion.us5.list-manage.com",
    "object-src 'none'",
    ...(isProd ? ["upgrade-insecure-requests"] : []),
  ].join("; ") },
];

const nextConfig: NextConfig = {
  trailingSlash: true,                       // reproduces WordPress URLs byte-for-byte
  skipTrailingSlashRedirect: true,           // proxy.ts issues the slash redirect itself (301, one hop even for legacy sources)
  reactStrictMode: true,
  // inlineCss was tried: it duplicates the CSS into the RSC payload (+400 KB/page). Small purged stylesheets are cheaper.
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"], deviceSizes: [390, 640, 768, 1024, 1280, 1440, 1920], imageSizes: [48, 96, 160, 300, 600], minimumCacheTTL: 60 * 60 * 24 * 30 },
  async redirects() {
    // explicit 301/302 (not Next's default 308/307) so the status codes match the WordPress site exactly
    return (redirects as { source: string; destination: string; permanent: boolean }[]).map(({ source, destination, permanent }) => ({ source, destination, statusCode: permanent ? 301 : 302 }));
  },
  async headers() {
    const h: { source: string; headers: { key: string; value: string }[] }[] = [{ source: "/:path*", headers: securityHeaders }];
    if (!isProd) h.push({ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] });
    h.push({ source: "/media/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] });
    h.push({ source: "/theme/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] });
    return h;
  },
};

export default nextConfig;
