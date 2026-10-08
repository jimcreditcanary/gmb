# Design direction: "A union for your money" (Monzo model)

2026-10-08. Passes on top of the token system (`docs/design-system.md`), using the frontend-design method: plan, review against the generic default, build, critique. Brief: "overhaul it and make it shit hot"; then, on seeing the restrained version, "it lacks colour and feels really boring, what if we were to model it on monzo.com". Copy verbatim, URLs and IA fixed, logo orange kept.

## Revision: the Monzo model

What monzo.com actually does (checked 2026-10-08): a white page; colour arrives as big rounded blocks inside the page margins (coral, navy, green cards with photography and phone screens), not as full-bleed stripes; pill buttons, dark primary; large friendly type; product rows with photographs and a pill "Learn more". Translated to GMBCU with its own colours:

- The hero is one big orange block, navy display type (4.6:1), the family photo in the corner, the two tiles as pill doorways (navy, white).
- Every section that carries colour is a 32px-radius block: product cards cycle lilac, light blue, yellow, green; product details are three colour cards; the representative example and the stat band are colour cards; the video sits in a navy card; home doorways are orange then lilac.
- Buttons are pills again: orange primary, navy `dark` on orange blocks, white `inverse` on navy and orange.
- The restrained pass's rules-not-boxes layout is kept only for white sections (benefits row, values grid, editorial rows).


## Subject

GMB Credit Union is not a fintech. It is a trade-union credit union: owned by the 600,000 GMB members it serves, running since 1999, lending to working families at fair rates and turning surpluses back into better rates. The vernacular is union: big, flat, confident, plain-dealing, warm. The logo already says it, a heavy stacked wordmark in one loud orange. The site should look like that logo, not like a neobank.

## Palette (five colours, no more)

| Name | Hex | Job |
|---|---|---|
| Orange | `#FF4800` | The loud one. Large type, the hero slab, the stat band, the stroke under a headline word. Never small text. |
| Orange, action | `#CC4512` | Buttons and links (AA on white). The same hue, dialled down only where the law needs it. |
| Navy | `#102C45` | Ink, and the dark surface for the one strong block per page. |
| Lilac | `#DECEF9` | The single tint. Member-facing panels: representative examples, savings doorways, product details. |
| White / Grey | `#FFFFFF` / `#F3F5F7` | Page and quiet sections. |

Gone: the green, light-blue and yellow page tints. Four pastels rotating by page family read as a template; one tint reads as a decision. Family is told by words ("Loans", "Savings") not by wallpaper.

## Type

Menca Bold is the voice, used large: home display 48–96px at 0.95 leading, page H1 40–64px, section H2 32–48px, all with -0.03em tracking. Menca Medium 17px / 1.6 for text, 65 characters a line. Two roles only. The brand's orange stroke under a word stays, because it is the brand's own device in the brand's own copy, and it is used only where the copy marks it.

## Layout

Left-aligned throughout. A 12-column grid; copy sits in 5 to 7 columns, never centred blocks of text. Sections are separated by whitespace and type scale, not by tinted panels. Colour is spent once per page.

```
HOME HERO                                   PRODUCT HERO
┌──────────────────────┬─────────────────┐  ┌──────────────────────────────┬──────────┐
│ Your money,          │ ████████████████│  │ Loans                        │          │
│ your future,         │ ███  photo   ███│  │ Member Loan                  │  artwork │
│ your Credit Union.   │ ███  cutout  ███│  │ intro, two lines             │          │
│ intro, 20 words      │ ███ on orange███│  │ [Apply now]                  │          │
│ [Open a Savings Acc.]│ ████████████████│  └──────────────────────────────┴──────────┘
│ [Apply for a Loan   ]│                 │
└──────────────────────┴─────────────────┘  PRODUCT DETAILS (the page's one strong block)
                                            ┌──────────────────────────────────────────┐
HUB: COMPARISON, NOT CARDS                  │ navy ▸ Your Member loan │ Eligible if │ T&Cs │
 Member Loan   £2,501–£20,000  6.2–26.8%    └──────────────────────────────────────────┘
 ───────────────────────────────────────
 Family Loan   £200–£1,200     34.5%        STATS (about): orange band, numerals at display size
```

The memorable thing on each page: home, the orange slab with the family photo breaking out of it; hubs, the product comparison you can scan across; product pages, the navy details block; about, the orange stat band; blog, the lead photograph.

## Motion

One orchestrated moment: the home hero loads with the headline settling and the slab sliding in, 600ms, once. Everything else moves only in response to the person: menu, accordion, button press. `prefers-reduced-motion` turns it all off.

## Review against the default

What I would have built for "any credit union": white page, blue-ish accent, rounded cards with soft shadows, pill buttons, pastel section stripes, an eyebrow label in caps above every heading, a hero of headline + two buttons + illustration. The first pass had most of that. Changed here: palette cut to five and the tints removed; cards replaced with rules and grids wherever the content is not a collection; buttons squared to 10px (union, not app store); the caps eyebrow becomes a sentence-case word; the hero gets the one bold device; motion reduced to a single moment.

## Not changed, and why

Copy, including CTA wording ("Learn more >", "Apply Now" variants): verbatim rule. Photography: the site's own images only; no stock added. Illustration set: kept, it is the brand's.
