# Editing gmbcreditunion.com

This site is Next.js (App Router) + MDX. **All copy lives in `/content`**; components in `/components` render layout only. Agents and humans edit the same way.

## Golden rules
1. **Verbatim copy.** Do not reword, "improve" or reformat existing copy unless the change request says so.
2. **Locked pages** (`locked: true` in frontmatter: every product, legal, FAQ, about, contact, home, prize draw, the footer statement and some posts) are regulatory. The build diffs their text against `content/_locked/*.txt` and fails on any change. To make an approved change: edit the MDX, then update the snapshot (`pnpm tsx scripts/locked-diff.ts` prints the diff; copy the new text into the snapshot file) and say so in the PR.
3. **URLs never change.** `slug` + `canonical` are the contract. Moving a page = add a row to `audit/redirects.csv`, run `node scripts/gen-redirects.mjs`, and keep the old slug redirecting.
4. Run `pnpm validate` before committing. The build runs it too.

## Add or edit a page
- File: `content/<category>/<slug>.mdx`. Categories: `home hub product-loan product-savings about contact blog-post legal-regulatory utility other landing`.
- Frontmatter schema: `lib/frontmatter.ts` (zod). Required: `title`, `canonical`, `slug` (root-relative, trailing slash), `category`, `template`. Templates: `home about product-category product prizesaver resources post contact legal campaign landing` (blog home is a route). Each template has a fixed heading outline: see **`docs/templates.md`** before adding or restructuring a page. Product and PrizeSaver pages need a `product:` block (kind, apr, amounts) which feeds schema.org; it is never rendered.
- Body: Markdown inside layout components. Available blocks (one per theme section): `PageHeader`, `ListBlock/ListItem`, `PanelSection/Panel/PanelFooter`, `PopoutBlock`, `VideoSection`, `ContentRow/Col/ColImage/IconList/IconListItem`, `StatBlock/Stat`, `IconGrid/IconItem`, `ColourPanels/ColourPanel`, `BoxSlider/Box`, `FAQSection/FAQGroup/FAQ`, `InfoBlock/InfoPanel`, `ContactForm`, `Embed`, `MoneyHelperTool`, `RelatedPosts`, `PostsOverview`. Full catalogue and props: **`docs/components.md`**. Open any existing page of the same template and copy its structure.
- Buttons: always `<Button href="…">Label</Button>` (`variant="secondary"`, `size="sm|lg"`, `block`, `target="_blank"`). Never `<a className="button">`.
- Headings: one `h1` (in `PageHeader`), sections `##`, items `###`, never skip a level. Blog posts: `##` sections, `###` sub-sections.
- Colours: `yellow lilac purple green ltblue cream white` (see `audit/design-tokens.json`).
- Images: drop the file in `public/media/`, reference it as `/media/name.png`. `pnpm validate` checks every reference exists; `scripts/media-dims.mjs` (runs on build) records dimensions so there is no layout shift.
- The route is automatic: `app/[[...slug]]/page.tsx` renders any slug that exists in `/content`.

## Add a product
Copy `content/product-loan/member-loan.mdx` (or a savings page), change `title/description/canonical/slug`, the `product:` numbers and the copy. Add it to the nav in `content/_site/site.json` and to the hub page's `BoxSlider` in `content/hub/loans.mdx`.

## Add a blog post
```bash
pnpm new:post "Title of the post" --date 2026-10-07
```
creates `content/blog-post/<slug>.mdx` with valid frontmatter. Fill in `description`, `excerpt` (the card text), `featuredImage`/`cardImage` (drop files in `public/media/`), optional `tags`. Posts live at root-level slugs (`/title-of-the-post/`), as on the old site. Archives, RSS (`/our-blog/feed/`), sitemaps and `llms.txt` regenerate at build.

## Add a redirect
Append to `audit/redirects.csv` (`source,destination,status,kind,reason`), run `node scripts/gen-redirects.mjs`, commit `lib/redirects.json`. Legacy and renamed URLs resolve in one hop via `proxy.ts`; `/file/*` and `/filter/*` answer 410; `/directors-area/*` 302s to `/` (on hold).

## Paid-media landing page
Copy `content/landing/member-loan-offer.mdx`. Template `landing` hides the nav, renders the rep APR + risk warning above the fold, and carries UTM parameters into forms and the CTA. Keep `noindex: true` unless it should rank.

## Site-wide data
`content/_site/site.json` (nav, footer menus, socials, Trustpilot ids), `content/_site/regulatory.json` (approved footer statement, FRN; locked), `content/_site/archives.json` (archive page titles).

## Environment
See `.env.example`. Nothing is required to build. `NEXT_PUBLIC_SITE_ENV=production` is what turns indexing on; every other environment is `noindex` + `X-Robots-Tag`.

## Checks
`pnpm typecheck` · `pnpm lint` · `pnpm validate` (frontmatter + media + locked text) · `pnpm build` · `pnpm lhci` (Lighthouse ≥95 on every template, mobile; `pnpm lhci:desktop` for desktop).
