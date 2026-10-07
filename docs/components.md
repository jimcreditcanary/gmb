# Components

Four layers. Content authors and agents only ever write the **blocks** layer inside MDX, plus `Button`.

| Layer | Folder | Purpose |
|---|---|---|
| `ui` | `components/ui/` | Primitives with variants (shadcn convention, `class-variance-authority`). Today: `Button`. |
| `blocks` | `components/blocks/` | One component per theme section. Same DOM/class names the ported theme CSS targets. All are available in MDX without imports (`lib/mdx.tsx`). |
| `site` | `components/site/` | Header, Footer, MenuToggle, NewsletterForm, Consent. |
| `templates` | `components/templates/` | `MdxPage` (+ `PostPage`), `ArchivePage`, `LandingPage`, `JsonLd`, `UtmFields`. |

## Button (`components/ui/button.tsx`)

The only button on the site. It renders the theme's `.button` class, so migrating to it changed nothing visually.

```mdx
<Button href="/loans/">Browse loans</Button>
<Button href="https://gmb.cuapply.com/journey/1" target="_blank">Apply now</Button>
<Button href="/loans/member-loan/" variant="secondary">Learn more ></Button>
<Button href="/media/guide.pdf" target="_blank" size="sm">Read the guide</Button>
```

```tsx
<Button type="submit" disabled={sending}>{sending ? "Sending…" : "Send"}</Button>
<Button onClick={load} block>Load the tool</Button>
```

| Prop | Values | Notes |
|---|---|---|
| `variant` | `primary` (default, orange) · `secondary` (white, orange text; the theme's `button-alt`) | |
| `size` | `sm` · `md` (default, the theme size: 45px / 16px) · `lg` | `sm` 36px/14px, `lg` 56px/18px (`app/globals.css`) |
| `block` | boolean | full width, centred text |
| `href` | path or URL | internal path → `next/link`; anything else → `<a>` |
| `target` | `_blank` | `rel="noopener"` is added automatically for `_blank` and for every external host |
| `type` / `disabled` / `onClick` | | when there is no `href` the element is `<button>` (`type="button"` by default) |
| `className` | | merged after the variant classes |

Rules:
- Never write `<a className="button">`, `<A className="button">`, `<button className="button">` or `<input type="submit">` again. The importer (`tools/html2mdx.mjs`) emits `<Button>` for theme buttons.
- In MDX, `Button` is `LinkButton` (`lib/with-context.tsx`): the same component plus the visually hidden target description on generic labels ("Learn more", "Apply now"), as every other link gets. Client components import the plain `Button`.
- Adding a variant or size = one line in `buttonVariants` **and** the matching CSS block in `app/globals.css`. Do not style buttons inline.
- Hero icon tiles (`PageHeader buttons={[…]}`) are a different pattern (`ul.list-buttons`, icon + label + chevron) and stay inside `PageHeader`.
- Slider arrows (`BoxSlider`), the FAQ "Jump To" toggle and the video play overlay are icon controls with their own theme classes; they are not `Button`s.

## Shared building blocks inside `blocks`

- **`SectionHeader`** — `<header class="data-header">` + the section `h2` (`heading` prop, may contain `<u>`), optional `align`, optional children (intro). Used by `ListBlock`, `IconGrid`, `InfoBlock`, `BoxSlider`. Use it for any new block that has a heading.
- **`IconRow`** — icon + content list item (`li > .row > .column-image + .column-content`). Exported as both `ListItem` (in `ListBlock`) and `IconItem` (in `IconGrid`): same DOM, two names kept for the content files.
- **`Img`** — `next/image` with recorded dimensions (`lib/media-dims.json`), so no layout shift.
- **`PageHeader`** — every hero: `variant="home" | "page" | "title"`, `colour`, `label` (eyebrow), `trustpilot`, `image` / `lottie` + `poster`, `buttons` (tiles), `date` (posts). The `h1` and intro paragraph are children.
- **Title helpers** (`lib/content.ts`): `stripTitleSuffix(title)`, `displayTitle(fm)` (the H1), `cardTitle(fm)` (blog cards). No component should re-implement the ` | GMBCU` strip.

## Block catalogue (MDX)

| Block | Children / props | Headings it renders |
|---|---|---|
| `PageHeader` | h1 + p + `Button` children; `buttons` tiles | none (you write the h1) |
| `ContentRow colour centred` → `Col variant="icon"`, `ColImage`, `IconList/IconListItem` | markdown | none (you write the h2) |
| `ListBlock heading align` → `ListItem icon` | markdown | h2 |
| `IconGrid heading align colour columns variant="values"` → `IconItem icon` | markdown (h3 inside) | h2 |
| `PanelSection` → `Panel colour title`, `PanelFooter` | lists | h3 per panel |
| `PopoutBlock colour image imagePosition` | markdown | none (you write the h2) |
| `VideoSection video` | markdown | none |
| `StatBlock` → `Stat figure label` | | none |
| `ColourPanels` → `ColourPanel colour image` | markdown | none (you write the h2) |
| `InfoBlock heading align` → `InfoPanel year` | markdown | h2 |
| `BoxSlider heading intro align` → `Box image` | markdown (h3 + bullets + Buttons) | h2 |
| `FAQSection` → `FAQGroup heading colour` → `FAQ question` | markdown | h2 per group |
| `PostsOverview trustpilot count` | h2 + p children; cards generated | h3 cards |
| `RelatedPosts count exclude` | | h3 cards |
| `ContactForm formId fields submit` | h2/h3 children above the fields | none |
| `Embed src title height` / `MoneyHelperTool id href` | | none (placeholder + `Button`) |
| `A href className target` | inline | for classed or `target` links that are not buttons |

Open an existing page of the same template (`docs/templates.md`) and copy its structure.
