# Phase 3 report — Build
**Generated:** 07/10/2026, 09:58 (London) · Repo root: `~/gmb` (Next.js 16.3 App Router, TypeScript, Tailwind v4, MDX) · Builds clean: `pnpm build` → 138 static routes, 0 type/lint errors.

## 1. What was built
| Area | Where | Notes |
|---|---|---|
| Content | `content/` (about 1, blog-post 63, contact 1, home 1, hub 4, landing 1, legal-regulatory 2, other 14, product-loan 8, product-savings 7, utility 6) + `content/_site/` (nav, footer, Trustpilot ids, regulatory statement, archive titles) | Imported by `tools/html2mdx.mjs` from the archived HTML. Word-for-word identical to the live pages (checked by `scripts/locked-diff.ts` on all 67 locked pages; same method passes on the samples of unlocked pages). |
| Templates | `components/templates/` | `MdxPage` (home, hub, product, about, contact, legal, faq, embed, campaign, generic: every section comes from MDX), `PostPage`, `ArchivePage` (blog index, category, tag, paginated), `LandingPage` (new, paid media), `not-found`. |
| Blocks | `components/blocks/` | 20 components, one per WordPress theme section, emitting the **same DOM and class names** the theme CSS targets. |
| Chrome | `components/site/` | Header (Max-Mega-Menu DOM, CSS fly-outs, client island only for the 630px hamburger + keyboard), Footer (menus, Mailchimp form, FSCS badge, **approved regulatory statement**), first-party cookie banner (Consent Mode v2). |
| Styling | `app/styles/theme.css` (78 KB, ported from `site.min.css`, vendor CSS stripped), `app/styles/megamenu.css`, `app/globals.css` (Tailwind v4 + brand tokens + shadcn token mapping) | Fonts self-hosted via `next/font/local` (Menca Bold/Medium, swap, preloaded). Font Awesome replaced by its SVG package (5 glyphs, tree-shaken). |
| Routing | `app/[[...slug]]` + archive routes + `proxy.ts` + `next.config.ts` | Trailing slashes preserved; 59 redirect rules generated from `audit/redirects.csv` (`scripts/gen-redirects.mjs`); legacy sources resolve in **one hop with the original 301/302 codes**; uppercase paths → lowercase; `/file/*` and `/filter/*` → 410; `/directors-area/*` → 302 `/`; WordPress image size-variant URLs rewrite to the original file. |
| SEO | `lib/seo.ts`, `lib/jsonld.ts`, `app/sitemap_index.xml` + `post-sitemap.xml` + `page-sitemap.xml`, `app/robots.ts`, `app/our-blog/feed`, `app/llms.txt`, `app/og` | Titles, descriptions, canonicals (always www), robots, OG/Twitter verbatim from frontmatter. Yoast's original JSON-LD graph emitted **unchanged** plus a second graph: Organization+FinancialService (FRN 213550, 564C, address), WebSite, WebPage, BreadcrumbList everywhere, LoanOrCredit ×8, FinancialProduct ×7, Article ×63, FAQPage ×2. `next/og` fallback card for the 71 pages without an image. Non-production: `noindex` meta + `X-Robots-Tag` + robots disallow. |
| Forms | `app/api/newsletter`, `app/api/contact` | Same field names. Newsletter → Mailchimp public endpoint now, Marketing API when a key is set. Contact/AGM/advocate forms → Resend when configured, otherwise logged; honeypot + time-trap (+ Turnstile optional). CF7's image captcha is not reproduced. |
| Third parties | Trustpilot (SSR link markup, widget after idle), YouTube facade (click-to-load, nocookie), MoneyHelper tools and Inbest calculator (load when scrolled into view, heights reserved), Lottie (self-hosted wasm, loads in view, respects reduced motion) | GTM container loads **only** when `NEXT_PUBLIC_GTM_ID` is set and consent is granted. No CookieYes. No jQuery. |
| Agent-editability | `CONTRIBUTING.md`, `pnpm new:post`, `lib/frontmatter.ts` (zod), `scripts/validate-content.ts`, `scripts/locked-diff.ts`, `.env.example` | Bad frontmatter or a missing image fails the build with the file and field named. Locked text diff runs on every build. |
| CI budget | `lighthouserc.cjs` (`pnpm lhci`, `pnpm lhci:desktop`) | ≥95 on all four categories for 12 representative URLs; wired to Vercel/GitHub in Phase 5. |
| Security | `next.config.ts` headers | HSTS (preload), CSP (allow-list of the third parties above), nosniff, frame-ancestors self, Referrer-Policy, Permissions-Policy. |

