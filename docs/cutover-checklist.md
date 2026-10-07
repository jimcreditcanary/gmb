# Cutover checklist — gmbcreditunion.com → Vercel

Owner: Jim Fell · Target: zero downtime, zero email disruption, zero SEO loss. Do the steps in order; tick as you go. Nothing in sections A–C touches the live site.

## What the DNS looks like today (public records, read 2026-10-07 — re-run `dig` on the day)
Authoritative nameservers: **StackDNS (20i)** — `ns1–ns4.stackdns.com`. The current host (185.151.30.202 / 2a07:7800::202) is 20i, which is also where StackProtect (the WAF) lives.

| Record | Value | Keep / change at cutover |
|---|---|---|
| `@` A | 185.151.30.202 | **CHANGE** → `76.76.21.21` (Vercel) |
| `@` AAAA | 2a07:7800::202 | **DELETE** (Vercel does not publish AAAA; leaving it would send IPv6 users to the old host) |
| `www` A | 185.151.30.202 | **CHANGE** → CNAME `cname.vercel-dns.com.` (delete the A first; a name cannot hold both) |
| `*` (wildcard) A | 185.151.30.202 (inferred: `mail`, `webmail`, `cpanel`, `autoconfig`, `default._domainkey` all resolve to it) | **KEEP** until 20i hosting is cancelled; confirm nothing member-facing uses a subdomain |
| MX 10 / 20 | `mx1-eu1.ppe-hosted.com` / `mx2-eu1.ppe-hosted.com` (Proofpoint Essentials) | **KEEP — do not touch** |
| MX 30 | `gmbcreditunion-com.mail.protection.outlook.com` (Microsoft 365) | **KEEP — do not touch** |
| TXT SPF | `v=spf1 include:nmkd9wnioe.spf.dmarc.san-it.co.uk ~all` | **KEEP** |
| TXT (other) | `bw=…`, `0ed1fe01…` (verification tokens) | **KEEP** |
| `_dmarc` CNAME | `…hosteddmarc.dmarc-dns.com` (SAN-IT hosted DMARC) | **KEEP** |
| `selector1/2._domainkey` CNAME | `…thornecreditunion.onmicrosoft.com` (M365 DKIM) | **KEEP** |
| `_mta-sts` CNAME | `gmbcreditunion-com._mta.mta-sts.tech` | **KEEP** |
| `autodiscover` CNAME | `autodiscover.outlook.com` | **KEEP** |
| TTL on `@` and `www` | 3600 s | lower to 300 s 48 h before |

Email is Microsoft 365 behind Proofpoint, managed by SAN-IT (SPF/DMARC hosts). The web move does not involve any of those records. **Nobody edits MX, SPF, DKIM, DMARC, MTA-STS or autodiscover during this change.**

## A. 48 hours before
- [ ] Get StackDNS (20i) control-panel access from the current supplier or the client; export the full zone (screenshot every record too). Save as `docs/dns-zone-before.txt`.
- [ ] Lower TTL on `@` A/AAAA and `www` A to **300**.
- [ ] Vercel → project `gmb` → Domains: add `www.gmbcreditunion.com` (primary) and `gmbcreditunion.com` (redirect to www). Leave unverified; Vercel will show the records it expects (should match the table above).
- [ ] Confirm in Vercel that production has `NEXT_PUBLIC_SITE_ENV=production` and previews do not.
- [ ] Search Console: make sure the **domain property** `gmbcreditunion.com` exists (DNS TXT verification) and you are an owner; note current coverage numbers and the submitted sitemaps.
- [ ] Jim reviews the production deployment on the `*.vercel.app` URL on phone and desktop (it serves `noindex` until the real host is attached).

## B. Cutover (15 minutes, any quiet hour)
- [ ] StackDNS: delete `@` AAAA. Change `@` A → `76.76.21.21`. Delete `www` A, add `www` CNAME → `cname.vercel-dns.com.`
- [ ] Vercel → Domains: both show "Valid configuration" within minutes (300 s TTL). SSL certificates issue automatically (Let's Encrypt); HSTS header is already sent by the app.
- [ ] From a phone on mobile data and a laptop: `https://gmbcreditunion.com` → 308 → `https://www.gmbcreditunion.com/` (200). `http://` variants redirect to https. Check `/loans/member-loan/`, a blog post, `/our-blog/feed/`, `/sitemap_index.xml`, `/robots.txt` (must show `Allow: /` and the sitemap line), `/file/budget/` (410), `/About-Us/` (301).
- [ ] View source on the home page: `<meta name="robots" content="index, follow…">` and **no** `X-Robots-Tag: noindex` header (`curl -I https://www.gmbcreditunion.com/`).
- [ ] Send a test email to and from an @gmbcreditunion.com mailbox. (Expected: unaffected, because MX/SPF/DKIM were not touched.)

## C. Same day
- [ ] Search Console: URL-inspect the home page and one product page → "URL is on Google / crawl allowed". Submit `https://www.gmbcreditunion.com/sitemap_index.xml` (same URL as before; it now lists `post-sitemap.xml` and `page-sitemap.xml`). Remove nothing yet.
- [ ] Vercel → Analytics/Logs: filter 404s for the first hours; anything unexpected gets a row in `audit/redirects.csv` → `node scripts/gen-redirects.mjs` → push (one-hop redirect live in ~1 minute).
- [ ] Trustpilot widget renders on the real domain; MoneyHelper tool renders after clicking the placeholder (it is allow-listed for this domain, not for previews).
- [ ] If GTM access has arrived: set `NEXT_PUBLIC_GTM_ID=GTM-NQCV3C4` in Vercel production env and redeploy; confirm tags fire only after "Accept All" (Consent Mode v2 defaults are `denied`).

## D. 30-day watch
- [ ] Day 1, 3, 7, 14, 30: Search Console → Pages (coverage): indexed count should stay ≈ 104 (the sitemap size) and "Excluded by noindex" should pick up the thank-you/test pages only. Expect ~350 "Not found (410)" / redirect entries for the held `/file/*`, `/filter/*` URLs — that is the intended removal.
- [ ] Core Web Vitals report (mobile + desktop) → all URLs "Good" after 28 days of field data.
- [ ] 404 monitor: Vercel log drain or a weekly `grep " 404 "` over the access logs; keep `audit/redirects.csv` as the single source of truth.
- [ ] Raise TTLs back to 3600 after one week.
- [ ] Cancel 20i web hosting only after: wildcard subdomains confirmed unused, the old site's media no longer needed (everything is archived in `source/` locally), and 30 days of clean coverage.

## Rollback (any time, 5 minutes)
Put the StackDNS records back (`@` A/AAAA and `www` A → 185.151.30.202). The old site is still running at 20i until hosting is cancelled.
