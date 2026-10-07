import { getPosts } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
export const dynamic = "force-static";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** RSS 2.0 for /our-blog/feed/ (the only live feed on the WordPress site). */
export function GET() {
  const posts = getPosts().slice(0, 10);
  const items = posts.map((p) => { const f = p.frontmatter; return `<item><title>${esc(f.cardTitle || f.h1 || f.title.replace(/ \| .*$/, ""))}</title><link>${SITE_URL}${f.slug}</link><guid isPermaLink="true">${SITE_URL}${f.slug}</guid><pubDate>${new Date(f.publishedAt!).toUTCString()}</pubDate><description>${esc(f.excerpt || f.description)}</description></item>`; }).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Our Blog | GMB Credit Union</title><atom:link href="${SITE_URL}/our-blog/feed/" rel="self" type="application/rss+xml"/><link>${SITE_URL}/our-blog/</link><description>Stay updated with the latest Credit Union news, useful info, and tips.</description><language>en-GB</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
