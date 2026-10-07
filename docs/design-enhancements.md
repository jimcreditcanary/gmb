# Design enhancements

Date: 2026-10-07. Method: `design-taste-frontend` audit of the current build (Phase 5 + standardisation). **Status: Jim approved all tiers ("do all of it"); implemented on branch `design-enhancements`.** Exceptions: T3.12 badges render once the two official badge files are added to `public/media`; T3.13 was measured instead of rewritten (see below); T3.14 no action. Register of every change: `docs/deviations.md` rows 30–41.

## Design read

Reading this as: **redesign, preserve mode** of a regulated consumer-finance site (FCA/PRA credit union) for GMB trade-union members, many on modest incomes, on phones. Trust-first language, existing brand (Menca type, pastel section tints, 20px radius, orange CTA), leaning toward the current component system with better rhythm, type and states rather than a new aesthetic.

Dials read from the live site: `DESIGN_VARIANCE 4 · MOTION_INTENSITY 2 · VISUAL_DENSITY 4`. Preserve mode keeps variance and density, motion goes to 3. No dark mode: the brand's pastel hero cards and illustrations were not designed for it and the audience gains nothing from it.

Hard constraints carried over from the lift: copy verbatim, URLs fixed, regulatory wording locked, nav labels and form field names unchanged. Anything below that touches a visible string is marked **copy** and cannot ship without approval of the new wording.

## What already passes

Asymmetric split hero with a real photo; nav on one line at 64px; one accent colour (orange, AA variant on controls); one radius family on panels; Menca sans throughout, no serif; no AI-purple, no glows; labels above inputs; hero tile buttons are a distinctive, on-brand pattern worth keeping.

## Tier 1: quick wins, no copy change, low risk

| # | Change | Why | Visible? | Effort |
|---|---|---|---|---|
| 1 | **Body type measure and size.** Cap paragraphs at 65ch; body 16px → 17px at ≥1200 with line-height 1.6. Content rows today run 80–90 characters per line on desktop. | Readability for an audience reading on phones and older screens. | Subtle | S |
| 2 | **Interactive states.** `:active` press (scale 0.98), visible `:focus-visible` ring in navy on buttons, links, inputs and the FAQ toggles; inputs to 10px radius to match buttons (documented rule: panels 20 / buttons 10 / inputs 10). | WCAG 2.4.7, tactile feedback, shape consistency. | Subtle | S |
| 3 | **Section tint discipline.** Product pages currently cycle five tints (green hero, light-blue panels, lilac popout, white, orange video). Rule: hero tint by family (loans green, savings light blue), at most two tints plus white per page, orange reserved for CTAs and the video band. | Colour consistency lock; pages stop feeling like a patchwork. | Yes, calmer | S |
| 4 | **Footer regulatory statement contrast.** 13px at 85% opacity on navy → 14px, full white. | It is the regulatory line; it should be the easiest text to read, not the hardest. | Subtle | XS |
| 5 | **Motivated motion (level 3).** One-time fade-up on section entry (opacity + 24px, 400ms, `prefers-reduced-motion` off switch), FAQ accordion height transition, hero image fade on load. No loops, no parallax. | Replaces the removed WOW.js with something that costs no CLS; hierarchy on scroll. | Subtle | S |
| 6 | **Trustpilot strip out of the hero.** Move the "Our customers say Excellent" strip to a slim band directly under the hero (home, hubs, products). | Trust strip belongs under the hero; the hero gets back to headline, intro, CTA. | Yes, small | S |

## Tier 2: layout changes, no copy change, needs a look at a preview

| # | Change | Why | Visible? | Effort |
|---|---|---|---|---|
| 7 | **Home: break the zigzag.** Five consecutive image/text splits today. Proposed: "Affordable, ethical loans" and "Secure savings accounts" become a side-by-side pair of product tiles; "Own your financial future" becomes a full-width photo band with the copy overlaid on a solid panel; the app section stays a split. Same copy, same order. | Zigzag cap (max two in a row); the page gets a rhythm. | Yes | M |
| 8 | **Loans / Savings hubs: grid instead of carousel.** Seven loans in a 4-up scroll-snap slider hides three products on desktop. Proposed: responsive grid (3 / 2 / 1), all products visible, the slider arrows go. | Comparison is the job of this page; carousels hide inventory and hurt scanning and SEO. | Yes | M |
| 9 | **Blog home: featured post.** First card becomes a 2:1 feature (image left, title and excerpt right); remaining posts in a 3-up grid; drop the hairline card borders, let image + type carry it; the whole card is the link (the "Read More >" text stays). | Cards only where hierarchy exists; a lead story gives the page a front. | Yes | M |
| 10 | **Form states.** Inline field errors under the input, success panel in place, disabled/sending state on the button, helper text slot. | Full state cycle; today only a generic alert. | On error only | S + **copy** (error strings) |

## Tier 3: copy or asset decisions, Jim's call

| # | Change | Why | Note |
|---|---|---|---|
| 11 | **CTA label consolidation.** "Learn more", "Learn more >", "Learn more today", "Browse loans", "Browse our loans", "Apply Now", "Apply now" all live on the same pages. One label per intent (e.g. "Apply now", "Learn more", "Browse loans"). | Duplicate-intent rule; also fixes the ASCII ">" in button text. | **copy** |
| 12 | **App store badges.** Replace the two orange "Download from Apple Store / Google Play" buttons with the official App Store and Google Play badges. | Recognised pattern; stronger trust than text buttons; brand-mandated assets. | **copy** (button text goes) |
| 13 | **Hero intro length.** Several product intros run 40+ words before the Apply button. The skill's hero rule is 20 words; a one-sentence intro with the rest moved to the first section would tighten every product page. | Hero fits the viewport on phones with the CTA visible. | **copy**, and some pages are locked |
| 14 | **Dashes in copy.** Ranges and asides use en-dashes ("£2,501 – £20,000", "– we're a community"). Left exactly as published. | Verbatim rule wins over the skill's dash ban. | no action |

## Recommendation

Do Tier 1 now (one afternoon, no sign-off beyond this document, all reversible). Build Tier 2 on a preview branch so you can see home, the loans hub and the blog side by side with today's version before deciding. Tier 3 waits for a copy decision from GMBCU.

What I would not do: dark mode, serif display type, glass panels, scroll hijacks, a new colour palette. The brand is right for its audience; the gaps are rhythm, states and discipline.
