import fs from 'fs'; import path from 'path';
import { ROOT, readJSON } from './lib.mjs';
const H = 'https://www.gmbcreditunion.com';
const inv = readJSON(ROOT + '/audit/raw/inventory.json'); const rs = Object.values(inv).sort((a, b) => a.url.localeCompare(b.url));
const stats = readJSON(ROOT + '/audit/raw/stats.json'); const I = stats.issues;
const media = readJSON(ROOT + '/audit/raw/media-manifest.json'); const ms = Object.values(media);
const tokens = readJSON(ROOT + '/audit/design-tokens.json'); const tp = readJSON(ROOT + '/audit/raw/third-party.json');
const wb = readJSON(ROOT + '/audit/raw/wayback-probe.json'); const locked = readJSON(ROOT + '/audit/raw/locked-pages.json');
const shots = readJSON(ROOT + '/audit/screenshots/before/_log.json', {}); const lhSummary = fs.existsSync(ROOT + '/audit/lighthouse-before/_summary.txt') ? fs.readFileSync(ROOT + '/audit/lighthouse-before/_summary.txt', 'utf8').trim().split('\n') : [];
const rel = u => u.replace(H, '') || '/'; const n = x => x.toLocaleString('en-GB');
const pages = rs.filter(r => r.kind === 'html' && r.status === 200 && !r.redirect_target && r.title);
const real = pages.filter(r => !/\/(file|filter)\//.test(r.url));
const isSynthetic = r => /conesso|\?s=test|\?page=0/.test(r.url) || /\/(About-Us|Contact-Us)\//.test(r.url);
const tplCounts = {}; pages.forEach(r => tplCounts[r.template_guess] = (tplCounts[r.template_guess] || 0) + 1);
const tplDesc = { home: 'Static front page (page-builder layout, body class `home`)', 'page-builder': 'Theme page-builder template (`template-layout` + `page-builder`): product, hub, about, contact, legal, campaign pages', 'page-downloads': 'Directors-area downloads template — password-protected (Password Protect WP plugin)', 'page-default': 'Default page template', 'blog-post': 'Single post (`single-post`)', 'blog-index': '/our-blog/ (`blog`) + its pagination', 'category-archive': '/category/uncategorised/ + pagination', 'tag-archive': '/tag/*', 'filter-archive': 'Custom taxonomy `filter` archives for the `file` post type (+ pagination)', 'file-single': 'Custom post type `file` single — title + date only, no download link exposed', search: 'Search results (probe `/?s=test`)', '404': '404 template' };
const tplExample = {}; for (const r of pages) if (!tplExample[r.template_guess] && !isSynthetic(r)) tplExample[r.template_guess] = r.url;
const docs = rs.filter(r => r.kind === 'document'); const docBy = {}; docs.forEach(r => { const k = `${r.content_type || '?'} ${r.status}`; docBy[k] = (docBy[k] || 0) + 1; });
const red = rs.filter(r => r.redirect_target);
const redCat = r => { const pu = new URL(r.url), pt = new URL(r.redirect_target); if (/^\/index\.php/.test(pu.pathname)) return 'legacy /index.php/ (Drupal-era) → clean path'; if (pu.pathname + '/' === pt.pathname && !pu.search) return 'missing trailing slash → slash'; if (pu.search && pt.pathname === pu.pathname.replace(/\/?$/, '/')) return '?page=N / query → canonical'; if (pt.pathname === '/' && pu.pathname !== '/') return 'to home'; if (pt.pathname.split('/').filter(Boolean).length > pu.pathname.split('/').filter(Boolean).length) return 'moved into section'; return 'renamed slug'; };
const redBy = {}; red.forEach(r => { const c = redCat(r); (redBy[c] = redBy[c] || []).push(r); });
const notable = red.filter(r => !['missing trailing slash → slash', '?page=N / query → canonical'].includes(redCat(r)) && !/^\/index\.php\/(?!$)/.test(new URL(r.url).pathname) || /index\.php\/(node|user|nivo|creditview|useful|member-saving|2021|filter\/tips|savings-accounts|loan-application$)/.test(r.url));
const fourohfour = rs.filter(r => r.status === 404);
const wb200 = wb.filter(w => w.live_status === 200), wb301 = wb.filter(w => w.live_status === 301), wb404 = wb.filter(w => w.live_status === 404);
const mediaOk = ms.filter(m => m.status === 200); const byExt = {}; mediaOk.forEach(m => { const e = (m.file || '').split('.').pop().toLowerCase() || '(none)'; byExt[e] = (byExt[e] || 0) + 1; });
const pal = Object.entries(tokens.colours).filter(([k, v]) => v.theme_count >= 2 && !/^(rgba\(0,0,0,0\)|#fff|#000|transparent|currentcolor)$/i.test(k)).slice(0, 14);
const shotsOk = Object.values(shots).filter(s => s.ok).length, shotsFail = Object.entries(shots).filter(([k, s]) => !s.ok);
const shotsExpected = rs.filter(r => r.kind === 'html' && r.final_status === 200 && /html/.test(r.content_type || '') && !r.redirect_target).length * 3;
const lhRows = lhSummary.map(l => { const m = l.match(/^(\S+) performance=(\d+) accessibility=(\d+) best-practices=(\d+) seo=(\d+)(?: agentic-browsing=(\d+))? LCP=(.+?) CLS=(.+?) TBT=(.+)$/); return m ? { t: m[1], p: +m[2], a: +m[3], bp: +m[4], seo: +m[5], lcp: m[7], cls: m[8], tbt: m[9] } : null; }).filter(Boolean);
const tagsSection = fs.readFileSync(ROOT + '/audit/third-party-inventory.md', 'utf8');
const pwPages = pages.filter(r => r.hasPw);
const descMissingReal = I.missing_description.filter(u => !/\/(file|filter)\//.test(u) && !/conesso|\?s=test|\?page=0|About-Us|Contact-Us/.test(u));
const ogMissingReal = I.missing_og_image.filter(u => !/\/(file|filter)\//.test(u) && !/conesso|\?s=test|\?page=0|About-Us|Contact-Us/.test(u));
const dupTitles = Object.entries(I.dup_title).filter(([t, us]) => !us.every(u => /\/(file|filter)\//.test(u))).map(([t, us]) => [t, us.filter(u => !/conesso/.test(u))]).filter(([t, us]) => us.length > 1);
const dupDesc = Object.entries(I.dup_description).map(([t, us]) => [t, us.filter(u => !/conesso/.test(u))]).filter(([t, us]) => us.length > 1);
let md = `# Phase 1 report — Discovery & baseline
**Site:** https://www.gmbcreditunion.com · **Generated:** ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false }).slice(0, 17)} (London) · **Crawled from:** this Mac (residential IP), headful Google Chrome 154 via Playwright, ≤2 top-level requests/sec, robots.txt honoured.

## 0. Pre-flight
- Playwright 1.63.0 + Chromium installed; crawl used the installed Google Chrome (\`channel: 'chrome'\`, non-headless) so the UA is a real \`Chrome/154\` string. StackProtect did not block any request.
- \`GET https://www.gmbcreditunion.com/\` → **200** (curl and Playwright). Title: *GMB Credit Union | Your money, your future, Your Credit Union*. GTM-NQCV3C4 present.
- WordPress 7.1.x (dashicons \`ver=7.1.3\`), custom theme \`gmbcu\` v1.48, Yoast SEO, Max Mega Menu 3.10.6, Contact Form 7 6.1.7, Password Protect WordPress, Embed Lottie Player, speculation-rules prefetch enabled.

## 1. Sources used (in order)
| Source | Result |
|---|---|
| \`/sitemap_index.xml\` (Yoast) | 6 child sitemaps → **455 URLs**: post 65, page 54, file 278, category 1, post_tag 2, filter 55; 95 unique images |
| \`/wp-json/wp/v2/*\` | **Skipped** — \`robots.txt\` has \`Disallow: /wp-json/\` and \`Disallow: /?rest_route=\`. Honoured per the brief. (CF7 still calls the REST API from the browser; that is the site's own traffic, not ours.) |
| DOM crawl from \`/\` | BFS over every same-origin anchor/link/img/srcset/background-image/iframe; non-HTML URLs probed with redirects recorded hop-by-hop |
| Wayback CDX (\`web.archive.org/cdx\`, domain match, collapsed by urlkey) | 2,668 captures. After dropping assets and junk queries, **217 candidate URLs** not in the sitemaps were probed live: **${wb200.length} × 200, ${wb301.length} × 301, ${wb404.length} × 404**. Live ones are in the inventory flagged \`source: wayback\` (\`wayback_machine_downloader\` gem not installed on this Mac; the CDX API it wraps was queried directly — same data). |

Crawl hygiene: the search page and some pagination markup emit \`?s=…\` / \`?page=0\` variants of every page; 319 such synthetic duplicates were crawled before the rule was added and have been **purged** from the inventory (list in \`audit/raw/junk-skipped.json\`). \`/?page=0\` (a Wayback-listed URL that still 200s) was kept.

## 2. Inventory totals — \`audit/url-inventory.csv\` (${n(rs.length)} rows)
| Status | Count |
|---|---|
${Object.entries(stats.byStatus).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

Of the ${rs.length} rows: **${pages.length} HTML pages return 200 directly** (${real.length} outside \`/file/\` + \`/filter/\`), ${docs.length} are non-HTML documents/feeds/sitemaps, ${red.length} redirect, ${fourohfour.length} 404.

Non-HTML rows: ${Object.entries(docBy).map(([k, v]) => `${k}: ${v}`).join(' · ')}.

### Page count by template (200 pages)
| template_guess | Pages | What it is | Example |
|---|---|---|---|
${Object.entries(tplCounts).sort((a, b) => b[1] - a[1]).map(([t, c]) => `| \`${t}\` | ${c} | ${tplDesc[t] || ''} | ${tplExample[t] ? rel(tplExample[t]) : ''} |`).join('\n')}

Notes: \`page-builder\` 50 = 42 real pages + 8 duplicates reached via newsletter-tracking links (see §9) and 2 case variants (\`/About-Us/\`, \`/Contact-Us/\` both 200 with lowercase canonicals). \`home\` 3 = \`/\`, \`/page/2/\` (200, noindex, canonical \`/\`) and \`/?page=0\`. The 278 \`file-single\` pages are empty shells (title + date, ~20 words, no download link); their PDFs sit behind the password-protected directors area.

### Blog posts
63 posts at **root-level slugs** (preserved as-is), all with \`Article\` + \`Person\` + \`BreadcrumbList\` JSON-LD from Yoast. Blog index \`/our-blog/\` paginates to \`/our-blog/page/8/\` (pages 2–8 are \`noindex,follow\`). RSS exists only at \`/our-blog/feed/\` (${(fs.readFileSync(ROOT + '/source/html/our-blog/feed/index.xml', 'utf8').match(/<item>/g) || []).length} items); \`/feed/\` and \`/comments/feed/\` 301 to \`/\`.

## 3. Titles & descriptions
- **Missing title:** ${I.missing_title.length}.
- **Missing meta description:** ${I.missing_description.length} pages, of which ${I.missing_description.length - descMissingReal.length} are \`/file/\`, \`/filter/\` or synthetic variants. Real pages missing one (${descMissingReal.length}):
${descMissingReal.map(u => `  - ${rel(u)}`).join('\n')}
- **Duplicate titles** (excluding file/filter):
${dupTitles.map(([t, us]) => `  - "${t}" × ${us.length}: ${us.map(rel).join(', ')}`).join('\n')}
- **Duplicate descriptions:**
${dupDesc.map(([t, us]) => `  - "${t.slice(0, 70)}…" × ${us.length}: ${us.map(rel).join(', ')}`).join('\n')}
- Titles > 60 chars: ${I.long_title.length} (${I.long_title.map(x => rel(x)).join('; ')}). Descriptions > 160 chars: ${I.long_desc.length}. None under 70.
- **H1:** ${I.multi_h1.length} pages with multiple H1; ${I.missing_h1.length} page with none: ${I.missing_h1.map(rel).join(', ')} (uses an H2 as the visible heading; also has an empty H2).
- **Canonical:** every 200 page has one; the only mismatches are the intended ones (\`/page/2/\` and \`/?page=0\` → \`/\`; \`/About-Us/\` → \`/about-us/\`). All canonicals are \`https://www\`.
- **robots meta:** ${I.noindex.length} pages are \`noindex,follow\` — all pagination (\`/page/N/\`) plus the search page. No \`X-Robots-Tag\` headers anywhere. The 404 template is \`noindex\`.
- **OG/Twitter:** all pages carry Yoast OG + \`twitter:card=summary_large_image\`. \`og:image\` is **absent on ${I.missing_og_image.length} pages** — every page that is not a blog post (${ogMissingReal.length} real pages incl. all loan/savings product pages, hub pages, about, contact, legal). Posts have an \`og:image\` (featured image). → candidate for the generated fallback in Phase 3.
- **JSON-LD:** 0 invalid blocks. Types seen: ${Object.entries(rs.reduce((a, r) => { (r.schema_types || []).forEach(t => a[t] = (a[t] || 0) + 1); return a; }, {})).map(([k, v]) => `${k} (${v})`).join(', ')}. No \`Organization\`, \`FinancialService\`, \`LoanOrCredit\`, \`FinancialProduct\` or \`FAQPage\` anywhere today — the Yoast \`WebSite\` node is the only org-level entity.

## 4. URLs that 404 (${fourohfour.length})
| URL | Found via | Note |
|---|---|---|
${fourohfour.map(r => `| ${rel(r.url)} | ${r.source} | ${/^\/(node|user|nivo|useful-links|2021-agm|filter\/tips|member-saving)/.test(rel(r.url)) ? 'target of a legacy /index.php/ 301 (Drupal-era path) — redirect chain ends in 404' : /junior-saver-account-application/.test(r.url) ? 'linked from /help-your-children-form-good-money-habits/ (broken internal link)' : /young-saver\/apply/.test(r.url) ? 'target of /savings/junior-saver/apply/ 301 — an apply page that no longer exists' : /apple-touch-icon/.test(r.url) ? 'referenced in <head> on every page' : 'probe'} |`).join('\n')}

## 5. Redirects (${red.length} live 301s) — all recorded in \`url-inventory.csv\` (\`redirect_target\`) and raw chains in \`audit/raw/inventory.json\`
| Category | Count |
|---|---|
${Object.entries(redBy).sort((a, b) => b[1].length - a[1].length).map(([k, v]) => `| ${k} | ${v.length} |`).join('\n')}

Notable (non-trivial) redirects that must be carried into Phase 2's \`redirects.csv\`:
| From | → To | Final |
|---|---|---|
${red.filter(r => !['missing trailing slash → slash', '?page=N / query → canonical'].includes(redCat(r)) && !/&quot|conesso/.test(r.url)).map(r => `| ${rel(r.url)} | ${rel(r.redirect_target)} | ${inv[r.redirect_target] ? inv[r.redirect_target].status : '?'} |`).join('\n')}

Multi-hop chains: ${red.filter(r => (r.redirect_chain || []).length > 1).map(r => rel(r.url)).join(', ') || 'none'} (2 hops each, via \`/index.php/\`). No http→https or apex→www hop was observed because the crawler normalises to \`https://www\`; both variants were spot-checked with curl and 301 correctly.

## 6. Wayback cross-check
- ${wb200.length} Wayback URLs still 200 but absent from sitemaps: pagination pages (\`/our-blog/page/N/\`, \`/category/uncategorised/page/N/\`, \`/filter/*/page/N/\`), the child sitemaps themselves, \`/?page=0\`, and **${wb200.filter(w => /\.pdf$/.test(w.url)).length} PDFs** (AGM 2024 papers, annual reports 2023–2025, Loan T&Cs, PrizeSaver T&Cs) — all downloaded.
- ${wb301.length} Wayback URLs now 301 (included above). ${wb404.length} are dead (mostly \`/index.php/node/N\`, \`/user/*\`, \`/sites/default/files/*\` Drupal artefacts and old \`?page=N\` listings) — listed in \`audit/raw/wayback-probe.json\`.

## 7. Captures
- **HTML:** every 200 page's *raw server response* saved to \`source/html/<path>/index.html\` (${rs.filter(r => r.file && /index\.html$/.test(r.file)).length} files). Sitemaps/feeds/robots saved alongside as \`index.xml\` / \`index.txt\`.
- **Media:** \`source/media/<site path>\` — ${mediaOk.length} files, ${(mediaOk.reduce((a, m) => a + (m.bytes || 0), 0) / 1e6).toFixed(0)} MB. By type: ${Object.entries(byExt).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ')}. Includes theme fonts (MencaBold/MencaMedium woff2+woff, Font Awesome 6, dashicons), favicon, 32 PDFs, 37 SVG icons, Lottie JSON animations, theme CSS/JS. Every WordPress-sized filename (\`-600x400\`, \`-scaled\`, \`-e1691…\`) was also requested with suffixes stripped; the full-size originals were already in \`srcset\` for all but 6, which were recovered. Largest-in-group flagged in \`audit/media-inventory.csv\` (${ms.filter(m => m.largest_in_group).length} groups). Missing: \`/apple-touch-icon.png\` (404) and 3 stale CF7 captcha PNGs.
- **Oversized originals to be aware of:** ${mediaOk.filter(m => m.width).sort((a, b) => b.bytes - a.bytes).slice(0, 4).map(m => `${m.file.split('/').pop()} ${m.width}×${m.height} ${(m.bytes / 1e6).toFixed(1)} MB`).join('; ')} — next/image will handle these.

## 8. Design tokens — \`audit/design-tokens.json\`
Extracted from \`site.min.css\` (theme, Milligram-based), Max Mega Menu CSS, CF7 CSS and the inline style blocks; vendor CSS (Font Awesome, normalize, animate, featherlight, slick, WP block presets) counted separately.

**Palette (theme usages):**
| Colour | Uses | Where |
|---|---|---|
${pal.map(([k, v]) => `| \`${k}\` | ${v.theme_count} | ${Object.keys(v.properties).slice(0, 3).join(', ')} — ${v.selectors.slice(0, 2).join('; ').slice(0, 90)} |`).join('\n')}

**Type:** \`MencaBold\` (headings/buttons) and \`MencaMedium\`, self-hosted woff2/woff in the theme; body falls back to \`sans-serif\`. Root \`font-size: 62.5%\` (Milligram) so rem values ×10 = px. Sizes used: ${Object.keys(tokens.font_sizes).filter(k => /rem|px/.test(k)).slice(0, 18).join(', ')}. Weights: ${Object.keys(tokens.font_weights).filter(k => /^\d|bold|normal/.test(k)).join(', ')}. Line-heights: ${Object.keys(tokens.line_heights).slice(0, 8).join(', ')}.
**Spacing (rem-based):** ${Object.entries(tokens.spacing_scale).slice(0, 12).map(([k, v]) => `${k}(${v.theme_count})`).join(' ')}.
**Radii:** ${Object.entries(tokens.border_radii).slice(0, 8).map(([k, v]) => `${k}(${v.theme_count})`).join(' ')} — 20px is the house radius. **Shadows:** none in theme. **Transitions:** .3s.
**Breakpoints:** ${Object.entries(tokens.breakpoints).filter(([k]) => /width/.test(k)).slice(0, 8).map(([k, v]) => `${k.replace('only screen and ', '')}(${v})`).join(', ')}; mega-menu collapses at 630px.
**Logos:** \`wp-content/themes/gmbcu/assets/images/logo.png\` (header), \`footer-logo.png\`, \`favicon.ico\`; 21 × 48px line-icon SVGs in \`/media/Icon-*.svg\`; Lottie header animations \`CU-*-Header-RGB*.json/.lottie\`.
Google Fonts (Roboto, Nunito) were observed on the network but only from third-party iframes (Trustpilot, Inbest), not from the theme.

## 9. Third-party scripts, embeds, forms, tracking — \`audit/third-party-inventory.md\`
- **In the HTML on every page:** GTM \`GTM-NQCV3C4\` (head snippet + noscript iframe), Trustpilot bootstrap script + TrustBox iframe (template 5406e65d… on 132 pages, 54ad5def… on 3), jQuery 3.6 from \`ajax.googleapis.com\` **in addition to** WP's bundled jQuery 3.7.1 (two jQuery copies), Lottie player, CF7 runtime, Mailchimp embedded form (footer, every page).
- **Injected at runtime by GTM:** CookieYes banner+script (\`client_data/0b3e95fe…\`), gtag.js for **GA4 \`G-XJX1EQ0QPW\`**, Google Ads/\`pagead2.googlesyndication.com/ccm/collect\` pings, Cloudflare Insights beacon. During the crawl (no consent interaction) \`region1.google-analytics.com/g/collect\` fired on effectively every page load — whether those were consent-mode "denied" pings or full hits needs checking in the GTM container before we replicate behaviour.
- **Iframes:** YouTube embeds (4 videos, 22 pages), MoneyHelper budget planner + debt-advice locator (\`partner-tools.moneyadviceservice.org.uk\`), Inbest benefits calculator (\`benefits.inbest.ai/iframe/gmbcreditunion\`), MoneyAdviceService \`tools.js\`.
- **Forms:** (1) Mailchimp \`POST gmbcreditunion.us5.list-manage.com/subscribe/post?u=d9343033dc8a6cee1d438cafd&id=a34de2255e&f_id=001bede0f0\` — fields \`EMAIL\` (required) + honeypot \`b_d9343033dc8a6cee1d438cafd_a34de2255e\` + submit; on every page. (2) Contact Form 7 on 5 pages (contact-us, AGM interest 2024/25/26, advocate) — fields listed in the inventory file. (3) Password Protect WP form on the 10 directors-area pages. Nothing was submitted.
- **External links:** Member Hub \`gmb.cumemberapp.com/login\` (nav + footer, never visited), App Store / Google Play, Trustpilot profile, FSCS, Facebook/Instagram/YouTube.
- **Odd:** four credit-score blog posts contain internal links carrying Conesso newsletter tracking params (\`?conesso_link_tag=…&utm_campaign=Jan+26+Newsletter…\`), two of them via \`/index.php/\` legacy paths — copy pasted from an email. Verbatim rule says keep them; flagging for your call.

## 10. Regulatory wording → \`audit/locked-pages.md\`
${locked.filter(l => !/\/(file|filter)\//.test(l.url)).length} real pages matched FSCS / APR / FCA-PRA / complaints-FOS / privacy-GDPR / T&Cs / credit-warning / interest-rate patterns (plus ${locked.filter(l => /\/(file|filter)\//.test(l.url)).length} \`/file/\` shells whose *titles* mention policies). The **site-wide footer** carries no regulatory *text* (it is two nav menus, the Mailchimp form and the FSCS badge \`fscs.svg\` linking to fscs.org.uk) — the badge makes it a locked shared component, but there is **no "authorised and regulated by the FCA/PRA", no Firm Reference Number and no copyright line anywhere in the footer or header**. The sentence *"GMB Credit Union is authorised and regulated by the Financial Conduct Authority (FCA) and the Prudential Regulation Authority (PRA)"* appears only inside the body copy of \`/member-hub-faqs/\` and \`/the-gmbcu-member-hub-is-coming-in-june-2026/\`; **no Firm Reference Number appears anywhere on the site**. Flagged in §14. Recommended \`locked: true\` set for Phase 2: all 9 \`/loans/*\`, all 8 \`/savings/*\`, \`/complaints/\`, \`/privacy-policy/\`, \`/faqs/\`, \`/member-hub-faqs/\`, \`/gmb-credit-union-prize-draw/\`, \`/about-us/\`, \`/contact-us/\`, the footer, plus every blog post that states an APR or rate (list in the file).

## 11. Screenshots — \`audit/screenshots/before/{1440,768,390}/\`
${shotsOk}/${shotsExpected} page-loads captured (${fs.readdirSync(ROOT + '/audit/screenshots/before/1440').length} + ${fs.readdirSync(ROOT + '/audit/screenshots/before/768').length} + ${fs.readdirSync(ROOT + '/audit/screenshots/before/390').length} files — \`/About-Us/\` and \`/Contact-Us/\` share a file with their lowercase twins on this case-insensitive disk) (full-page PNG, fresh load per viewport, lazy-load scrolled, animations paused, Member Hub blocked, CookieYes banner hidden via injected CSS so Phase 4 diffs compare page content rather than the consent overlay). ${shotsFail.length ? 'Failures: ' + shotsFail.map(([k, s]) => k + ' — ' + s.err).join('; ') : Object.keys(shots).length >= shotsExpected - 6 ? 'No failures; the 6 missing loads are the 2 case-variant URLs × 3 widths that map to the same filenames.' : '**Still running when this report was generated — re-run `node tools/report.mjs` to refresh.**'}

## 12. Lighthouse baseline — \`audit/lighthouse-before/\` (HTML + JSON per run)
Real Chrome, non-headless, live site, Lighthouse 13.5. Mobile = default throttled preset; desktop = \`--preset=desktop\`.
| Template / page | Form | Perf | A11y | Best-pr. | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
${lhRows.map(r => { const [t, f] = [r.t.replace(/-(mobile|desktop)$/, ''), r.t.match(/(mobile|desktop)$/)[1]]; return `| ${t} | ${f} | ${r.p} | ${r.a} | ${r.bp} | ${r.seo} | ${r.lcp} | ${r.cls} | ${r.tbt} |`; }).join('\n') || '| (not yet run) | | | | | | | | |'}
${lhRows.length ? `Mobile Performance range ${Math.min(...lhRows.filter(r => /mobile/.test(r.t)).map(r => r.p))}–${Math.max(...lhRows.filter(r => /mobile/.test(r.t)).map(r => r.p))}; the ≥95 target in Phase 3 is a large step up, driven mainly by LCP (hero PNGs served at original size, render-blocking CSS, two jQuery copies, Trustpilot/GTM/CookieYes on the critical path).` : ''}

## 13. What I could not retrieve
- \`/wp-json/\` REST data (robots-disallowed) — no post IDs, authors, categories beyond what Yoast exposes in HTML/sitemaps. Author archive \`/author/\` 404s anyway.
- Content behind the **directors-area password** (10 pages, 278 file posts' PDFs, 55 filter archives list only titles). Not attempted.
- Anything requiring the Member Hub, CF7 submission, or Mailchimp submission.
- \`/apple-touch-icon.png\` (404 on the live site).
- Original theme SCSS / PHP (only compiled CSS + rendered HTML are public). Template logic will be reconstructed from the rendered DOM.

## 14. Observations & risks for your decision
1. **278 empty \`/file/\` pages + 69 \`/filter/\` archives + 10 password pages are indexable and in the sitemap.** They are thin/duplicate content (e.g. \`Governance | GMBCU\` twice, \`Budget Archives\` twice) and expose board-minute titles publicly. Lift rule says preserve; I recommend we preserve the URLs but you decide whether they stay \`index\` or move to \`noindex\` + out of the sitemap.
2. \`/test/\` (1 word, indexable, in sitemap) and \`/page/2/\` (home duplicate) exist.
3. \`og:image\` missing on all non-post pages; no \`Organization\`/product schema at all.
4. Two jQuery versions, 18 MB hero PNG, Trustpilot + CookieYes + GTM all synchronous — explains the ~60 mobile Performance scores.
5. Analytics appeared to fire before any consent interaction; needs confirming in GTM/CookieYes config before we build Consent Mode v2.
6. Broken internal link: \`/junior-saver-account-application\` (404) from a 2019 post; \`/savings/junior-saver/apply/\` → 404 (apply flow removed).
7. Case-insensitive duplicates \`/About-Us/\` and \`/Contact-Us/\` return 200 (Apache). Vercel is case-sensitive; Phase 2 will propose 301s for those.
8. \`/feed/\` → \`/\` (301) while \`/our-blog/feed/\` is a live RSS feed; Phase 2 will propose keeping both behaviours.
9. **Horizontal overflow on phones:** 17 pages render wider than the 390px viewport (full-page shots came out 422–770px wide): how-did-our-members-get-involved-us, loans/family-loan, loans/member-loan, loans/save-borrow-loan, loans/savings-secured-loan, loans/starter-loan, loans/top-up-loan, our-enhanced-member-loans-explained … (full list \`audit/raw/mobile-overflow.txt\`). Mostly product pages with the rep-example/illustration blocks and the embed pages. A lift reproduces the layout, but we should decide whether matching an overflow bug counts as "visible change".
10. **No regulatory status statement site-wide.** The only "authorised and regulated" sentence is in two Member Hub pages' body copy, there is no FRN on the site, and the footer has the FSCS badge only. A pure lift reproduces that. If the client wants a footer disclosure it is a copy change for *them* to supply — I will not write it.

## 15. Open questions
1. Directors area: keep as password-gated pages in the new build (same password UX via a route handler), or drop from the public site/sitemap? Do you have the password / the PDFs from the client?
2. Should \`/file/*\` and \`/filter/*\` be preserved as indexable pages (pure lift) or preserved as URLs but \`noindex\`?
3. The newsletter-tracking (Conesso/UTM) internal links inside four posts — keep verbatim or clean to canonical paths?
4. \`/test/\` — keep?
5. Do you have access to the GTM container (NQCV3C4) and CookieYes account, so Phase 3 can replicate tags under Consent Mode v2 rather than guess?
6. Mailchimp: do you have an API key / audience ID (\`a34de2255e\` is the list id in the form) for the route-handler proxy, or should the new form keep posting directly to list-manage.com?
7. Trustpilot business unit ID 5406e65d… / 54ad5def…: fine to keep the official widget (lazy-loaded) or do you want a static SSR rendering of the score?

## 16. Artefacts
| Path | What |
|---|---|
| \`audit/url-inventory.csv\` | ${rs.length} rows, all requested columns |
| \`audit/media-inventory.csv\` + \`audit/raw/media-manifest.json\` | every media URL, status, size, dimensions, largest-in-group |
| \`audit/design-tokens.json\` | colours (with usage), fonts, font-faces, sizes, spacing, radii, shadows, breakpoints, logos |
| \`audit/third-party-inventory.md\` | scripts, network hosts, iframes, embeds, forms with fields, tracking IDs |
| \`audit/locked-pages.md\` | regulatory-wording matches per page + footer text |
| \`audit/screenshots/before/\` | 1440/768/390 full-page PNGs |
| \`audit/lighthouse-before/\` | mobile + desktop reports per template, \`_summary.txt\` |
| \`audit/raw/\` | sitemaps, Wayback CDX + probe, full crawl JSON (every anchor, image, form, heading per page), third-party network log, logs |
| \`source/html/\` · \`source/media/\` | verbatim captures |
| \`tools/\` | \`crawl.mjs\`, \`wayback-check.mjs\`, \`media.mjs\`, \`tokens.mjs\`, \`build-inventory.mjs\`, \`shots.mjs\`, \`lighthouse.sh\`, \`report.mjs\` — all re-runnable |

**STOP — awaiting your go-ahead for Phase 2.**
`;
fs.writeFileSync(ROOT + '/audit/phase-1-report.md', md);
console.log('report written', md.length, 'chars; LH rows', lhRows.length, 'shots', shotsOk + '/' + shotsExpected);