## 2. Lighthouse on the production build (local `next start`, real Chrome, LH 13.5)
Budget: ≥95 everywhere (decision 3). Bold = meets budget. "Before" = the live WordPress page in Phase 1.
| Template | Form | Perf | A11y | Best-pr. | SEO | LCP | CLS | TBT | Before perf |
|---|---|---|---|---|---|---|---|---|---|
| home | mobile | 93 | **97** | **100** | 92 | 3.2 s | 0 | 20 ms | 61 |
| home | desktop | **100** | **97** | **100** | 92 | 0.7 s | 0 | 0 ms | 64 |
| product-loan | mobile | 94 | **97** | **100** | **100** | 3.1 s | 0 | 20 ms | 52 |
| product-loan | desktop | **100** | **97** | **100** | **100** | 0.6 s | 0 | 0 ms | 93 |
| product-savings | mobile | **95** | **97** | **100** | **100** | 2.9 s | 0 | 20 ms | 37 |
| product-savings | desktop | **100** | **97** | **100** | **100** | 0.7 s | 0 | 20 ms | 97 |
| hub | mobile | 94 | **97** | **100** | **100** | 3.2 s | 0 | 30 ms | 24 |
| hub | desktop | **100** | **97** | **100** | **100** | 0.7 s | 0 | 0 ms | 68 |
| about | mobile | **95** | **97** | **100** | **100** | 3.0 s | 0 | 30 ms | 74 |
| about | desktop | **100** | **97** | **100** | **100** | 0.7 s | 0 | 0 ms | 97 |
| contact | mobile | **95** | **97** | **100** | **100** | 2.9 s | 0 | 20 ms | 70 |
| contact | desktop | **100** | **97** | **100** | **100** | 0.6 s | 0 | 0 ms | 98 |
| faq | mobile | 93 | **97** | **100** | 92 | 3.1 s | 0 | 70 ms | 65 |
| faq | desktop | **100** | **97** | **100** | 92 | 0.7 s | 0 | 0 ms | 92 |
| legal | mobile | **95** | **95** | **100** | **100** | 2.9 s | 0 | 30 ms | 60 |
| legal | desktop | **100** | **95** | **100** | **100** | 0.6 s | 0 | 0 ms | 98 |
| embed | mobile | ⚠ 71 | **97** | ⚠ 77 | **100** | 2.8 s | 1.114 | 20 ms | 31 |
| embed | desktop | ⚠ 75 | **97** | ⚠ 77 | **100** | 0.6 s | 1.07 | 0 ms | 61 |
| post | mobile | 94 | **95** | **100** | **100** | 3.1 s | 0 | 30 ms | 84 |
| post | desktop | **100** | **95** | **100** | **100** | 0.6 s | 0 | 0 ms | 98 |
| blog-index | mobile | 93 | **97** | **100** | **100** | 3.2 s | 0 | 30 ms | 63 |
| blog-index | desktop | **100** | **97** | **100** | **100** | 0.7 s | 0 | 0 ms | 91 |
| category | mobile | 93 | **97** | **100** | 92 | 3.2 s | 0 | 40 ms | 60 |
| category | desktop | **100** | **97** | **100** | 92 | 0.7 s | 0 | 10 ms | 87 |
| tag | mobile | **96** | **97** | **100** | 92 | 2.8 s | 0 | 30 ms | 63 |
| tag | desktop | **100** | **97** | **100** | 92 | 0.6 s | 0 | 0 ms | 92 |
| campaign | mobile | 93 | **97** | **100** | **100** | 2.8 s | 0 | 170 ms | – |
| campaign | desktop | **100** | **97** | **100** | **100** | 0.7 s | 0 | 0 ms | – |
| landing | mobile | **95** | **97** | **100** | ⚠ 69 | 2.9 s | 0 | 60 ms | – |
| landing | desktop | **100** | **97** | **100** | ⚠ 69 | 0.6 s | 0 | 0 ms | – |

### Below budget (17 rows) and why
- **home mobile**: perf 93 (LCP 3.2 s, TBT 20 ms), seo 92
- **home desktop**: seo 92
- **product-loan mobile**: perf 94 (LCP 3.1 s, TBT 20 ms)
- **hub mobile**: perf 94 (LCP 3.2 s, TBT 30 ms)
- **faq mobile**: perf 93 (LCP 3.1 s, TBT 70 ms), seo 92
- **faq desktop**: seo 92
- **embed mobile**: perf 71 (LCP 2.8 s, TBT 20 ms), best-practices 77
- **embed desktop**: perf 75 (LCP 0.6 s, TBT 0 ms), best-practices 77
- **post mobile**: perf 94 (LCP 3.1 s, TBT 30 ms)
- **blog-index mobile**: perf 93 (LCP 3.2 s, TBT 30 ms)
- **category mobile**: perf 93 (LCP 3.2 s, TBT 40 ms), seo 92
- **category desktop**: seo 92
- **tag mobile**: seo 92
- **tag desktop**: seo 92
- **campaign mobile**: perf 93 (LCP 2.8 s, TBT 170 ms)
- **landing mobile**: seo 69
- **landing desktop**: seo 69

