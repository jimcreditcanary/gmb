# Phase 1 report — Discovery & baseline
**Site:** https://www.gmbcreditunion.com · **Generated:** 07/10/2026, 00:23 (London) · **Crawled from:** this Mac (residential IP), headful Google Chrome 154 via Playwright, ≤2 top-level requests/sec, robots.txt honoured.

## 0. Pre-flight
- Playwright 1.63.0 + Chromium installed; crawl used the installed Google Chrome (`channel: 'chrome'`, non-headless) so the UA is a real `Chrome/154` string. StackProtect did not block any request.
- `GET https://www.gmbcreditunion.com/` → **200** (curl and Playwright). Title: *GMB Credit Union | Your money, your future, Your Credit Union*. GTM-NQCV3C4 present.
- WordPress 7.1.x (dashicons `ver=7.1.3`), custom theme `gmbcu` v1.48, Yoast SEO, Max Mega Menu 3.10.6, Contact Form 7 6.1.7, Password Protect WordPress, Embed Lottie Player, speculation-rules prefetch enabled.

## 1. Sources used (in order)
| Source | Result |
|---|---|
| `/sitemap_index.xml` (Yoast) | 6 child sitemaps → **455 URLs**: post 65, page 54, file 278, category 1, post_tag 2, filter 55; 95 unique images |
| `/wp-json/wp/v2/*` | **Skipped** — `robots.txt` has `Disallow: /wp-json/` and `Disallow: /?rest_route=`. Honoured per the brief. (CF7 still calls the REST API from the browser; that is the site's own traffic, not ours.) |
| DOM crawl from `/` | BFS over every same-origin anchor/link/img/srcset/background-image/iframe; non-HTML URLs probed with redirects recorded hop-by-hop |
| Wayback CDX (`web.archive.org/cdx`, domain match, collapsed by urlkey) | 2,668 captures. After dropping assets and junk queries, **217 candidate URLs** not in the sitemaps were probed live: **46 × 200, 106 × 301, 65 × 404**. Live ones are in the inventory flagged `source: wayback` (`wayback_machine_downloader` gem not installed on this Mac; the CDX API it wraps was queried directly — same data). |

Crawl hygiene: the search page and some pagination markup emit `?s=…` / `?page=0` variants of every page; 319 such synthetic duplicates were crawled before the rule was added and have been **purged** from the inventory (list in `audit/raw/junk-skipped.json`). `/?page=0` (a Wayback-listed URL that still 200s) was kept.

## 2. Inventory totals — `audit/url-inventory.csv` (678 rows)
| Status | Count |
|---|---|
| 200 | 538 |
| 301 | 115 |
| 404 | 25 |

Of the 678 rows: **494 HTML pages return 200 directly** (147 outside `/file/` + `/filter/`), 51 are non-HTML documents/feeds/sitemaps, 115 redirect, 25 404.

Non-HTML rows: text/html 404: 2 · text/xml 200: 7 · text/html 301: 3 · image/x-icon 200: 1 · text/plain 200: 2 · application/pdf 200: 32 · application/json 200: 1 · application/rss+xml 200: 1 · text/xml 301: 2.

### Page count by template (200 pages)
| template_guess | Pages | What it is | Example |
|---|---|---|---|
| `file-single` | 278 | Custom post type `file` single — title + date only, no download link exposed | /file/13th-july-2022/ |
| `filter-archive` | 69 | Custom taxonomy `filter` archives for the `file` post type (+ pagination) | /filter/annual-audited-accounts/ |
| `blog-post` | 63 | Single post (`single-post`) | /10-ways-improve-your-credit-score/ |
| `page-builder` | 50 | Theme page-builder template (`template-layout` + `page-builder`): product, hub, about, contact, legal, campaign pages | /about-us/ |
| `page-downloads` | 10 | Directors-area downloads template — password-protected (Password Protect WP plugin) | /directors-area/ |
| `blog-index` | 9 | /our-blog/ (`blog`) + its pagination | /our-blog/ |
| `category-archive` | 8 | /category/uncategorised/ + pagination | /category/uncategorised/ |
| `home` | 3 | Static front page (page-builder layout, body class `home`) | / |
| `tag-archive` | 2 | /tag/* | /tag/budget/ |
| `search` | 1 | Search results (probe `/?s=test`) |  |
| `page-default` | 1 | Default page template | /test/ |

Notes: `page-builder` 50 = 42 real pages + 8 duplicates reached via newsletter-tracking links (see §9) and 2 case variants (`/About-Us/`, `/Contact-Us/` both 200 with lowercase canonicals). `home` 3 = `/`, `/page/2/` (200, noindex, canonical `/`) and `/?page=0`. The 278 `file-single` pages are empty shells (title + date, ~20 words, no download link); their PDFs sit behind the password-protected directors area.

### Blog posts
63 posts at **root-level slugs** (preserved as-is), all with `Article` + `Person` + `BreadcrumbList` JSON-LD from Yoast. Blog index `/our-blog/` paginates to `/our-blog/page/8/` (pages 2–8 are `noindex,follow`). RSS exists only at `/our-blog/feed/` (8 items); `/feed/` and `/comments/feed/` 301 to `/`.

## 3. Titles & descriptions
- **Missing title:** 0.
- **Missing meta description:** 372 pages, of which 348 are `/file/`, `/filter/` or synthetic variants. Real pages missing one (24):
  - /become-a-credit-union-advocate/
  - /category/uncategorised/
  - /category/uncategorised/page/2/
  - /category/uncategorised/page/3/
  - /category/uncategorised/page/4/
  - /category/uncategorised/page/5/
  - /category/uncategorised/page/6/
  - /category/uncategorised/page/7/
  - /category/uncategorised/page/8/
  - /directors-area/
  - /directors-area/annual-audited-accounts/
  - /directors-area/annual-report/
  - /directors-area/board-minutes/
  - /directors-area/budget/
  - /directors-area/business-plan/
  - /directors-area/business-policies/
  - /directors-area/employee-policies/
  - /directors-area/governance/
  - /directors-area/policies/
  - /join-us-congress-2023/
  - /loan-application-rejected-what-now/
  - /tag/budget/
  - /tag/summer/
  - /test/
- **Duplicate titles** (excluding file/filter):
  - "GMB Credit Union | Your money, your future, Your Credit Union" × 3: /, /?page=0, /page/2/
  - "About Us | GMB Credit Union" × 2: /about-us/, /About-Us/
  - "Contact Us | GMB Credit Union" × 2: /contact-us/, /Contact-Us/
  - "Governance | GMBCU" × 2: /directors-area/governance/, /file/governance/
  - "Budget Archives | GMBCU" × 2: /filter/budget/, /tag/budget/
  - "How To Check Your Credit Score For Free | GMBCU" × 2: /how-check-your-credit-score-free/, /your-phone-may-be-giving-fraudsters-a-way-into-your-finances/
  - "Our Blog | GMB Credit Union" × 8: /our-blog/, /our-blog/page/2/, /our-blog/page/3/, /our-blog/page/4/, /our-blog/page/5/, /our-blog/page/6/, /our-blog/page/7/, /our-blog/page/8/
  - "Budget Planner | GMB Credit Union" × 2: /resources/member-helper/benefit-calculator/, /resources/member-helper/budget-planner/
- **Duplicate descriptions:**
  - "GMB Credit Union is made and managed by people like you, with ethical …" × 3: /, /?page=0, /page/2/
  - "Read our summary of the annual general meeting, looking over 2024. We …" × 2: /2025-agm-summary/, /2026-agm-summary/
  - "Saving money for big moments in life is key to handling your money wel…" × 4: /7-ways-to-save-money-over-the-summer-holidays/, /avoid-loan-sharks-and-stay-smart-with-your-money/, /saving-money-for-life-events/, /what-a-change-of-government-means-for-your-wallet/
  - "GMB Credit Union belongs to you. Our not-for-profit organisation is ma…" × 2: /about-us/, /About-Us/
  - "Our Annual General Meeting to run a member-led discussion about the pa…" × 3: /annual-general-meeting-2024/, /annual-general-meeting-2025/, /annual-general-meeting-2026/
  - "Your Credit Union is always here to help when you need us. If you've g…" × 2: /contact-us/, /Contact-Us/
  - "It is very important for your overall financial wellbeing to be aware …" × 2: /how-check-your-credit-score-free/, /your-phone-may-be-giving-fraudsters-a-way-into-your-finances/
  - "We are excited to be back at Congress this year! We are looking forwar…" × 2: /join-gmbcu-get-25-and-a-chance-to-win-big/, /join-us-congress-2024/
  - "Stay updated with the latest Credit Union news, useful info, and tips …" × 8: /our-blog/, /our-blog/page/2/, /our-blog/page/3/, /our-blog/page/4/, /our-blog/page/5/, /our-blog/page/6/, /our-blog/page/7/, /our-blog/page/8/
  - "Budget planners are proven to promote financial stability. What are yo…" × 2: /resources/member-helper/benefit-calculator/, /resources/member-helper/budget-planner/
- Titles > 60 chars: 4 (/ (61); /?page=0 (61); /page/2/ (61); /retail-therapy-or-financial-trap-the-real-reason-we-overspend/ (73)). Descriptions > 160 chars: 11. None under 70.
- **H1:** 0 pages with multiple H1; 1 page with none: /savings/life-savings-insurance-protection/ (uses an H2 as the visible heading; also has an empty H2).
- **Canonical:** every 200 page has one; the only mismatches are the intended ones (`/page/2/` and `/?page=0` → `/`; `/About-Us/` → `/about-us/`). All canonicals are `https://www`.
- **robots meta:** 30 pages are `noindex,follow` — all pagination (`/page/N/`) plus the search page. No `X-Robots-Tag` headers anywhere. The 404 template is `noindex`.
- **OG/Twitter:** all pages carry Yoast OG + `twitter:card=summary_large_image`. `og:image` is **absent on 428 pages** — every page that is not a blog post (71 real pages incl. all loan/savings product pages, hub pages, about, contact, legal). Posts have an `og:image` (featured image). → candidate for the generated fallback in Phase 3.
- **JSON-LD:** 0 invalid blocks. Types seen: WebPage (506), ImageObject (130), BreadcrumbList (576), WebSite (627), CollectionPage (100), SearchResultsPage (1), Article (105), Person (105). No `Organization`, `FinancialService`, `LoanOrCredit`, `FinancialProduct` or `FAQPage` anywhere today — the Yoast `WebSite` node is the only org-level entity.

## 4. URLs that 404 (25)
| URL | Found via | Note |
|---|---|---|
| /2021-agm-summary | crawl | target of a legacy /index.php/ 301 (Drupal-era path) — redirect chain ends in 404 |
| /404-does-not-exist-abc/ | probe | probe |
| /ads.txt | probe | probe |
| /apple-touch-icon.png | probe | referenced in <head> on every page |
| /author/ | probe | probe |
| /blog/ | probe | probe |
| /filter/tips | crawl | target of a legacy /index.php/ 301 (Drupal-era path) — redirect chain ends in 404 |
| /junior-saver-account-application | crawl | linked from /help-your-children-form-good-money-habits/ (broken internal link) |
| /member-saving-account-application | crawl | target of a legacy /index.php/ 301 (Drupal-era path) — redirect chain ends in 404 |
| /news/ | probe | probe |
| /nivo | crawl | target of a legacy /index.php/ 301 (Drupal-era path) — redirect chain ends in 404 |
| /node | crawl | target of a legacy /index.php/ 301 (Drupal-era path) — redirect chain ends in 404 |
| /node/21 | crawl | target of a legacy /index.php/ 301 (Drupal-era path) — redirect chain ends in 404 |
| /node/22 | crawl | target of a legacy /index.php/ 301 (Drupal-era path) — redirect chain ends in 404 |
| /node/23 | crawl | target of a legacy /index.php/ 301 (Drupal-era path) — redirect chain ends in 404 |
| /node/24 | crawl | target of a legacy /index.php/ 301 (Drupal-era path) — redirect chain ends in 404 |
| /node/28 | crawl | target of a legacy /index.php/ 301 (Drupal-era path) — redirect chain ends in 404 |
| /node/29 | crawl | target of a legacy /index.php/ 301 (Drupal-era path) — redirect chain ends in 404 |
| /node/38 | crawl | target of a legacy /index.php/ 301 (Drupal-era path) — redirect chain ends in 404 |
| /savings/young-saver/apply/ | crawl | target of /savings/junior-saver/apply/ 301 — an apply page that no longer exists |
| /search/ | probe | probe |
| /useful-links | crawl | target of a legacy /index.php/ 301 (Drupal-era path) — redirect chain ends in 404 |
| /user/login/ | crawl | target of a legacy /index.php/ 301 (Drupal-era path) — redirect chain ends in 404 |
| /user/logout/ | crawl | target of a legacy /index.php/ 301 (Drupal-era path) — redirect chain ends in 404 |
| /user/password/ | crawl | target of a legacy /index.php/ 301 (Drupal-era path) — redirect chain ends in 404 |

## 5. Redirects (115 live 301s) — all recorded in `url-inventory.csv` (`redirect_target`) and raw chains in `audit/raw/inventory.json`
| Category | Count |
|---|---|
| missing trailing slash → slash | 39 |
| legacy /index.php/ (Drupal-era) → clean path | 31 |
| ?page=N / query → canonical | 19 |
| renamed slug | 19 |
| to home | 4 |
| moved into section | 3 |

Notable (non-trivial) redirects that must be carried into Phase 2's `redirects.csv`:
| From | → To | Final |
|---|---|---|
| /budget-planner | /resources/member-helper/budget-planner/ | 200 |
| /category/uncategorised/feed/ | /category/uncategorised/ | 200 |
| /comments/feed/ | / | 200 |
| /cost-living | /cost-of-living/ | 200 |
| /creditview | / | 200 |
| /debt-advice-locator | /resources/member-helper/debt-advice-locator/ | 200 |
| /feed/ | / | 200 |
| /feel-positive-about-saving-and-confident-about-borrowing/ | /feel-positive-about-saving-and-borrowing/ | 200 |
| /file/board-mins-14th-june-2023/ | /file/board-minutes-14th-june-2023/ | 200 |
| /file/board-mins-22nd-march-2023/ | /file/board-minutes-22nd-march-2023/ | 200 |
| /file/board-mins-27th-september-2023/ | /file/board-minutes-27th-september-2023/ | 200 |
| /gmbcu-members-prize-draw | /gmb-credit-union-prize-draw/ | 200 |
| /gmbcu-members-prize-draw/ | /gmb-credit-union-prize-draw/ | 200 |
| /home | / | 200 |
| /how-and-why-help-your-children-form-good-money-habits | /help-your-children-form-good-money-habits/ | 200 |
| /index.php/ | / | 200 |
| /index.php/2021-agm-summary | /2021-agm-summary | 404 |
| /index.php/about-us | /about-us/ | 200 |
| /index.php/contact-us | /contact-us/ | 200 |
| /index.php/creditview | /creditview | 301 |
| /index.php/faqs | /faqs/ | 200 |
| /index.php/filter/tips | /filter/tips | 404 |
| /index.php/gmbcu-members-prize-draw | /gmbcu-members-prize-draw/ | 301 |
| /index.php/how-financial-problems-affect-your-mental-health | /how-financial-problems-affect-your-mental-health/ | 200 |
| /index.php/loan-application | /loan-application-rejected-what-now/ | 200 |
| /index.php/loan-application-rejected-what-now | /loan-application-rejected-what-now/ | 200 |
| /index.php/loans | /loans/ | 200 |
| /index.php/member-saving-account-application | /member-saving-account-application | 404 |
| /index.php/nivo | /nivo | 404 |
| /index.php/node | /node | 404 |
| /index.php/node/21 | /node/21 | 404 |
| /index.php/node/22 | /node/22 | 404 |
| /index.php/node/23 | /node/23 | 404 |
| /index.php/node/24 | /node/24 | 404 |
| /index.php/node/28 | /node/28 | 404 |
| /index.php/node/29 | /node/29 | 404 |
| /index.php/node/38 | /node/38 | 404 |
| /index.php/our-blog | /our-blog/ | 200 |
| /index.php/privacy-policy | /privacy-policy/ | 200 |
| /index.php/savings-accounts | /savings-accounts | 301 |
| /index.php/useful-links | /useful-links | 404 |
| /index.php/user/login/ | /user/login/ | 404 |
| /index.php/user/logout/ | /user/logout/ | 404 |
| /index.php/user/password/ | /user/password/ | 404 |
| /index.php/virtuous-circle | /virtuous-circle/ | 200 |
| /loan-application | /loan-application-rejected-what-now/ | 200 |
| /money-navigator | /resources/member-helper/ | 200 |
| /money-talk-kids-why-you-need-start-your-childrens-financial-education-now/ | /childrens-financial-education/ | 200 |
| /resources/member-helper/budget-planner/, | /resources/member-helper/budget-planner/ | 200 |
| /savings-accounts | /savings/ | 200 |
| /savings/junior-saver/ | /savings/young-saver/ | 200 |
| /savings/junior-saver/apply/ | /savings/young-saver/apply/ | 404 |
| /simple-money-management-tips-feel-better-about-your-finances/ | /simple-money-management-tips/ | 200 |
| /sitemap.xml | /sitemap_index.xml | 200 |
| /wp-sitemap.xml | /sitemap_index.xml | 200 |

Multi-hop chains: /index.php/creditview, /index.php/gmbcu-members-prize-draw, /index.php/savings-accounts (2 hops each, via `/index.php/`). No http→https or apex→www hop was observed because the crawler normalises to `https://www`; both variants were spot-checked with curl and 301 correctly.

## 6. Wayback cross-check
- 46 Wayback URLs still 200 but absent from sitemaps: pagination pages (`/our-blog/page/N/`, `/category/uncategorised/page/N/`, `/filter/*/page/N/`), the child sitemaps themselves, `/?page=0`, and **14 PDFs** (AGM 2024 papers, annual reports 2023–2025, Loan T&Cs, PrizeSaver T&Cs) — all downloaded.
- 106 Wayback URLs now 301 (included above). 65 are dead (mostly `/index.php/node/N`, `/user/*`, `/sites/default/files/*` Drupal artefacts and old `?page=N` listings) — listed in `audit/raw/wayback-probe.json`.

## 7. Captures
- **HTML:** every 200 page's *raw server response* saved to `source/html/<path>/index.html` (520 files). Sitemaps/feeds/robots saved alongside as `index.xml` / `index.txt`.
- **Media:** `source/media/<site path>` — 772 files, 284 MB. By type: jpg 337, png 265, svg 37, pdf 32, jpeg 24, js 21, css 13, json 11, webp 10, lottie 6, woff2 5, ttf 4, (none) 3, woff 2, ico 1, eot 1. Includes theme fonts (MencaBold/MencaMedium woff2+woff, Font Awesome 6, dashicons), favicon, 32 PDFs, 37 SVG icons, Lottie JSON animations, theme CSS/JS. Every WordPress-sized filename (`-600x400`, `-scaled`, `-e1691…`) was also requested with suffixes stripped; the full-size originals were already in `srcset` for all but 6, which were recovered. Largest-in-group flagged in `audit/media-inventory.csv` (296 groups). Missing: `/apple-touch-icon.png` (404) and 3 stale CF7 captcha PNGs.
- **Oversized originals to be aware of:** Untitled-design_0.png 5184×3456 18.7 MB; jessica-rockowitz-5NLCaz2wJXE-unsplash_0.jpg 6977×5372 10.6 MB; hillshire-farm-YGcleYb9wEQ-unsplash.jpg 8058×5372 7.8 MB; AdobeStock_302028165.jpeg 5472×3648 4.5 MB — next/image will handle these.

## 8. Design tokens — `audit/design-tokens.json`
Extracted from `site.min.css` (theme, Milligram-based), Max Mega Menu CSS, CF7 CSS and the inline style blocks; vendor CSS (Font Awesome, normalize, animate, featherlight, slick, WP block presets) counted separately.

**Palette (theme usages):**
| Colour | Uses | Where |
|---|---|---|
| `#e36129` | 31 | background, border-color, background-color — html ::selection; html ::-moz-selection |
| `#102c45` | 15 | background-color, color, border-color — .pum-theme-2524 .pum-title,.pum-theme-christmas .pum-title; .pum-theme-2524 .pum-content,. |
| `#ffffff` | 14 | border, color — .pum-theme-2524 .pum-content+.pum-close,.pum-theme-christmas .pum-content+.pum-close; .pum |
| `rgba(2,2,2,0.23)` | 14 | box-shadow, text-shadow — .pum-theme-2513 .pum-container,.pum-theme-default-theme .pum-container; .pum-theme-2513 .p |
| `#000000` | 13 | border, color — .pum-theme-2524 .pum-container,.pum-theme-christmas .pum-container; .pum-theme-2513 .pum-c |
| `#9b4dca` | 11 | background-color, border, border-color — .button,button,input[type=button],input[type=reset],input[type=submit]; .button[disabled]: |
| `#0000334d` | 8 | box-shadow — .pum-sub-form .spinner-loader:not(:required) |
| `#e0e0e0` | 8 | border, border-bottom, background-color — input[type=color],input[type=date],input[type=datetime],input[type=datetime-local],input[t |
| `#decef9` | 8 | background-color — section.block-icon-section div.wrap-block-icon-section; section.colour-panels div.wrap-pan |
| `#f6c757` | 8 | background-color, border-color — section.colour-panels div.wrap-panels ul.list-panels li div.panel div.data-content.yellow; |
| `rgba(2,2,2,0.00)` | 7 | box-shadow, text-shadow — .pum-theme-2524 .pum-container,.pum-theme-christmas .pum-container; .pum-theme-2524 .pum-t |
| `#606c76` | 7 | color, background-color, border-color — body; .button:focus,.button:hover,button:focus,button:hover,input[type=button]:focus,input |
| `#cff4fb` | 6 | background-color — section.colour-panels div.wrap-panels ul.list-panels li div.panel div.data-content.ltblue; |
| `rgba(255,255,255,1.00)` | 5 | background-color — .pum-theme-2513,.pum-theme-default-theme; .pum-theme-2514 .pum-container,.pum-theme-lightb |

**Type:** `MencaBold` (headings/buttons) and `MencaMedium`, self-hosted woff2/woff in the theme; body falls back to `sans-serif`. Root `font-size: 62.5%` (Milligram) so rem values ×10 = px. Sizes used: 32px, 20px, 18px, 1.8rem, 14px, 16px, 2rem, 24px, 34px, 12px, 1.6rem, 22px, 40px, 10px, 26px, 15px, 1.1rem, 4.6rem. Weights: 100, 300, 400, 500, 700, bold, normal. Line-heights: 1, 3, 36px, 1.3, 1.5, 1.2, 24px, 20px.
**Spacing (rem-based):** 0(195) 2rem(83) 1rem(48) 4rem(35) 6rem(20) .5rem(15) 3rem(15) 15px(13) 0px(12) 8rem(10) 1.5rem(9) 5px(8).
**Radii:** 0(3) 20px(25) 0px(8) 10px(4) 15px(3) .4rem(3) 50%(2) 5px(2) — 20px is the house radius. **Shadows:** none in theme. **Transitions:** .3s.
**Breakpoints:** (max-width:630px)(20), (min-width:640px)(20), (min-width:992px)(17), (min-width:1200px)(13), (min-width:631px)(11), (min-width:782px)(4), (max-width:1024px)(3), (min-width:40rem)(3); mega-menu collapses at 630px.
**Logos:** `wp-content/themes/gmbcu/assets/images/logo.png` (header), `footer-logo.png`, `favicon.ico`; 21 × 48px line-icon SVGs in `/media/Icon-*.svg`; Lottie header animations `CU-*-Header-RGB*.json/.lottie`.
Google Fonts (Roboto, Nunito) were observed on the network but only from third-party iframes (Trustpilot, Inbest), not from the theme.

## 9. Third-party scripts, embeds, forms, tracking — `audit/third-party-inventory.md`
- **In the HTML on every page:** GTM `GTM-NQCV3C4` (head snippet + noscript iframe), Trustpilot bootstrap script + TrustBox iframe (template 5406e65d… on 132 pages, 54ad5def… on 3), jQuery 3.6 from `ajax.googleapis.com` **in addition to** WP's bundled jQuery 3.7.1 (two jQuery copies), Lottie player, CF7 runtime, Mailchimp embedded form (footer, every page).
- **Injected at runtime by GTM:** CookieYes banner+script (`client_data/0b3e95fe…`), gtag.js for **GA4 `G-XJX1EQ0QPW`**, Google Ads/`pagead2.googlesyndication.com/ccm/collect` pings, Cloudflare Insights beacon. During the crawl (no consent interaction) `region1.google-analytics.com/g/collect` fired on effectively every page load — whether those were consent-mode "denied" pings or full hits needs checking in the GTM container before we replicate behaviour.
- **Iframes:** YouTube embeds (4 videos, 22 pages), MoneyHelper budget planner + debt-advice locator (`partner-tools.moneyadviceservice.org.uk`), Inbest benefits calculator (`benefits.inbest.ai/iframe/gmbcreditunion`), MoneyAdviceService `tools.js`.
- **Forms:** (1) Mailchimp `POST gmbcreditunion.us5.list-manage.com/subscribe/post?u=d9343033dc8a6cee1d438cafd&id=a34de2255e&f_id=001bede0f0` — fields `EMAIL` (required) + honeypot `b_d9343033dc8a6cee1d438cafd_a34de2255e` + submit; on every page. (2) Contact Form 7 on 5 pages (contact-us, AGM interest 2024/25/26, advocate) — fields listed in the inventory file. (3) Password Protect WP form on the 10 directors-area pages. Nothing was submitted.
- **External links:** Member Hub `gmb.cumemberapp.com/login` (nav + footer, never visited), App Store / Google Play, Trustpilot profile, FSCS, Facebook/Instagram/YouTube.
- **Odd:** four credit-score blog posts contain internal links carrying Conesso newsletter tracking params (`?conesso_link_tag=…&utm_campaign=Jan+26+Newsletter…`), two of them via `/index.php/` legacy paths — copy pasted from an email. Verbatim rule says keep them; flagging for your call.

## 10. Regulatory wording → `audit/locked-pages.md`
73 real pages matched FSCS / APR / FCA-PRA / complaints-FOS / privacy-GDPR / T&Cs / credit-warning / interest-rate patterns (plus 6 `/file/` shells whose *titles* mention policies). The **site-wide footer** carries no regulatory *text* (it is two nav menus, the Mailchimp form and the FSCS badge `fscs.svg` linking to fscs.org.uk) — the badge makes it a locked shared component, but there is **no "authorised and regulated by the FCA/PRA", no Firm Reference Number and no copyright line anywhere in the footer or header**. The sentence *"GMB Credit Union is authorised and regulated by the Financial Conduct Authority (FCA) and the Prudential Regulation Authority (PRA)"* appears only inside the body copy of `/member-hub-faqs/` and `/the-gmbcu-member-hub-is-coming-in-june-2026/`; **no Firm Reference Number appears anywhere on the site**. Flagged in §14. Recommended `locked: true` set for Phase 2: all 9 `/loans/*`, all 8 `/savings/*`, `/complaints/`, `/privacy-policy/`, `/faqs/`, `/member-hub-faqs/`, `/gmb-credit-union-prize-draw/`, `/about-us/`, `/contact-us/`, the footer, plus every blog post that states an APR or rate (list in the file).

## 11. Screenshots — `audit/screenshots/before/{1440,768,390}/`
1476/1482 page-loads captured (492 + 492 + 492 files — `/About-Us/` and `/Contact-Us/` share a file with their lowercase twins on this case-insensitive disk) (full-page PNG, fresh load per viewport, lazy-load scrolled, animations paused, Member Hub blocked, CookieYes banner hidden via injected CSS so Phase 4 diffs compare page content rather than the consent overlay). No failures; the 6 missing loads are the 2 case-variant URLs × 3 widths that map to the same filenames.

## 12. Lighthouse baseline — `audit/lighthouse-before/` (HTML + JSON per run)
Real Chrome, non-headless, live site, Lighthouse 13.5. Mobile = default throttled preset; desktop = `--preset=desktop`.
| Template / page | Form | Perf | A11y | Best-pr. | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| home | mobile | 61 | 92 | 100 | 92 | 12.6 s | 0 | 280 ms |
| home | desktop | 64 | 92 | 100 | 92 | 3.1 s | 0.007 | 350 ms |
| page-builder-loan-product | mobile | 52 | 94 | 96 | 100 | 8.6 s | 0.219 | 400 ms |
| page-builder-loan-product | desktop | 93 | 94 | 96 | 100 | 1.3 s | 0.001 | 70 ms |
| page-builder-savings-product | mobile | 37 | 94 | 96 | 100 | 10.3 s | 0.195 | 960 ms |
| page-builder-savings-product | desktop | 97 | 94 | 96 | 100 | 1.1 s | 0.001 | 40 ms |
| page-builder-hub | mobile | 24 | 88 | 100 | 100 | 9.7 s | 0.277 | 1,460 ms |
| page-builder-hub | desktop | 68 | 88 | 100 | 100 | 1.7 s | 0.005 | 590 ms |
| page-builder-about | mobile | 74 | 92 | 96 | 100 | 4.0 s | 0.005 | 380 ms |
| page-builder-about | desktop | 97 | 92 | 96 | 100 | 1.2 s | 0.003 | 0 ms |
| page-builder-contact | mobile | 70 | 89 | 100 | 100 | 5.4 s | 0.018 | 240 ms |
| page-builder-contact | desktop | 98 | 89 | 100 | 100 | 1.1 s | 0.008 | 0 ms |
| page-builder-faqs | mobile | 65 | 93 | 100 | 92 | 9.2 s | 0.015 | 210 ms |
| page-builder-faqs | desktop | 92 | 93 | 100 | 92 | 1.8 s | 0.033 | 0 ms |
| page-builder-legal | mobile | 60 | 92 | 100 | 100 | 6.4 s | 0.015 | 440 ms |
| page-builder-legal | desktop | 98 | 92 | 100 | 100 | 1.0 s | 0.001 | 0 ms |
| page-builder-resources-embed | mobile | 31 | 93 | 77 | 100 | 12.4 s | 1.114 | 410 ms |
| page-builder-resources-embed | desktop | 61 | 93 | 77 | 100 | 2.4 s | 1.07 | 0 ms |
| blog-post | mobile | 84 | 92 | 100 | 100 | 3.8 s | 0.005 | 200 ms |
| blog-post | desktop | 98 | 92 | 100 | 100 | 1.0 s | 0.008 | 0 ms |
| blog-index | mobile | 63 | 92 | 100 | 100 | 9.9 s | 0 | 280 ms |
| blog-index | desktop | 91 | 92 | 100 | 100 | 1.9 s | 0.001 | 0 ms |
| category-archive | mobile | 60 | 92 | 100 | 92 | 9.8 s | 0 | 360 ms |
| category-archive | desktop | 87 | 92 | 100 | 92 | 2.1 s | 0.001 | 0 ms |
| tag-archive | mobile | 63 | 92 | 100 | 92 | 10.0 s | 0 | 280 ms |
| tag-archive | desktop | 92 | 92 | 100 | 92 | 1.8 s | 0.001 | 0 ms |
| filter-archive | mobile | 66 | 92 | 100 | 92 | 8.5 s | 0 | 190 ms |
| filter-archive | desktop | 94 | 92 | 100 | 92 | 1.6 s | 0.001 | 0 ms |
| file-single | mobile | 60 | 93 | 100 | 92 | 8.3 s | 0 | 400 ms |
| file-single | desktop | 96 | 93 | 100 | 92 | 1.3 s | 0.001 | 10 ms |
| page-default | mobile | 49 | 90 | 96 | 92 | 9.4 s | 0.315 | 350 ms |
| page-default | desktop | 75 | 90 | 96 | 92 | 1.9 s | 0.343 | 0 ms |
| search | mobile | 65 | 92 | 100 | 58 | 6.3 s | 0.043 | 270 ms |
| search | desktop | 94 | 92 | 100 | 58 | 1.5 s | 0.001 | 0 ms |
Mobile Performance range 24–84; the ≥95 target in Phase 3 is a large step up, driven mainly by LCP (hero PNGs served at original size, render-blocking CSS, two jQuery copies, Trustpilot/GTM/CookieYes on the critical path).

## 13. What I could not retrieve
- `/wp-json/` REST data (robots-disallowed) — no post IDs, authors, categories beyond what Yoast exposes in HTML/sitemaps. Author archive `/author/` 404s anyway.
- Content behind the **directors-area password** (10 pages, 278 file posts' PDFs, 55 filter archives list only titles). Not attempted.
- Anything requiring the Member Hub, CF7 submission, or Mailchimp submission.
- `/apple-touch-icon.png` (404 on the live site).
- Original theme SCSS / PHP (only compiled CSS + rendered HTML are public). Template logic will be reconstructed from the rendered DOM.

## 14. Observations & risks for your decision
1. **278 empty `/file/` pages + 69 `/filter/` archives + 10 password pages are indexable and in the sitemap.** They are thin/duplicate content (e.g. `Governance | GMBCU` twice, `Budget Archives` twice) and expose board-minute titles publicly. Lift rule says preserve; I recommend we preserve the URLs but you decide whether they stay `index` or move to `noindex` + out of the sitemap.
2. `/test/` (1 word, indexable, in sitemap) and `/page/2/` (home duplicate) exist.
3. `og:image` missing on all non-post pages; no `Organization`/product schema at all.
4. Two jQuery versions, 18 MB hero PNG, Trustpilot + CookieYes + GTM all synchronous — explains the ~60 mobile Performance scores.
5. Analytics appeared to fire before any consent interaction; needs confirming in GTM/CookieYes config before we build Consent Mode v2.
6. Broken internal link: `/junior-saver-account-application` (404) from a 2019 post; `/savings/junior-saver/apply/` → 404 (apply flow removed).
7. Case-insensitive duplicates `/About-Us/` and `/Contact-Us/` return 200 (Apache). Vercel is case-sensitive; Phase 2 will propose 301s for those.
8. `/feed/` → `/` (301) while `/our-blog/feed/` is a live RSS feed; Phase 2 will propose keeping both behaviours.
9. **Horizontal overflow on phones:** 17 pages render wider than the 390px viewport (full-page shots came out 422–770px wide): how-did-our-members-get-involved-us, loans/family-loan, loans/member-loan, loans/save-borrow-loan, loans/savings-secured-loan, loans/starter-loan, loans/top-up-loan, our-enhanced-member-loans-explained … (full list `audit/raw/mobile-overflow.txt`). Mostly product pages with the rep-example/illustration blocks and the embed pages. A lift reproduces the layout, but we should decide whether matching an overflow bug counts as "visible change".
10. **No regulatory status statement site-wide.** The only "authorised and regulated" sentence is in two Member Hub pages' body copy, there is no FRN on the site, and the footer has the FSCS badge only. A pure lift reproduces that. If the client wants a footer disclosure it is a copy change for *them* to supply — I will not write it.

## 15. Open questions
1. Directors area: keep as password-gated pages in the new build (same password UX via a route handler), or drop from the public site/sitemap? Do you have the password / the PDFs from the client?
2. Should `/file/*` and `/filter/*` be preserved as indexable pages (pure lift) or preserved as URLs but `noindex`?
3. The newsletter-tracking (Conesso/UTM) internal links inside four posts — keep verbatim or clean to canonical paths?
4. `/test/` — keep?
5. Do you have access to the GTM container (NQCV3C4) and CookieYes account, so Phase 3 can replicate tags under Consent Mode v2 rather than guess?
6. Mailchimp: do you have an API key / audience ID (`a34de2255e` is the list id in the form) for the route-handler proxy, or should the new form keep posting directly to list-manage.com?
7. Trustpilot business unit ID 5406e65d… / 54ad5def…: fine to keep the official widget (lazy-loaded) or do you want a static SSR rendering of the score?

## 16. Artefacts
| Path | What |
|---|---|
| `audit/url-inventory.csv` | 678 rows, all requested columns |
| `audit/media-inventory.csv` + `audit/raw/media-manifest.json` | every media URL, status, size, dimensions, largest-in-group |
| `audit/design-tokens.json` | colours (with usage), fonts, font-faces, sizes, spacing, radii, shadows, breakpoints, logos |
| `audit/third-party-inventory.md` | scripts, network hosts, iframes, embeds, forms with fields, tracking IDs |
| `audit/locked-pages.md` | regulatory-wording matches per page + footer text |
| `audit/screenshots/before/` | 1440/768/390 full-page PNGs |
| `audit/lighthouse-before/` | mobile + desktop reports per template, `_summary.txt` |
| `audit/raw/` | sitemaps, Wayback CDX + probe, full crawl JSON (every anchor, image, form, heading per page), third-party network log, logs |
| `source/html/` · `source/media/` | verbatim captures |
| `tools/` | `crawl.mjs`, `wayback-check.mjs`, `media.mjs`, `tokens.mjs`, `build-inventory.mjs`, `shots.mjs`, `lighthouse.sh`, `report.mjs` — all re-runnable |

**STOP — awaiting your go-ahead for Phase 2.**
