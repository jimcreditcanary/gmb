// Normalise Wayback CDX originals, drop ones already in sitemaps, probe live status (no redirects followed) at <=2 req/s
import { launch, throttle, norm, allowed, isInternal, ROOT, readJSON, writeJSON } from './lib.mjs';
const rows = readJSON(ROOT + '/audit/raw/wayback-cdx.json').slice(1);
const sm = new Set(readJSON(ROOT + '/audit/raw/sitemap-urls.json').map(u => u.loc));
const cands = new Map();
for (const [orig, status, mime, ts] of rows) {
  const n = norm(orig); if (!n || !isInternal(n) || !allowed(n)) continue;
  const u = new URL(n);
  if (/\.(css|js|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot|map)$/i.test(u.pathname)) continue;      // assets handled in media pass
  if (/^\/wp-(content|includes)\//.test(u.pathname) && !/\.pdf$/i.test(u.pathname)) continue;
  if (/replytocom=|\?s=|utm_|fbclid|\?share=|\?p=\d|\?page_id=|\?attachment_id|\?preview|\?customize|wp-login|\?ver=|cmpQuery|\?amp/i.test(u.search)) continue;
  if (u.search && !/^\?(paged?=\d+)$/.test(u.search)) continue;     // only keep pagination queries
  if (sm.has(n)) continue;
  const prev = cands.get(n); if (!prev || ts > prev.ts) cands.set(n, { url: n, wb_status: status, mime, ts });
}
console.log('wayback candidates to probe:', cands.size);
const { browser, ctx } = await launch();
const out = [];
let i = 0;
for (const c of cands.values()) {
  await throttle();
  try {
    const r = await ctx.request.get(c.url, { maxRedirects: 0, timeout: 30000 });
    const loc = r.headers()['location'] || '';
    out.push({ ...c, live_status: r.status(), redirect_target: loc ? norm(loc, c.url) : '', content_type: (r.headers()['content-type'] || '').split(';')[0] });
  } catch (e) { out.push({ ...c, live_status: 'ERR', error: String(e.message).slice(0, 120) }); }
  if (++i % 50 === 0) { console.log(i, '/', cands.size); writeJSON(ROOT + '/audit/raw/wayback-probe.json', out); }
}
writeJSON(ROOT + '/audit/raw/wayback-probe.json', out);
await browser.close();
const by = {}; out.forEach(o => by[o.live_status] = (by[o.live_status] || 0) + 1);
console.log('done', by);
