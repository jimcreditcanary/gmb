// Phase 4 §5: sitemap.xml family, robots.txt, RSS and JSON-LD validity on the built site.
import * as cheerio from 'cheerio'; import fs from 'fs';
const BASE = process.argv[2] || 'http://localhost:3011'; const out = []; const ok = (k, v, d = '') => out.push([k, v ? 'OK' : 'FAIL', d]);
const get = async (p) => { const r = await fetch(BASE + p); return { status: r.status, ct: r.headers.get('content-type') || '', body: await r.text() }; };
// sitemaps
const idx = await get('/sitemap_index.xml'); ok('sitemap_index.xml 200 xml', idx.status === 200 && /xml/.test(idx.ct)); const children = [...idx.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace('https://www.gmbcreditunion.com', ''));
ok('sitemap index lists post + page sitemaps', children.includes('/post-sitemap.xml') && children.includes('/page-sitemap.xml'), children.join(' '));
let urls = [];
for (const c of children) { const s = await get(c); const $ = cheerio.load(s.body, { xmlMode: true }); const locs = $('url > loc').map((i, e) => $(e).text()).get(); ok(`${c} parses (${locs.length} urls)`, s.status === 200 && locs.length > 0 && $.root().children().first()[0].name === 'urlset'); urls.push(...locs); }
const bad = urls.filter(u => !/^https:\/\/www\.gmbcreditunion\.com\/(.*\/)?$/.test(u)); ok('all sitemap URLs are https://www + trailing slash', bad.length === 0, bad.slice(0, 5).join(' '));
let missing = 0; for (const u of urls) { const r = await fetch(BASE + new URL(u).pathname, { redirect: 'manual' }); if (r.status !== 200) missing++; } ok(`every sitemap URL returns 200 (${urls.length})`, missing === 0, missing ? missing + ' not 200' : '');
const noindexInSitemap = []; for (const u of urls) { const r = await get(new URL(u).pathname); if (/noindex/.test(cheerio.load(r.body)('meta[name="robots"]').attr('content') || '')) noindexInSitemap.push(u); } ok('no noindex page in the sitemap', noindexInSitemap.length === 0, noindexInSitemap.join(' '));
// robots
const rb = await get('/robots.txt'); ok('robots.txt 200', rb.status === 200); ok('robots.txt allows crawl in production build', /Allow: \//.test(rb.body) && !/Disallow: \/\s*$/m.test(rb.body), rb.body.replace(/\n/g, ' | ')); ok('robots.txt points at sitemap_index.xml', /Sitemap: https:\/\/www\.gmbcreditunion\.com\/sitemap_index\.xml/.test(rb.body));
// legacy sitemap aliases
for (const p of ['/sitemap.xml', '/wp-sitemap.xml']) { const r = await fetch(BASE + p, { redirect: 'manual' }); ok(`${p} → 301 sitemap_index.xml`, r.status === 301 && /sitemap_index\.xml/.test(r.headers.get('location') || '')); }
// rss
const rss = await get('/our-blog/feed/'); const $r = cheerio.load(rss.body, { xmlMode: true }); ok('RSS 200 + rss+xml', rss.status === 200 && /rss\+xml/.test(rss.ct), rss.ct); ok('RSS has channel/title/link/items', $r('rss > channel > title').length === 1 && $r('rss > channel > item').length >= 8 && $r('item > link').first().text().startsWith('https://www.gmbcreditunion.com/'), `${$r('item').length} items`); ok('RSS items have pubDate + guid', $r('item').toArray().every(i => $r(i).find('pubDate').length && $r(i).find('guid').length));
// JSON-LD validity on every page in the sitemap
let invalid = 0, pagesWithOrg = 0, breadcrumbs = 0, total = 0; const types = {};
for (const u of urls) { const r = await get(new URL(u).pathname); const $ = cheerio.load(r.body); total++; let hasOrg = false, hasBc = false; $('script[type="application/ld+json"]').each((i, s) => { try { const j = JSON.parse($(s).html()); const nodes = j['@graph'] || [j]; for (const n of nodes) { const t = [].concat(n['@type'] || []); t.forEach(x => types[x] = (types[x] || 0) + 1); if (t.includes('Organization')) hasOrg = true; if (t.includes('BreadcrumbList')) hasBc = true; if (!n['@type']) invalid++; } } catch { invalid++; } }); if (hasOrg) pagesWithOrg++; if (hasBc) breadcrumbs++; }
ok(`JSON-LD parses on every page (${total})`, invalid === 0, invalid ? invalid + ' invalid blocks' : ''); ok('Organization/FinancialService on every page', pagesWithOrg === total, `${pagesWithOrg}/${total}`); ok('BreadcrumbList on every page', breadcrumbs === total, `${breadcrumbs}/${total}`);
ok('LoanOrCredit on 8 loan pages', types.LoanOrCredit === 8, String(types.LoanOrCredit)); ok('FinancialProduct on 7 savings pages', types.FinancialProduct === 7, String(types.FinancialProduct)); ok('Article on 63 posts (ours + Yoast = 126)', (types.Article || 0) >= 63, String(types.Article)); ok('FAQPage on 2 pages', types.FAQPage === 2, String(types.FAQPage));
// misc
const ll = await get('/llms.txt'); ok('llms.txt 200 text', ll.status === 200 && /text\/plain/.test(ll.ct)); const og = await fetch(BASE + '/og/?title=Test'); ok('OG image route renders PNG', og.status === 200 && /image\/png/.test(og.headers.get('content-type') || '')); const ati = await fetch(BASE + '/apple-touch-icon.png'); ok('apple-touch-icon.png 200', ati.status === 200);
const hdr = await fetch(BASE + '/'); ok('security headers present (HSTS, CSP, nosniff, XFO, Referrer-Policy)', ['strict-transport-security', 'content-security-policy', 'x-content-type-options', 'x-frame-options', 'referrer-policy'].every(h => hdr.headers.get(h)));
fs.writeFileSync('/Users/jamesfell/gmb/audit/validation.csv', [['check', 'result', 'detail'], ...out].map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n'));
out.forEach(r => console.log(r[1].padEnd(5), r[0], r[2] ? '— ' + r[2] : '')); console.log('FAIL count:', out.filter(r => r[1] === 'FAIL').length);
