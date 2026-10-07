import fs from 'fs';
import { ROOT, readJSON } from './lib.mjs';
const H = 'https://www.gmbcreditunion.com'; const inv = readJSON(ROOT + '/audit/raw/inventory.json'); const locked = Object.fromEntries(readJSON(ROOT + '/audit/raw/locked-pages.json').map(l => [l.url, l.hits.map(h => h.split(' (')[0])]));
const csv = rows => rows.map(r => r.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',')).join('\n') + '\n';
const rel = u => u.replace(H, '') || '/';
// ---------- categorisation
function cat(r) {
  const p = rel(r.url); const t = r.template_guess;
  if (/conesso|\?s=test|\?page=0/.test(p) || /^\/(About-Us|Contact-Us)\//.test(p)) return ['other', 'duplicate-variant', 'exclude-duplicate', 'synthetic/duplicate variant of a canonical page; handled by redirect/query rules'];
  if (/^\/(directors-area|file|filter)\//.test(p)) return ['other', 'held', 'hold', 'HOLD per Jim 2026-10-07 (directors area / file posts / filter archives) — see redirects.csv'];
  if (p === '/') return ['home', 'home', 'build', ''];
  if (p === '/page/2/') return ['home', 'home', 'redirect', 'noindex duplicate of / — 301 to /'];
  if (/^\/loans\/$/.test(p) || /^\/savings\/$/.test(p) || /^\/resources\/$/.test(p) || /^\/resources\/member-helper\/$/.test(p)) return ['hub', 'hub', 'build', ''];
  if (/^\/loans\/[^/]+\/$/.test(p)) return ['product-loan', 'product', 'build', ''];
  if (/^\/savings\/[^/]+\/$/.test(p)) return ['product-savings', 'product', 'build', p.includes('insurance') ? 'insurance benefit page; uses product template' : ''];
  if (p === '/about-us/') return ['about', 'about', 'build', ''];
  if (p === '/contact-us/') return ['contact', 'contact', 'build', 'CF7 form → route handler'];
  if (t === 'blog-post') return ['blog-post', 'post', 'build', ''];
  if (t === 'blog-index' || t === 'category-archive' || t === 'tag-archive') return ['blog-index', /\/page\/\d+\/$/.test(p) ? 'archive (paginated, noindex)' : 'archive', 'build', /category|tag/.test(p) ? 'taxonomy archive, generated from post frontmatter' : 'generated from content tree'];
  if (/^\/(privacy-policy|complaints)\/$/.test(p)) return ['legal-regulatory', 'legal', 'build', 'locked'];
  if (/^\/(faqs|member-hub-faqs)\/$/.test(p)) return ['utility', 'faq', 'build', 'accordion FAQ → FAQPage schema; locked (rates/regulatory statements inside)'];
  if (/member-helper\/(budget-planner|debt-advice-locator|benefit-calculator)\/$/.test(p) || p === '/cost-of-living/') return ['utility', 'embed', 'build', 'third-party iframe tool (MoneyHelper / Inbest) — lazy-load, reserve height to kill CLS 1.1'];
  if (t === 'search') return ['utility', 'system', 'build', 'no search UI exists on the site; /?s= serves home'];
  if (t === '404') return ['utility', 'system', 'build', 'not-found template'];
  if (p === '/test/') return ['other', 'generic', 'build', 'FLAG: 1-word page in sitemap; default = preserve verbatim, noindex recommended'];
  if (/^\/(annual-general-meeting-\d{4}|thank-you-for-your-interest-agm-\d{4}|join-us-(at-)?congress-\d{4}|join-gmbcu-get-25-and-a-chance-to-win-big|become-a-credit-union-advocate|gmb-credit-union-prize-draw|the-gmbcu-member-hub-is-coming-in-june-2026)\/$/.test(p)) return ['other', 'campaign', 'build', /thank-you/.test(p) ? 'CF7 thank-you page (keep, noindex recommended)' : /annual-general-meeting|advocate/.test(p) ? 'has CF7 form → route handler' : ''];
  return ['other', 'generic', 'build', 'REVIEW'];
}
const rows = [['url', 'category', 'template', 'action', 'locked', 'locked_reason', 'noindex_now', 'content_path', 'title', 'word_count', 'notes']];
const pages = Object.values(inv).filter(r => r.kind === 'html' && r.status === 200 && !r.redirect_target && r.title).sort((a, b) => a.url.localeCompare(b.url));
const summary = {};
for (const r of pages) {
  const [c, tpl, action, note] = cat(r); const p = rel(r.url);
  const isLocked = action === 'build' && (['product-loan', 'product-savings', 'legal-regulatory'].includes(c) || /faq/.test(tpl) || p === '/about-us/' || p === '/contact-us/' || p === '/' || (locked[r.url] || []).some(h => /FSCS|APR|FCA_PRA|Complaints|Interest_rate|Credit_warning|Terms/.test(h)));
  const slug = p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').split('/').pop();
  const contentPath = action !== 'build' ? '' : (tpl.startsWith('archive') || tpl === 'system') ? '(generated)' : `content/${c}/${slug}.mdx`;
  rows.push([r.url, c, tpl, action, isLocked ? 'true' : 'false', isLocked ? (locked[r.url] || ['category']).join('|') : '', /noindex/.test(r.robots_meta) ? 'true' : 'false', contentPath, r.title, r.word_count, note]);
  summary[c + ' / ' + action] = (summary[c + ' / ' + action] || 0) + 1;
}
fs.writeFileSync(ROOT + '/audit/categorisation.csv', csv(rows)); console.log('categorisation', rows.length - 1); console.log(summary);
// ---------- redirects
const red = [['source', 'destination', 'status', 'kind', 'reason']];
const add = (s, d, st, k, why) => red.push([s, d, st, k, why]);
add('http://gmbcreditunion.com/*', 'https://www.gmbcreditunion.com/:path*', 308, 'platform', 'apex→www + http→https; Vercel domain redirect (currently 301 on Apache)');
add('http://www.gmbcreditunion.com/*', 'https://www.gmbcreditunion.com/:path*', 308, 'platform', 'http→https; Vercel/HSTS');
add('https://gmbcreditunion.com/*', 'https://www.gmbcreditunion.com/:path*', 308, 'platform', 'apex→www');
add('/<path-without-trailing-slash>', '/<path>/', 308, 'platform', 'next.config trailingSlash:true reproduces WordPress behaviour (39 live examples below); note 308 vs WP 301 — equivalent for SEO');
add('/<Path-With-Uppercase>', '/<path lowercased>', 301, 'proposed', 'middleware rule: Apache served /About-Us/ and /Contact-Us/ case-insensitively (both 200, canonical lowercase); Vercel is case-sensitive');
add('/page/2/', '/', 301, 'proposed', 'home pagination page is a noindex duplicate of /');
add('/?page=N and /?s=…', '(serve route, ignore query)', '-', 'platform', 'query strings do not change routes in Next; /?page=0 and /?s=test currently 200 with canonical / — no search UI exists');
add('/sitemap.xml', '/sitemap_index.xml', 301, 'live-301', 'preserve; new build also emits /sitemap_index.xml (submitted in GSC) + child sitemaps post-sitemap.xml / page-sitemap.xml at the same paths');
add('/file-sitemap.xml', '/sitemap_index.xml', 301, 'proposed', 'file post type on hold');
add('/filter-files-sitemap.xml', '/sitemap_index.xml', 301, 'proposed', 'filter taxonomy on hold');
add('/our-blog/feed/', '(serve RSS)', 200, 'platform', 'only live feed; regenerate from content tree');
add('/directors-area/', '/', 302, 'proposed-HOLD', 'temporary while directors area is held (future Credit Canary portal). Alternative: 410');
add('/directors-area/:slug/', '/', 302, 'proposed-HOLD', '10 password-protected pages, held');
add('/file/:slug/', '(410 Gone)', 410, 'proposed-HOLD', '278 empty title+date shells, held; 410 removes them from the index fastest. Alternative: 302 → /');
add('/filter/:slug/', '(410 Gone)', 410, 'proposed-HOLD', '55 taxonomy archives (+14 paginated), held');
add('/filter/:slug/page/:n/', '(410 Gone)', 410, 'proposed-HOLD', 'paginated filter archives');
add('/junior-saver-account-application', '/savings/young-saver/', 301, 'proposed', 'dead internal link from /help-your-children-form-good-money-habits/ (404 today) — redirect instead of editing post copy');
add('/apple-touch-icon.png', '(serve file)', 200, 'platform', 'referenced in <head> on every page, 404 today; ship a real icon');
const fix404 = { '/2021-agm-summary': '/our-blog/', '/filter/tips': '/our-blog/', '/member-saving-account-application': '/savings/member-saver/', '/nivo': '/', '/node': '/', '/useful-links': '/resources/', '/user/login/': '/', '/user/logout/': '/', '/user/password/': '/', '/savings/young-saver/apply/': '/savings/young-saver/' };
for (const r of Object.values(inv).filter(r => r.redirect_target).sort((a, b) => a.url.localeCompare(b.url))) {
  const s = rel(r.url); let d = rel(r.redirect_target); const final = inv[r.redirect_target];
  if (/&quot/.test(s)) continue;
  if (/conesso/.test(s)) { add(s.split('?')[0], d.split('?')[0], 301, 'live-301', 'newsletter-tracking variant; query dropped, same rule as the base path'); continue; }
  const dp = d.split('?')[0]; let kind = 'live-301', why = 'preserve as-is';
  if (d.includes('?page=')) { d = dp; why = 'target normalised (query dropped)'; }
  if (/^\/(file|filter)\//.test(dp)) { kind = 'live-301→HOLD'; why = 'target is on hold → follows the hold rule above'; }
  else if (final && final.status === 404 || fix404[dp] || /^\/node\/\d+$/.test(dp)) { d = fix404[dp] || (/^\/node/.test(dp) ? '/' : d); kind = 'live-301 (retargeted)'; why = `current target ${dp} is 404 — mapped to nearest live equivalent (Drupal-era path)`; }
  else if (final && final.status === 301) { d = rel(final.redirect_target); why = 'collapsed 2-hop chain to final destination'; }
  if (s.replace(/\/$/, '') === d.replace(/\/$/, '') && !s.endsWith('/')) { kind = 'live-301 (platform)'; why = 'trailing slash — handled by trailingSlash:true'; }
  add(s, d, 301, kind, why);
}
fs.writeFileSync(ROOT + '/audit/redirects.csv', csv(red)); const by = {}; red.slice(1).forEach(r => by[r[3]] = (by[r[3]] || 0) + 1); console.log('redirects', red.length - 1, by);
