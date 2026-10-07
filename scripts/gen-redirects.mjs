// Turns audit/redirects.csv (the reviewed redirect plan) into lib/redirects.json consumed by next.config.ts.
import fs from 'node:fs';
const rows = fs.readFileSync('audit/redirects.csv', 'utf8').trim().split('\n').slice(1).map((l) => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"')));
const out = []; const seen = new Set();
for (const [source, destination, status, kind] of rows) {
  if (!/^\//.test(source) || /[<(:*]/.test(source)) continue;                       // platform rules / pattern rows are implemented in code, not here
  if (!/^\//.test(destination)) continue;                                          // 410s and "serve" rows handled by routes
  if (/^live-301 \(platform\)$/.test(kind)) continue;                               // trailing-slash: trailingSlash:true
  let dest = destination; if (/HOLD/.test(kind) && /^\/(file|filter)\//.test(destination)) { if (/^\/file\//.test(source)) continue; dest = '/'; }   // legacy path whose target is held: /file/* sources hit the 410 route, others go home
  let src = source.split('?')[0]; if (src.length > 1 && src.endsWith('/')) src = src.slice(0, -1); // Next matches without the trailing slash when trailingSlash:true
  const dst = destination.length > 1 ? destination.replace(/\/$/, '') : destination;
  if (src === '/' || seen.has(src) || src === dst || src + '/' === destination) continue; seen.add(src);
  out.push({ source: src, destination: dest, permanent: Number(status) === 301 || Number(status) === 308, kind });
}
// held directors area: temporary redirect to home (decision 2026-10-07)
out.push({ source: '/directors-area', destination: '/', permanent: false, kind: 'proposed-HOLD' }, { source: '/directors-area/:path*', destination: '/', permanent: false, kind: 'proposed-HOLD' });
out.push({ source: '/page/2', destination: '/', permanent: true, kind: 'proposed' });
out.push({ source: '/sitemap.xml', destination: '/sitemap_index.xml', permanent: true, kind: 'live-301' }, { source: '/wp-sitemap.xml', destination: '/sitemap_index.xml', permanent: true, kind: 'live-301' }, { source: '/file-sitemap.xml', destination: '/sitemap_index.xml', permanent: true, kind: 'proposed' }, { source: '/filter-files-sitemap.xml', destination: '/sitemap_index.xml', permanent: true, kind: 'proposed' }, { source: '/category-sitemap.xml', destination: '/sitemap_index.xml', permanent: true, kind: 'proposed' }, { source: '/post_tag-sitemap.xml', destination: '/sitemap_index.xml', permanent: true, kind: 'proposed' });
out.push({ source: '/feed', destination: '/', permanent: true, kind: 'live-301' }, { source: '/comments/feed', destination: '/', permanent: true, kind: 'live-301' }, { source: '/category/uncategorised/feed', destination: '/category/uncategorised/', permanent: true, kind: 'live-301' });
const dedup = [...new Map(out.map((r) => [r.source, r])).values()];
fs.writeFileSync('lib/redirects.json', JSON.stringify(dedup, null, 1));
console.log('redirects.json:', dedup.length, 'rules');
