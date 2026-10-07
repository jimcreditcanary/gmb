# Phase 2 report — Content model & redirect plan
**Generated:** 2026-10-07 07:56 (London) · Inputs: Phase 1 inventory + your decisions of 2026-10-07 (logged in `audit/decisions.md`).

## 1. Categorisation — `audit/categorisation.csv` (494 rows)
Columns: url, category, template, action, locked, locked_reason, noindex_now, content_path, title, word_count, notes.

| Category | Build | Notes |
|---|---|---|
| home | 1 | `/` (+ `/page/2/` → 301 to `/`) |
| hub | 4 | `/loans/`, `/savings/`, `/resources/`, `/resources/member-helper/` |
| product-loan | 8 | all `/loans/*/` — **locked** |
| product-savings | 7 | all `/savings/*/` incl. life-savings insurance — **locked** |
| about | 1 | **locked** (FSCS wording in copy) |
| contact | 1 | CF7 form → route handler — **locked** |
| blog-post | 63 | root-level slugs preserved; 32 locked (APR / rates / FCA wording in body) |
| blog-index | 18 | `/our-blog/` + 7 pages, `/category/uncategorised/` + 7 pages, 2 tags — generated from the content tree, pagination stays `noindex,follow` |
| legal-regulatory | 2 | `/privacy-policy/`, `/complaints/` — **locked** |
| utility | 6 | `/faqs/`, `/member-hub-faqs/` (locked, FAQPage schema), 3 MoneyHelper/Inbest embed pages, `/cost-of-living/` |
| other (campaign) | 14 | 3 AGM pages (CF7), 3 AGM thank-you pages, 3 Congress pages, prize draw (locked), join-£25, advocate (CF7), Member-Hub-coming, `/test/` |
| **Total built** | **125** | 113 MDX files + 12 generated archive pages |
| hold | 357 | 10 directors-area + 278 `/file/` + 69 `/filter/` — per your decision 1 |
| exclude-duplicate | 11 | `?s=`, `?page=0`, Conesso-UTM and case variants — resolved by routing/redirect rules, no content |

Locked total: **67 pages** (every product, legal, FAQ, about, contact, home, prize draw, plus 32 posts). The footer (FSCS badge + the new regulatory statement) is a locked shared component.

## 2. Content model
```
content/
  home/home.mdx                      product-loan/member-loan.mdx …   blog-post/2026-agm-summary.mdx …
  hub/loans.mdx …                    product-savings/member-saver.mdx … legal-regulatory/complaints.mdx
  about/about-us.mdx                 contact/contact-us.mdx            utility/faqs.mdx …   other/annual-general-meeting-2026.mdx …
  _site/footer.mdx  _site/navigation.yaml  _site/regulatory.mdx  (shared, locked)
```
**Frontmatter (zod-validated at build):**
```yaml
title: Member Loan | GMB Credit Union Loans      # <title> verbatim
description: Discover the affordable …           # meta description verbatim ('' allowed; build warns)
canonical: https://www.gmbcreditunion.com/loans/member-loan/
slug: /loans/member-loan/                        # full path, trailing slash — the route
template: product | home | hub | about | contact | post | legal | faq | embed | campaign | generic | landing
publishedAt / updatedAt: ISO                     # from article:published_time / modified_time (Yoast)
ogImage: /media/…                                # existing og:image, else omitted → generated fallback (decision 5)
schema: { …existing Yoast @graph verbatim… }      # preserved exactly; template ADDS Organization/LoanOrCredit/etc. as separate nodes
locked: true | false
noindex: true | false                            # from current robots meta
source_url: https://www.gmbcreditunion.com/…     # used by the locked-page diff against source/html
product:                                         # product template only — structured fields that feed LoanOrCredit / FinancialProduct schema
  kind: loan | savings
  amountRange, aprRange, termMax, repAPR …        # extracted from the Panel/PopoutBlock copy, never rendered (copy stays in body)
```
**Body:** verbatim copy as MDX inside layout components. One component per theme block (table below). Headings, bold, links, lists and inline `<u>` are markdown; everything structural is a prop. No copy lives in components — a template renders whatever sections the MDX contains, in order.

**Proof:** `tools/html2mdx.mjs` converts rendered HTML → this format. 14 pages converted into `audit/mdx-prototype/` (home, loan + savings product, both hubs, about, contact, FAQs, privacy, complaints, cost-of-living, prize draw, resources hub, a post). Word-multiset comparison against the source `<main>` text: **14/14 pages identical** (residual diffs are escaped `*`, carousel `>` arrows and the FAQ jump-nav labels, which are generated UI). Example: `audit/mdx-prototype/loans__member-loan.mdx`.

