# Page templates

Every page under `/content` declares one `template` in its frontmatter (`lib/frontmatter.ts`). The template fixes two things: the heading outline and the blocks the page is built from. The register of every page and its template is `audit/templates.csv` (regenerate with `node tools/templates-csv.mjs`).

Brief (Jim Fell, 2026-10-07): categorise each page into Home · About · Product Category · Product · Prize Saver · Resources · Blog Home · Blog Post · Contact, then make the heading structure consistent within each template. Three further templates were needed for pages that do not fit those nine and must keep their URLs: **Legal** (regulatory, locked), **Campaign** (AGM, Congress, offers, thank-you pages) and **Landing** (paid media, new in Phase 3).

| Template | Pages | Where |
|---|---|---|
| `home` | 1 | `content/home/home.mdx` |
| `about` | 1 | `content/about/about-us.mdx` |
| `product-category` | 2 | `/loans/`, `/savings/` (`content/hub/`) |
| `product` | 14 | 8 loans, 5 savers, Life Savings Insurance (`content/product-loan/`, `content/product-savings/`) |
| `prizesaver` | 1 | `/savings/prizesaver/` |
| `resources` | 9 | `/resources/`, Member Helper, Budget Planner, Benefit Calculator, Debt Advice Locator, Cost of Living, FAQs, Member Hub FAQs, GMBCU Prize Draw |
| `blog-home` | route | `/our-blog/` + `/our-blog/page/N/`, `/category/*`, `/tag/*` (`components/templates/ArchivePage.tsx`, titles in `content/_site/archives.json`) |
| `post` | 63 | `content/blog-post/` (root-level slugs) |
| `contact` | 1 | `content/contact/contact-us.mdx` |
| `legal` | 2 | Complaints, Privacy Policy (`locked: true`) |
| `campaign` | 13 | AGM 2024–26 + their thank-you pages, Congress 2023–25, Join GMBCU £25 offer, Credit Union advocate, Member Hub announcement, `/test/` (noindex) |
| `landing` | 1 | `/lp/member-loan/` (noindex example) |

Two calls to confirm: **PrizeSaver** is the `/savings/prizesaver/` account page (the GMBCU Prize Draw page sits under Resources in the nav, so it is `resources`); **Life Savings Insurance** is a `product` because it shares the product page blocks, although it has no apply button.

## Headings: the rule for every template

