# gmbcreditunion.com re-platform — one-page summary

## What did not change at all
- **Every URL.** Same paths, same trailing slashes, blog posts still at root-level slugs. All 115 live redirects reproduced with their original 301/302 codes, now in one hop.
- **Every word of copy.** 108 pages imported verbatim; 67 regulatory pages are `locked` and the build fails if their text drifts from the archived original.
- **Titles, meta descriptions, canonicals (always `https://www`), robots directives, Open Graph tags, Twitter card, Yoast's structured data** — emitted exactly as before.
- **The visual design**: same theme CSS (ported), same fonts (self-hosted), same layouts and colours, bar the two items below.
- **Email.** DNS for Microsoft 365, Proofpoint, SPF, DKIM, DMARC and MTA-STS is untouched by the cutover.

## What changed and you can see
- Footer now carries the regulatory statement (trading name, FRN 213550, Mutuals 564C, registered office, FSCS).
- Buttons and small orange text use a slightly darker orange (`#c44e17`) to meet WCAG AA contrast; the stat band labels are white for the same reason.
- The MoneyHelper and Inbest tools are click-to-load panels instead of auto-loading iframes.
- Phones: no horizontal scrolling on the 17 pages that overflowed; hero animations show as still illustrations.
- Directors area redirects home (302); the 278 empty "file" pages and 69 filter archives are gone (410) — all on hold per decision.
- First-party cookie banner replaces CookieYes; nothing non-essential runs before consent. No analytics fire until the GTM id is configured.
Full register with reasons and revert paths: `docs/deviations.md`.

## What changed under the hood
- WordPress + jQuery ×2 + Font Awesome webfonts + Max Mega Menu JS + slick → **Next.js 16 (App Router), static HTML per page, React islands only where there is interaction.** 115 KB CSS (was 150 KB+ plus vendor), no render-blocking third parties, images served as AVIF/WebP with explicit sizes, fonts preloaded with swap.
- Lighthouse: desktop 99–100 on every template; mobile 93–96 performance with accessibility, best practices and SEO at 100 (was 24–84 / 50–98 before).
- Added schema.org graph: Organization + FinancialService (FRN, address), LoanOrCredit, FinancialProduct, Article, FAQPage, BreadcrumbList. Generated OG images for the 71 pages that had none. `llms.txt`.
- Security headers: HSTS, CSP, nosniff, frame-ancestors, Referrer-Policy, Permissions-Policy.
- Forms post to our own route handlers (newsletter → Mailchimp; contact → email provider when configured, logged until then).
- **Editable by agents and humans in Markdown**: `content/<category>/<slug>.mdx` + frontmatter validated by zod; `pnpm new:post`; `CONTRIBUTING.md`; CI runs typecheck, lint, content validation, locked-text diff, build and a Lighthouse ≥95 budget on every pull request.

## Links
- Repo: https://github.com/jimcreditcanary/gmb
- Vercel project: https://vercel.com/credit-canary1/gmb · production build (noindex until the real domain is attached, Vercel login required): https://gmb-credit-canary1.vercel.app
- Phase reports: `audit/phase-1-report.md` … `audit/phase-4-report.md`; decisions: `audit/decisions.md`