Conversion rules that touch markup but not copy (flagging so you can object): Asana-pasted wrapper `div.TypographyPresentation` in 3 posts unwrapped; `&nbsp;` → space; absolute `https://www.gmbcreditunion.com/…` links → root-relative; `target="_blank"` preserved; Trustpilot/related-posts/pagination/jump-nav regenerated rather than stored.

## 3. Component inventory
**Templates (one per category):** HomePage · HubPage · ProductPage (loan + savings variants) · AboutPage · ContactPage · PostPage · ArchivePage (blog index / category / tag, paginated) · LegalPage · FaqPage · EmbedPage · CampaignPage · GenericPage · **LandingPage** (new, paid media: no nav, single CTA, rep-APR + risk warning above the fold, UTM → hidden fields) · NotFound.

**Shared:** SiteHeader (logo + Max-Mega-Menu equivalent, 630px collapse, Member Hub button) · SiteFooter (two nav menus, NewsletterForm, FSCSBadge, **RegulatoryStatement** — new) · TrustpilotBlock (SSR static markup, widget lazy) · NewsletterForm (Mailchimp fields EMAIL + honeypot → route handler) · ContactForm (CF7 fields → route handler) · AppStoreButtons · ProductCard (BoxSlider box) · BlogCard · Breadcrumbs (visual none today; BreadcrumbList schema only) · CookieBanner (PECR, Consent Mode v2) · YouTubeFacade · Lottie (lazy, below-fold only).

**Block → component map (from 136 real pages):**
| Theme block | Pages | Instances | Proposed component | Props | Copy carried as MDX children |
|---|---|---|---|---|---|
| `section.header-page` | 133 | 133 | PageHeader | colour, image|lottie, trustpilot, buttons[] | h1 + intro + optional eyebrow |
| `section.postsingle` | 63 | 63 | PostBody | — (post template supplies header, date, featured image) | article HTML → markdown |
| `section.popout-block` | 31 | 65 | PopoutBlock | colour, image, imagePosition | h2 + body + CTA links |
| `section.content-rows` | 24 | 34 | ContentRow / Col / ColImage / IconList | colour, centred | optional header h2, 1–2 columns, icon list, buttons |
| `section.posts` | 18 | 18 | RelatedPosts (generated) | count | none — pulled from content tree |
| `section.panel-section` | 17 | 17 | PanelSection / Panel / PanelFooter | colour per panel, title | bullet lists (loan terms, eligibility, T&Cs) |
| `section.video-section` | 16 | 16 | VideoSection | video (YouTube embed, lazy facade) | h2 + body |
| `section.list-block` | 15 | 15 | ListBlock / ListItem | heading, icon per item | bold benefit lines |
| `section.contact-form` | 5 | 5 | ContactForm | formId, fields[], submit | — (CF7 → route handler) |
| `section.posts-overview` | 3 | 3 | PostsOverview (home) | trustpilot | h2 + intro; cards generated |
| `section.header` | 2 | 2 | PageHeader (home variant) | colour, image, trustpilot, buttons[] (icon tiles) | h1 + intro |
| `section.colour-panels` | 2 | 2 | ColourPanels / ColourPanel | colour, image per panel | h3 + body + link |
| `section.box-slider` | 2 | 2 | BoxSlider / Box | heading, intro, image per box | product teaser cards (slick carousel today) |
| `section.icon-block` | 2 | 2 | IconGrid / IconItem | colour, columns, heading | icon + text per item |
| `section.faq` | 2 | 2 | FAQGroup / FAQ | heading, colour, question | answer markdown; emits FAQPage schema |
| `section.header-title` | 1 | 1 | PageHeader (title-only) | — | h1 |
| `section.label-block` | 1 | 1 | StatBlock / Stat | figure, label | — |
| `section.block-icon-section` | 1 | 1 | IconGrid (values variant) | heading | icon + h3 + text |
| `section.info-block` | 1 | 1 | InfoBlock / InfoPanel | heading | intro + panels |
All colour variants (yellow, lilac, purple, green, ltblue, cream, white) map to tokens from `audit/design-tokens.json`.