1. Exactly one `h1` per page, always inside `PageHeader` (or the archive/landing hero). It is the page title without the ` | GMBCU` suffix (`displayTitle()` in `lib/content.ts`), or the recorded `h1:` override.
2. Every section title is an `h2`. Block components (`ListBlock`, `IconGrid`, `InfoBlock`, `BoxSlider`) render their `heading` prop as the `h2` through `SectionHeader`.
3. Items inside a section (`Box`, `IconItem`, `Panel` titles, FAQ groups' questions aside) are `h3`. Sub-items `h4`. Never skip a level.
4. Visual size is not the heading level. When a heading has to *look* different from its level, use the `.h2 / .h3 / .h4` classes (`app/globals.css`), never a different element. Blog post bodies are sized by scoped CSS (below).
5. Straplines under the `h1` are paragraphs, not headings.

## Canonical outline per template

**home** — `PageHeader variant="home"` (h1 + intro p + tile buttons + Trustpilot) → `ContentRow` sections (h2 + p + `Button`) → `PostsOverview` (h2 + p; cards generated, card titles h3).

**about** — `PageHeader` (h1 + strapline p) → `ContentRow` (h2 + two `Col`) → `StatBlock` → `ContentRow` (h2 + video `Embed`) → `IconGrid heading="Our Values"` (h2; items h3).

**product-category** — `PageHeader` (h1 + p, Lottie) → `BoxSlider heading intro` (h2; each `Box` h3 + bullets + primary `Button` "Apply Now" + secondary `Button` "Learn more") → `IconGrid` (no heading; items h3) → `PopoutBlock` (h2 "How to apply" + `Button`).

**product** / **prizesaver** — `PageHeader label` (h1 + intro p + `Button` "Apply now" as its own paragraph) → `ListBlock heading="Benefits for you"` (h2; items bold p) → `PanelSection` (three `Panel` h3 + `PanelFooter` h2 "Got a question?" + `Button`) → loans only: `PopoutBlock` (h2 representative example) → `PopoutBlock` (h2 "Apply" + `Button`) → `VideoSection` (h2 "Why choose us?") → loans + Life Savings: `ContentRow` (h2 "Download our app" + two `Button`s). PrizeSaver differs only in copy (bulleted apply options); it is a separate template so agents can treat it as the flagship/prize-draw product.

**resources** — `PageHeader` (h1 + p) → any of `ContentRow` (h2 + p + `Button`), `PopoutBlock` (h2 …), `ColourPanels` (h2 per panel), `FAQSection` (`FAQGroup` h2; questions are toggles), `MoneyHelperTool` / `Embed` placeholders, `PostsOverview` (h2).

**blog-home** — `PageHeader` (h1 + intro p) → `PostList level={2}` (card titles h2) → `Pagination`.

**post** — `PageHeader imageWrap="wrap-blog"` (h1, date, featured image) → body: paragraphs, `##` sections, `###` sub-sections, `####` sub-sub-sections. Scoped CSS keeps the body headings at the sizes the posts were authored at (h2 32px, h3 20px, h4 18px).

**contact** — `PageHeader` (h1 + p) → `PopoutBlock` (h2 "How to reach us" + details) → `ContactForm` (h2 "Or, fill out our form" + h3 "Your Details").

**legal** — `PageHeader` (h1; Privacy has a strapline `<p className="h3">`) → `ColourPanels` (h2 per panel) or `ContentRow` (h2 + long copy). Locked: wording never changes.

**campaign** — `PageHeader` (h1 + p) → `PopoutBlock` sections (h2) → optional `PanelSection` (h3 panels) → optional `ContactForm` (h2).

**landing** — generated hero (h1 = title, description, rep APR, risk warning, one `Button`) → MDX blocks. No nav. `noindex` unless it should rank.

## What the 2026-10-07 standardisation changed

Copy is untouched. Changes are structure only (`audit/raw/standardise-log.csv` lists per-file counts).

| Change | Files | Visible? |
|---|---|---|
| `template` renamed: `hub`→`product-category`/`resources`, `embed`/`faq`→`resources`, prize draw→`resources`, PrizeSaver→`prizesaver`, `generic`→`campaign` | 13 | No |
| Blog post bodies: `###`→`##`, `####`→`###` (60 posts; 3 were already h2/h3) | 60 | No for 60 (scoped CSS keeps sizes); the 3 h2-authored posts now use the common post sizes |
| Campaign pages: section `###`→`##` so no page skips from h1 to h3 | 8 | Yes: headings on those 8 pages now render at the standard h2 size used by every other `PopoutBlock` |
| Life Savings Insurance: hero `h2` → `h1` with `.h2` look (page had no h1) | 1 | No |
| Privacy Policy: hero strapline `h3` → `<p class="h3">` | 1 | No |
| Hero "Apply now" moved from `<br>` inside the intro paragraph to its own paragraph | 14 | ~10px more space above the button |
| `<A className="button">` → `<Button>`; `button-alt` → `variant="secondary"` | 110 links | No |
| Word-paste link classes (`Hyperlink SCXW… BCX…`, `sharedcomments-hyperlink`) dropped | 8 links | No |
| Lift defects found on the way and fixed: Contact Form 7 field labels and the member-number placeholder restored verbatim from the live HTML (they rendered as raw field names); the Phase 3 CSS purge had discarded every `input[type=…]` rule (it only kept class/id selectors), so text fields had no borders and Submit was plain text: `scripts/purge-css.mjs` now keeps attribute selectors | 5 forms + footer newsletter | Yes: back to how the live site looks |

All of these are logged in `docs/deviations.md` (rows 25–29).