Reading the table: **desktop is 100/100 on every template except the embed page.** Mobile performance is 93–96 against the 95 line: Lighthouse's simulated mobile (4× CPU slowdown, 1.6 Mb/s) puts the hero LCP at 2.8–3.2 s on every template, including text-only pages, so the remaining gap is the shared critical path (HTML ≈ 80 KB, one 115 KB stylesheet of which 83 KB is the ported theme + mega-menu CSS, two preloaded brand fonts) rather than any page's content. Before: 24–84 mobile, 50–98 desktop.

Why the other cells are not 100:
- **Accessibility 95–97**: every deduction is `color-contrast` on brand-orange elements (white-on-`#e36129` buttons, orange "Read More >" links, stat labels) at 3.5:1, exactly as on the live site → decision §4.1. Heading order and link text in the generated parts were fixed invisibly (cards are `h2`/`h3` styled as the theme's `h4`; "Read More >" carries a visually hidden post title).
- **SEO 92**: `link-text` on copy links ("Learn more", "here") → decision §4.3. Landing 69 = deliberate `noindex` on the example page.
- **Embed page (perf 71–75, best-practices 77, CLS 1.1)**: the MoneyHelper budget planner is a third-party iframe that sets its own cookies and resizes itself after load; on localhost it additionally refuses to render (their X-Frame-Options allow-list) so the CLS figure here is the tool failing, not the page. Height is reserved per viewport; the honest expectation on the live domain is CLS < 0.1 but best-practices stays capped by their cookies → decision §4.4.
- Zero console errors on every page except that MoneyHelper frame refusal (localhost only).

## 3. Deviations from a byte-identical lift (all deliberate, all reversible)
1. **Markup, not copy, changed**: Asana-pasted wrapper divs unwrapped; inline `style="text-align:center"` carried as a style prop; links to our own domain made root-relative; the 4 newsletter-tracking internal links normalised (decision 3); WordPress image size variants replaced by the original file + `next/image`.
2. **Not reproduced**: WOW.js entrance animations (end state identical), CF7 image captcha, slick carousel JS (CSS scroll-snap with the same 4/3/2/1 layout), Max Mega Menu JS (CSS + 60 lines of TS), dashicons/Font Awesome webfonts, duplicate jQuery, CookieYes.
3. **Added**: regulatory footer statement (approved), cookie banner (first-party), `/lp/*` landing template (example at `/lp/member-loan/`, noindex), `llms.txt`, generated OG images, product/FAQ/Article/Organization schema, skip link, security headers, 410s and holds per decisions.
4. **Mobile overflow fixed** (decision 4): all pages render at 390px wide; the 17 overflowing pages now fit.
5. **Footer grows by one paragraph** on every page (the statement), so every page is ~70px taller than the baseline screenshot; the Phase 4 pixel diff masks the footer band for the comparison.

## 4. Decisions needed before Phase 4 can "fix, don't waive"
1. **Button contrast (WCAG 2.2 AA).** White text on brand orange `#e36129` is 3.5:1; AA needs 4.5:1 at the button text size. Options: (a) keep as-is and record a known exception (visible fidelity, fails AA); (b) darken **button backgrounds only** to `#c44e17` (4.7:1) — a visible but small change, text and links keep the brand orange; (c) raise button text to 18.7px bold (3:1 rule) — changes layout more. I recommend (b).
2. **Heading levels inside cards/blocks** — done (invisible): post cards, product teaser cards and icon tiles now follow document order, styled exactly as before.
3. **Copy-level link text** ("Learn more", "here", "Read More >"). "Read More >" now carries a visually hidden post title. The others are copy: either leave (SEO 92 on 5 templates) or allow a visually hidden suffix such as "Learn more<span hidden>about our loans</span>", which changes no visible word. I recommend the hidden suffix.
4. **MoneyHelper / Inbest embeds** set third-party cookies when they load, which caps best-practices on those 3 pages. Alternatives: click-to-load (one extra tap for members) or accept the cap on three utility pages. I recommend accepting.
5. **shadcn/ui**: initialised and themed (`components.json`, tokens mapped in `globals.css`) but no primitive is used in the shipped UI because every element had to reproduce the theme's own DOM/CSS; it is there for new work. Fine to keep?

## 5. How to run
```bash
pnpm install && pnpm dev            # http://localhost:3000
pnpm build && pnpm start            # production (prebuild runs validate + locked diff + media dims + redirects)
pnpm validate                       # frontmatter, media, locked text
pnpm lhci                           # Lighthouse budget (mobile); pnpm lhci:desktop
```
Local previews used in this session: `gmb-dev` (3010) and `gmb-start` (3011) in `~/.claude/launch.json`.

**STOP — awaiting your go-ahead for Phase 4 (QA) and your calls on §4.**