## 4. Redirect plan — `audit/redirects.csv` (132 rows) — default is PRESERVE
| Kind | Rows | What |
|---|---|---|
| live-301 | 56 | every live redirect kept verbatim (renamed slugs, `/index.php/*` legacy, section moves, feeds, sitemap aliases) |
| live-301 (retargeted) | 16 | legacy `/index.php/node/N`, `/user/*`, `/nivo`, `/2021-agm-summary` etc. whose current target is a 404 → mapped to the nearest live page (`/`, `/our-blog/`, `/resources/`, `/savings/member-saver/`, `/savings/young-saver/`) — decision 6 |
| live-301 (platform) | 39 | trailing-slash redirects, reproduced by `trailingSlash: true` (308, not 301 — SEO-equivalent) |
| live-301→HOLD | 4 | redirects whose target is a held `/file/` page → follow the hold rule |
| platform | 7 | http→https, apex→www (Vercel domain config), query strings ignored (`/?page=0`, `/?s=`), `/our-blog/feed/` regenerated, `/sitemap_index.xml` + child sitemaps kept at the same paths, real `/apple-touch-icon.png` shipped |
| proposed | 5 | `/page/2/` → `/`; uppercase paths → lowercase (middleware; fixes `/About-Us/`); `/junior-saver-account-application` → `/savings/young-saver/` (dead internal link, fixed without editing copy); file/filter sitemaps → index |
| proposed-HOLD | 5 | `/directors-area/*` → **302** `/` (temporary, keeps the door open for a Credit Canary portal); `/file/*`, `/filter/*` (+pagination) → **410 Gone** (333 thin URLs out of the index fastest). Alternative if you prefer softer: 302 → `/` |

Blog pagination (`/our-blog/page/N/`), category and tag archives are **served as pages**, not redirected, with the same `noindex,follow`. Nothing else moves.

## 5. Regulatory statement (decision 2) — for your sign-off, not yet in any file that renders
Facts read from the two registers on 2026-10-07 (`audit/raw/regulatory-facts.md`): legal name **Thorne Credit Union Limited**, trading as GMB Credit Union; **FRN 213550**; Mutuals register **564C** (Credit Unions Act 1979, registered 22 Dec 1998); registered office Sinclair House, 11 Station Road, Cheadle Hulme, Stockport SK8 5AF; authorised since 2 Jul 2002.

Proposed footer text (standard credit-union form):
> GMB Credit Union is a trading name of Thorne Credit Union Limited, which is authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority. Firm Reference Number 213550. Registered under the Credit Unions Act 1979, registration number 564C. Registered office: Sinclair House, 11 Station Road, Cheadle Hulme, Stockport SK8 5AF. Eligible deposits are protected by the Financial Services Compensation Scheme.

This is the one piece of new copy in the whole project. It goes in `content/_site/regulatory.mdx`, locked, rendered in the footer on every page, and feeds the `Organization` / `FinancialService` schema (legalName, identifier FRN, address). Please confirm or amend the wording; the client's compliance owner should approve it.

## 6. How the other decisions land in Phase 3
- **Performance (3):** budget ≥95 mobile and desktop on every template, enforced by Lighthouse CI. Biggest wins already identified: hero PNGs → next/image AVIF with priority; drop the duplicate jQuery and all jQuery; Trustpilot/GTM/CookieYes off the critical path; MoneyHelper/Inbest iframes get reserved height (CLS 1.1 today); YouTube facade.
- **Overflow (4):** the 17 pages are listed in `audit/raw/mobile-overflow.txt`; root cause will be fixed in the shared components (PopoutBlock rep-example SVG + ContentRow). Phase 4 pixel-diff baseline for those pages is re-shot from the live site with overflow clipped, so the comparison is fair.
- **OG + schema (5):** `next/og` fallback card (brand navy/orange, Menca, page title) for the 71 pages without `og:image`; Organization + FinancialService site-wide, LoanOrCredit (8), FinancialProduct (7), Article (63), FAQPage (2), BreadcrumbList everywhere — existing Yoast nodes kept verbatim alongside.

## 7. Defaults I will apply unless you say otherwise
1. `/test/` is built verbatim but **noindex** and left out of the sitemap.
2. The three AGM thank-you pages become **noindex** (CF7 confirmation pages).
3. Conesso/UTM internal links inside the four credit-score posts are **kept verbatim** (they resolve via the redirect rules). Say the word and I'll normalise them.
4. The two Trustpilot TrustBox templates are kept (static SSR markup + lazy widget), using the existing business-unit IDs.
5. Mailchimp form posts to a Next route handler that forwards to the Mailchimp API (key stubbed via env) — if you'd rather keep the direct `list-manage.com` POST, that is a one-line switch.
6. GTM container `GTM-NQCV3C4` is loaded after consent / first interaction; CookieYes is **replaced** by a first-party PECR banner wired to Consent Mode v2 (the CookieYes script is itself GTM-injected today, so this is a container change on their side at cutover — still need access to confirm).

## 8. Artefacts
`audit/categorisation.csv` · `audit/redirects.csv` · `audit/mdx-prototype/*.mdx` (14 pages) · `audit/raw/regulatory-facts.md` · `audit/raw/component-table.md` · `audit/decisions.md` · `tools/html2mdx.mjs` (becomes the Phase 3 import script) · `tools/phase2-plan.mjs`

**STOP — awaiting your go-ahead for Phase 3** (and your call on §5 wording, the 410-vs-302 choice for held URLs, and the §7 defaults).
