# Phase 4 report — QA
**Generated:** 07/10/2026, 12:52 (London) · Build: production mode (`NEXT_PUBLIC_SITE_ENV=production`), served locally with `next start`. Changes made in this phase are logged in `docs/deviations.md` (#2–#4, #23–#24).

## 1. Regression — `audit/regression.csv` (648 URLs from the Phase 1 inventory)
Per URL: status, title, description, canonical, H1, OG tags, schema types, word count (±2%, same extraction method on both sides), internal links, redirect hops.
| Check | Result |
|---|---|
| Pages that were 200 and are served 200 | 165 |
| Live redirects reproduced (one hop, same code, planned target) | 94 / 94 |
| URLs now 410 (held `/file/*`, `/filter/*`) | 350 |
| Redirects needing more than one hop | 0 |
| Title / description / canonical / H1 / OG / schema mismatches | 0 |
| **Failures** | **2** |
- `/category/uncategorised/page/8/`: words 289→260
- `/our-blog/page/8/`: words 289→260

Both remaining rows are the last blog archive page: WordPress listed 64 cards because one post (`/gmbcu-members-prize-draw/`) still exists in WP behind a 301 to the prize-draw page; the new archive lists the 63 real posts, so page 8 has 7 cards instead of 8.

Also verified: `/humans.txt` and `/apple-touch-icon.png` now 200 (were 404), `/About-Us/` and `/Contact-Us/` 301 to lowercase, legacy `/index.php/*` paths resolve in one hop.

## 2. Visual regression — `audit/pixel-diff.csv`, `audit/pixel-diff-aligned.csv`, `audit/screenshots/{after,diff,compare}/`
Before = live WordPress (Phase 1), after = this build, same Playwright settings (fresh load per viewport, lazy-load scrolled, animations paused, consent banners hidden). 1,476 pairs captured; the 1,041 held `/file/*`, `/filter/*` and directors-area pages now render a 410/redirect and are excluded from the visual comparison. Two measures on the 405 real-page pairs:
- **naive** (pixelmatch on the full page): every page is over the 1% threshold, because any height change near the top shifts everything below it; median 20.8%.
- **aligned** (each 32-px band of the new page matched to its best position in the old page before comparing): 1440px median 6.06%, 62/135 pages ≤5%; 768px median 8.83%, 49/135 pages ≤5%; 390px median 17.31%, 52/135 pages ≤5%.

What the residual differences are (checked by eye on the composites in `audit/screenshots/compare/`): the footer regulatory paragraph (every page), the darker AA orange on buttons/links (every page), the static illustration where WordPress showed a Lottie frame (16 headers), the click-to-load placeholder panels (3 tool pages), the removed captcha row (5 form pages), YouTube facades where the old iframe rendered blank in the baseline, the Trustpilot frame's own rendering, and the 17 pages whose 390 px baseline is 580–770 px wide because they overflowed. One genuine template bug was caught and fixed by this pass: the post header rendered the date below the image instead of under the title.

Side-by-side composites for 17 representative pages at 1440 and 390: `audit/screenshots/compare/{1440,390}/<slug>.png`. Full diff heat-maps for every pair: `audit/screenshots/diff/`.

## 3. Accessibility — axe-core, WCAG 2.2 A/AA + best-practice tags, 30 template×viewport runs
**Zero WCAG A/AA violations.**
Best-practice notices: heading-order (best-practice) ×4.
Fixed in this phase: colour contrast on buttons, pagination, nav, "Read More" links, stat band (deviations #2, #23); redundant icon alt text (#24); cookie-banner link colour; heading order in cards and product tiles; descriptive link text via hidden context (#3). Left as-is: `heading-order` inside two pages' body copy (an `h3` directly under the `h1`, authored that way; advisory, not a WCAG failure).

## 4. Lighthouse (production build, real Chrome, LH 13.5) — `audit/lighthouse-after/`
| Template | Form | Perf | A11y | Best-pr. | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| home | mobile | 93 | **100** | **100** | **100** | 3.3 s | 0 | 30 ms |
| home | desktop | **100** | **100** | **100** | **100** | 0.7 s | 0 | 0 ms |
| product-loan | mobile | 94 | **100** | **100** | **100** | 3.1 s | 0 | 40 ms |
| product-loan | desktop | **100** | **100** | **100** | **100** | 0.7 s | 0 | 0 ms |
| product-savings | mobile | 94 | **100** | **100** | **100** | 3.1 s | 0 | 60 ms |
| product-savings | desktop | **100** | **100** | **100** | **100** | 0.7 s | 0 | 20 ms |
| hub | mobile | 94 | **100** | **100** | **100** | 3.1 s | 0 | 20 ms |
| hub | desktop | **100** | **100** | **100** | **100** | 0.7 s | 0 | 0 ms |
| about | mobile | 93 | **100** | **100** | **100** | 3.1 s | 0 | 150 ms |
| about | desktop | **100** | **100** | **100** | **100** | 0.7 s | 0 | 20 ms |
| contact | mobile | **95** | **100** | **100** | **100** | 2.9 s | 0 | 40 ms |
| contact | desktop | **100** | **100** | **100** | **100** | 0.6 s | 0 | 0 ms |
| faq | mobile | 94 | **100** | **100** | **100** | 3.1 s | 0 | 40 ms |
| faq | desktop | **100** | **100** | **100** | **100** | 0.7 s | 0 | 0 ms |
| legal | mobile | **95** | **99** | **100** | **100** | 2.9 s | 0 | 30 ms |
| legal | desktop | **100** | **99** | **100** | **100** | 0.6 s | 0 | 0 ms |
| embed | mobile | **96** | **100** | **100** | **100** | 2.9 s | 0 | 30 ms |
| embed | desktop | **100** | **100** | **100** | **100** | 0.6 s | 0 | 0 ms |
| post | mobile | 94 | **99** | **100** | **100** | 3.0 s | 0 | 40 ms |
| post | desktop | **100** | **99** | **100** | **100** | 0.6 s | 0 | 0 ms |
| blog-index | mobile | 93 | **100** | **100** | **100** | 3.2 s | 0 | 30 ms |
| blog-index | desktop | **100** | **100** | **100** | **100** | 0.7 s | 0 | 0 ms |
| category | mobile | 94 | **100** | **100** | 92 | 3.2 s | 0 | 30 ms |
| category | desktop | **100** | **100** | **100** | 92 | 0.7 s | 0 | 0 ms |
| tag | mobile | **95** | **100** | **100** | 92 | 2.9 s | 0 | 40 ms |
| tag | desktop | **100** | **100** | **100** | 92 | 0.6 s | 0 | 0 ms |
| campaign | mobile | **95** | **100** | **100** | **100** | 2.8 s | 0 | 100 ms |
| campaign | desktop | **99** | **100** | **100** | **100** | 0.9 s | 0 | 0 ms |
| landing | mobile | **96** | **100** | **100** | ⚠ 69 | 2.9 s | 0 | 30 ms |
| landing | desktop | **100** | **100** | **100** | ⚠ 69 | 0.6 s | 0 | 0 ms |

Desktop: perf 99–100, a11y ≥99, best-practices ≥100, SEO ≥92. Mobile: perf 93–95, a11y ≥99, best-practices ≥100, SEO ≥92 (excluding the landing example). The hub-mobile row is a clean re-run (the batch value was taken while the screenshot pass was hammering the CPU; see `_notes.txt`). Category/tag archives lose SEO points only for the meta description they never had on WordPress; the landing example is `noindex` by design. Landing SEO is low by design (`noindex` example). The embed page no longer loads any third party until clicked.

## 5. Sitemap, robots, RSS, JSON-LD — `audit/validation.csv`
- ✔ sitemap_index.xml 200 xml
- ✔ sitemap index lists post + page sitemaps — /post-sitemap.xml /page-sitemap.xml
- ✔ /post-sitemap.xml parses (63 urls)
- ✔ /page-sitemap.xml parses (41 urls)
- ✔ all sitemap URLs are https://www + trailing slash
- ✔ every sitemap URL returns 200 (104)
- ✔ no noindex page in the sitemap
- ✔ robots.txt 200
- ✔ robots.txt allows crawl in production build — User-Agent: * | Allow: / | Disallow: /api/ |  | Sitemap: https://www.gmbcreditunion.com/sitemap_index.xml | 
- ✔ robots.txt points at sitemap_index.xml
- ✔ /sitemap.xml → 301 sitemap_index.xml
- ✔ /wp-sitemap.xml → 301 sitemap_index.xml
- ✔ RSS 200 + rss+xml — application/rss+xml; charset=utf-8
- ✔ RSS has channel/title/link/items — 10 items
- ✔ RSS items have pubDate + guid
- ✔ JSON-LD parses on every page (104)
- ✔ Organization/FinancialService on every page — 104/104
- ✔ BreadcrumbList on every page — 104/104
- ✔ LoanOrCredit on 8 loan pages — 8
- ✔ FinancialProduct on 7 savings pages — 7
- ✔ Article on 63 posts (ours + Yoast = 126) — 126
- ✔ FAQPage on 2 pages — 2
- ✔ llms.txt 200 text
- ✔ OG image route renders PNG
- ✔ apple-touch-icon.png 200
- ✔ security headers present (HSTS, CSP, nosniff, XFO, Referrer-Policy)

All checks pass.

## 6. Local-only caveats
- MoneyHelper's iframe refuses to render from `localhost` (their allow-list); it will render on the live domain once clicked.
- CSP `upgrade-insecure-requests` is production-only; some third-party assets fail over plain http locally, not on https.
- Lighthouse mobile numbers are simulated on this laptop; Vercel's edge + HTTP/3 will not be slower.

## 7. Ready for Phase 5
Repo content is complete: app, content, scripts, CI budget (`lighthouserc.cjs`), docs (`CONTRIBUTING.md`, `docs/deviations.md`). Phase 5 adds git history, GitHub, Vercel, DNS/cutover checklist.

**STOP — awaiting your go-ahead for Phase 5 (ship).**
