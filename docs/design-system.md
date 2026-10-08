# GMBCU design system

Status: v1, 2026-10-07. Brief from Jim Fell: design overhaul, copy intact, information architecture and the logo oranges kept, built as a consistent design system first so pages can be rebuilt on it (product pages next, from research data).

**Design read:** overhaul redesign of a regulated credit-union site (FCA/PRA) for GMB trade-union members, mostly on phones. Trust-first, calm-fintech language on the existing brand (Menca type, logo orange, navy), implemented as a three-layer token system with Tailwind v4 utilities and our own components. Dials: `DESIGN_VARIANCE 5 · MOTION_INTENSITY 3 · VISUAL_DENSITY 4`. No dark mode (brand tints and illustrations were not designed for it).

Live reference: `/styleguide/` (noindex) renders every token and component below.

## Where things live

| Layer | File | Notes |
|---|---|---|
| Tokens (source of truth) | `design/tokens.json` | W3C format, three layers. `pnpm tokens` regenerates the CSS. |
| Tokens (CSS) | `app/styles/tokens.css` | Generated. `--primitive-*`, semantic `--color-* --typography-* --spacing-* --radius-* --motion-*`, component `--button-* --input-* --card-* --panel-* --nav-* --footer-* --hero-*`. Do not edit. |
| Utility mapping + base | `app/globals.css` | `@theme inline reference` maps semantic tokens to Tailwind utilities; base typography; `.prose`, `.on-tint`, `.on-inverse`. |
| Primitives | `components/ui/button.tsx`, `components/ui/section.tsx` | `Button`, `Section`, `Container`, `SectionHeader`. |
| Tones | `lib/tones.ts` | Legacy `colour="lilac"` props map to tone tokens here. |
| Blocks | `components/blocks/*` | Same names and props as the content contract (Phase 2); new markup and styling. |
| Site chrome | `components/site/*` | `Header` + `Nav`, `Footer` + `NewsletterForm`, `Consent`. |
| Templates | `components/templates/*` | `MdxPage`/`PostPage`, `ArchivePage`, `LandingPage`. |

The ported WordPress CSS (`theme.css`, `megamenu.css`) and the purge step are gone; the old files are kept under `audit/legacy/theme-css/` for reference only.

## Colour

| Token | Value | Role |
|---|---|---|
| `--color-brand` | `#FF4800` (logo) | Decorative only: `<u>` marks, icons, big display accents. 3.1:1 on white, so never small text. |
| `--color-brand-strong` | `#CC4512` | Everything you click: buttons, links, small orange text. 4.7:1 on white (AA). Hue-matched to the logo. |
| `--color-brand-hover` | `#A8380E` | Hover / active. |
| `--color-ink` | `#102C45` | Headings and body. |
| `--color-ink-muted` | neutral 700 `#3A4550` | Secondary copy, intros. Neutral 700 so it passes AA on every tint (5.7:1 on green). |
| `--color-surface` / `-subtle` / `-muted` | white / `#F7F8FA` / `#EFF1F4` | Page, quiet sections, icon discs. |
| `--color-surface-inverse` | navy 700 | Footer, deep panels. |
| `--color-tone-loans` / `-savings` / `-about` / `-resources` | green / light blue / lilac / yellow | The four brand tints, as section tones. |

Rules:
1. One accent. Orange is for actions and marks. Nothing else is orange.
2. **Tones by family.** Loans pages use `loans`; savings pages `savings`; about, contact and legal `about`; resources and the blog `resources`. A page uses its family tone in the hero and in panels, plus white and `subtle`. Never more than two tones on a page.
3. A tone is a **rounded panel inside the container**, never a full-bleed stripe (heroes excepted).
4. Inverse tones (`deep`, `inverse`, `brand`) take `.on-inverse`, which switches links and marks to white. Tinted tones take `.on-tint`: links go navy with an orange underline, because orange text fails AA on the tints (2.8:1 on green).

## Type

Menca Bold for headings and buttons, Menca Medium for body (self-hosted, `app/fonts.ts`). Root font size is the browser default (16px); the old 62.5% hack is gone.

