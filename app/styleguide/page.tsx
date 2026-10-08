import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Section, Container, SectionHeader } from "@/components/ui/section";
import { toneClass, type Tone } from "@/lib/tones";
import Link from "next/link";
import { PageHeader } from "@/components/blocks/PageHeader";

export const metadata: Metadata = { title: { absolute: "Design system | GMBCU" }, robots: { index: false, follow: false } };

const swatches: { name: string; token: string; note: string }[] = [
  { name: "brand", token: "--color-brand", note: "logo orange: large type, the hero slab, the stat band, the stroke under a word" },
  { name: "brand-strong", token: "--color-brand-strong", note: "buttons and links (4.7:1 on white)" },
  { name: "ink", token: "--color-ink", note: "navy: text, and the one strong block per page" },
  { name: "lilac", token: "--color-lilac", note: "member panels, savings" },
  { name: "blue", token: "--color-blue", note: "savings, details" },
  { name: "green", token: "--color-green", note: "loans" },
  { name: "yellow", token: "--color-yellow", note: "resources, stats" },
  { name: "surface-subtle", token: "--color-surface-subtle", note: "quiet grey sections" },
  { name: "ink-muted", token: "--color-ink-muted", note: "secondary copy" },
];
const type: { label: string; cls: string; sample: string }[] = [
  { label: "display", cls: "text-display font-display", sample: "Your money, your future" },
  { label: "h1", cls: "text-h1 font-display", sample: "Member Loan" },
  { label: "h2", cls: "text-h2 font-display", sample: "Benefits for you" },
  { label: "h3", cls: "text-h3 font-display", sample: "You’re eligible to apply if you…" },
  { label: "h4", cls: "text-h4 font-display", sample: "Stress-free financial flexibility" },
  { label: "lead", cls: "text-lead", sample: "Secure a better future with GMB Credit Union." },
  { label: "body", cls: "text-body", sample: "We always put you first, as a member-owned credit union." },
  { label: "small", cls: "text-small", sample: "Loan repaid by direct debit monthly, four-weekly, or weekly" },
  { label: "caption", cls: "text-caption", sample: "Firm Reference Number 213550" },
];
const tones: Tone[] = ["surface", "subtle", "lilac", "blue", "green", "yellow", "inverse", "brand"];

/** /styleguide: the design system rendered from its own tokens and components. Noindex. */
export default function Styleguide() {
  return (
    <main id="main">
      <PageHeader colour="white" image="/media/gmbcu-homepage-header-image01.png" label="Design system">
        <h1>GMBCU design system</h1>
        <p>Tokens in <code>design/tokens.json</code>, mapped to utilities in <code>app/globals.css</code>. Everything on this page is rendered from them.</p>
      </PageHeader>

      <Section tight>
        <SectionHeader heading="Colour" intro="The brand's own colours as big blocks: orange and navy carry the loudest moments, the four tints carry the cards. Navy type on orange (4.6:1), the hue-matched AA orange is what you click." />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {swatches.map((s) => (
            <li key={s.name} className="overflow-hidden rounded-card border border-border">
              <div className="h-20" style={{ background: `var(${s.token})` }} />
              <div className="p-4"><p className="font-display text-small">{s.name}</p><p className="text-caption text-ink-muted">{s.note}</p><code className="text-caption text-ink-subtle">{s.token}</code></div>
            </li>
          ))}
        </ul>
      </Section>

      <Section tight>
        <SectionHeader heading="Type" intro="Menca Bold for every heading, Menca Medium for body. Sizes are fluid tokens; the measure is 65 characters." />
        <dl className="grid gap-5">
          {type.map((t) => <div key={t.label} className="grid gap-1 border-b border-border pb-5 sm:grid-cols-[8rem_1fr] sm:items-baseline"><dt className="text-caption text-ink-subtle">{t.label}</dt><dd className={t.cls}>{t.sample}</dd></div>)}
        </dl>
        <p className="mt-block text-body">Inline mark: <u>your Credit Union</u>. Link: <Link href="/loans/">affordable loans</Link>. Strong: <strong>5% bonus</strong>.</p>
      </Section>

      <Section tight>
        <SectionHeader heading="Buttons" intro="Primary, secondary, ghost, inverse, dark. Three sizes. Pills." />
        <div className="flex flex-wrap items-center gap-4">
          <Button href="#">Apply now</Button>
          <Button href="#" variant="secondary">Learn more</Button>
          <Button href="#" variant="ghost">Browse loans &gt;</Button>
          <Button href="#" size="sm" variant="dark">Member Hub</Button>
          <Button href="#" size="lg">Open a Savings Account</Button>
          <Button disabled>Sending…</Button>
        </div>
      </Section>

      <Section tight>
        <SectionHeader heading="Section tones" intro="White page, colour in big rounded blocks. Blocks alternate; the same colour never sits next to itself." />
        <ul className="grid gap-4 sm:grid-cols-3">
          {tones.map((t) => <li key={t} className={`rounded-card p-6 ${toneClass[t]}`}><p className="font-display text-h4">{t}</p><p className="text-small">Body copy with a <a href="#">link</a> and a <u>mark</u>.</p></li>)}
        </ul>
      </Section>

      <Section tight>
        <SectionHeader heading="Cards and fields" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-card border border-border bg-surface p-(--card-padding) shadow-card"><h3>Card</h3><p className="mt-2 text-small text-ink-muted">16px radius, 1px border, tinted shadow. Hover lifts the shadow one step.</p><p className="mt-4"><Button href="#" size="sm">Action</Button></p></div>
          <form className="grid gap-4 rounded-card bg-surface-subtle p-(--card-padding)">
            <div className="grid gap-1.5"><label htmlFor="sg-name" className="font-display text-small">Name *</label><input id="sg-name" className="h-12 rounded-field border border-border-strong bg-surface px-4" placeholder="Jane Member" /></div>
            <div className="grid gap-1.5"><label htmlFor="sg-email" className="font-display text-small">Email Address *</label><input id="sg-email" aria-invalid="true" aria-describedby="sg-email-err" className="h-12 rounded-field border border-error bg-surface px-4" defaultValue="jane@" /><span id="sg-email-err" className="text-small text-error">Please enter a valid email address.</span></div>
            <div><Button type="button">Send</Button></div>
          </form>
        </div>
      </Section>

      <Section tight>
        <SectionHeader heading="Spacing and radius" />
        <Container className="px-0">
          <ul className="grid gap-3 text-small sm:grid-cols-2">
            <li><code>--spacing-section</code> clamp(48px, 96px): between page sections</li>
            <li><code>--spacing-block</code> 32px: between blocks inside a section</li>
            <li><code>--spacing-stack</code> 16px: heading → paragraph → button</li>
            <li><code>--radius-control</code> pill · <code>--radius-field</code> 12px · <code>--radius-card</code> 24px · <code>--radius-panel</code> 32px</li>
          </ul>
        </Container>
      </Section>
    </main>
  );
}
