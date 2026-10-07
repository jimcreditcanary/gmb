import type { MetadataRoute } from "next";
import { SITE, SITE_URL } from "@/lib/site";
/** Production: allow + sitemap index. Any other environment: disallow everything (plus X-Robots-Tag noindex from next.config headers). */
export default function robots(): MetadataRoute.Robots {
  if (!SITE.isProduction) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/"] }, sitemap: `${SITE_URL}/sitemap_index.xml` };
}