| Token | Size | Use |
|---|---|---|
| `--typography-display` | 40–56px fluid | Home hero H1 |
| `--typography-h1` | 36–48px fluid | Page H1 |
| `--typography-h2` | 28–36px fluid | Section title |
| `--typography-h3` | 22px | Card / panel title |
| `--typography-h4` | 18px | Minor heading, nav, labels |
| `--typography-lead` | 20px | Hero intro, section intro |
| `--typography-body` | 17px | Body |
| `--typography-small` | 15px | Card copy, lists, captions |
| `--typography-caption` | 13px | Regulatory line, eyebrow |

Headings `line-height 1.1`, body `1.6`, measure `65ch`. `.h1–.h4` classes exist for the two content files that need a heading to look like another level.

## Space, radius, shadow, motion

- Spacing: 4px base. `--spacing-section` 48–96px fluid between sections; `--spacing-block` 32px between blocks; `--spacing-stack` 16px heading → paragraph → button; `--spacing-page-inline` 16–40px page gutters. Content width 1200px.
- Radius: `control` pill (buttons, pills, pagination), `field` 12px (inputs), `card` 16px (cards, tiles, FAQ items), `panel` 24px (tinted panels, hero art, photo bands), `media` 16px (images, video).
- Shadow: navy-tinted. `card` at rest, `card-hover` on hover, `float` for menus and the banner. No pure-black shadows.
- Motion: 200ms standard, 400ms slow, `cubic-bezier(0.2, 0.8, 0.2, 1)`. Accordion height, menu fly-outs, hover lifts, button press. No scroll-driven reveals: they hide below-the-fold text from Lighthouse and axe (both read opacity) and from full-page screenshots. Everything collapses under `prefers-reduced-motion`.

## Components

**Button** (`components/ui/button.tsx`): `variant` primary (brand-strong), secondary (ink outline), ghost (text link with arrow), inverse (white on dark panels); `size` sm 40 / md 48 / lg 56; `block`. Pill. Press scales to 0.98. Focus ring 3px navy. In MDX, `Button` is `LinkButton`, which adds the hidden target description to generic labels.

**Section / Container / SectionHeader** (`components/ui/section.tsx`): every block is a `Section`; `tone` renders the content as a rounded panel; `tight` uses the smaller section rhythm. `SectionHeader` is the only section-title pattern (h2 + optional lead intro).

**Hero** (`PageHeader`): split layout, copy left in the measure, artwork right; tone from the page family; eyebrow pill for the product family (`label`); home tiles as white cards with icon and arrow. Trustpilot renders as a slim band under the hero.

**Blocks** (`components/blocks/Blocks.tsx`), same names as the content: `ContentRow/Col/ColImage/IconList/IconListItem`, `ListBlock/ListItem`, `PanelSection/Panel/PanelFooter`, `PopoutBlock`, `VideoSection`, `StatBlock/Stat`, `IconGrid/IconItem`, `ColourPanels/ColourPanel`, `InfoBlock/InfoPanel`, `PhotoBand`, `Embed`. Product grid `BoxSlider/Box` is a 3/2/1 grid (the carousel is retired; the prop name is kept for the content files). `FAQSection/FAQGroup/FAQ` is a tinted accordion with a jump-to select. `PostsOverview/PostList/PostCard/Pagination` for the blog. `ContactForm` with labels above, inline errors, in-place success.

**Navigation**: sticky white bar, 72px, logo left, links with hover/focus fly-outs, "Member Hub" as the one button. Phone: hamburger to a full-height panel with expandable groups.

**Footer**: navy, four columns (logo + socials, two menus, newsletter + FSCS), regulatory statement in caption size at full legibility.

## Content contract (unchanged)

Content files are untouched by this overhaul: same blocks, same props, same copy. Colour props still use the old names and resolve through `lib/tones.ts`. New pages follow `docs/templates.md` for the outline and this document for the look.

## Checks

`pnpm typecheck · lint · validate · build`; `/styleguide/` for a visual check of tokens; Lighthouse budgets unchanged (≥95 a11y, best-practice, SEO; performance desktop hard, mobile warning).
