# Decisions log

## 2026-10-07 — Jim's responses to Phase 1
1. **Directors area, `/file/*` and `/filter/*`: HOLD.** Not rebuilt in the new site for now; likely becomes a Credit Canary-provided directors portal later. Phase 2 proposes how those URLs behave at cutover.
2. **Regulatory status statement: ADD.** Site currently has none; Jim wants it. Source of truth: FCA register https://register.fca.org.uk/s/firm?id=001b000000MfLhuAAF and Mutuals register https://mutuals.fca.org.uk/Search/Society/24470. Wording to be drafted from register facts and signed off by Jim before build.
3. **Performance: strong on mobile AND desktop across the board** (budget ≥95 both form factors, every template).
4. **Horizontal overflow on phones: FIX.** The 17 affected pages are an allowed visual deviation; pixel diffs on those pages are assessed against intent, not the overflowed baseline.
5. **og:image + Organization/product schema: ADD** (generated OG fallback, Organization/FinancialService/LoanOrCredit/FinancialProduct/Article/FAQPage/BreadcrumbList).
6. **Legacy 301s: PRESERVE** all live redirects, including Drupal-era `/index.php/*` paths, mapped to the best live equivalent where the current target 404s.

Unanswered (proceeding with defaults, flagged in Phase 2): GTM/CookieYes/Mailchimp access; case-variant URLs; feeds; `/test/`; Conesso links in posts.

## 2026-10-07 — Jim's responses to Phase 2 (go for Phase 3)
1. **Footer regulatory statement wording: APPROVED** as drafted in audit/raw/regulatory-facts.md.
2. **Held URLs: AGREED** — `/directors-area/*` → 302 `/` (temporary); `/file/*`, `/filter/*` → 410 Gone.
3. **§7 defaults: "go for best practice"** → `/test/` and the 3 AGM thank-you pages built verbatim but noindex + out of sitemap; Conesso/UTM internal links in the 4 credit-score posts normalised to canonical paths (link text unchanged, hrefs only); Trustpilot kept (SSR markup + lazy widget); first-party PECR consent banner with Consent Mode v2.
4. **GTM + Mailchimp: no access yet → OMIT, pluggable.** GTM loads only when `NEXT_PUBLIC_GTM_ID` is set (consent plumbing built now). Newsletter form rendered identically; its route handler forwards to the public Mailchimp list-manage endpoint (no key needed) until `MAILCHIMP_API_KEY` + `MAILCHIMP_AUDIENCE_ID` are set, at which point it uses the Marketing API.

## 2026-10-07 — Phase 3 implementation choices (mine, flagged for review in phase-3-report.md §3–4)
- Theme CSS ported verbatim (vendor stripped) rather than re-authored in Tailwind: pixel fidelity needs the original rules; Tailwind/shadcn tokens carry the palette for new work.
- next-mdx-remote v6 `blockJS: false` (content is repo-controlled; expression props needed).
- Lottie headers: static SVG/PNG poster first; animation only on desktop, idle, no reduced-motion. 2 headers have no static equivalent (savings hub, prize draw) and still animate on mobile.
- CF7 image captcha dropped: honeypot + time-trap (+ Turnstile via env).
- `experimental.inlineCss` rejected after measurement (+400 KB/page in the RSC payload).
- Held pages: directors-area 302 → `/`; `/file/*`, `/filter/*` 410 with `X-Robots-Tag: noindex`.
- WordPress image size-variant URLs rewrite to the original (variants not shipped; 101 MB → originals only).
