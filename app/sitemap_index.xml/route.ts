import { SITE_URL } from "@/lib/site";
import { xmlHeaders } from "@/lib/sitemaps";
export const dynamic = "force-static";
/** Same index URL Yoast used (already submitted in Search Console). */
export function GET() {
  const now = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${SITE_URL}/post-sitemap.xml</loc><lastmod>${now}</lastmod></sitemap><sitemap><loc>${SITE_URL}/page-sitemap.xml</loc><lastmod>${now}</lastmod></sitemap></sitemapindex>`;
  return new Response(xml, { headers: xmlHeaders });
}
