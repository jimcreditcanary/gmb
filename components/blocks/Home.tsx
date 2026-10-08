import type { ReactNode } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { getPage } from "@/lib/content";
import { Mdx } from "@/lib/mdx";
import { Container, Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Img } from "./Img";
import { Trustpilot } from "./Trustpilot";

/*
  Home page blocks (docs/design-direction.md §Home, modelled on monzo.com's structure, 2026-10-08).
  Copy in these blocks is either the home page's own MDX children or pulled at render time from the page it already lives on
  (hub product cards, About stats, General FAQs), so nothing is duplicated or reworded.
*/

type Tile = { label: string; href: string; icon?: string };

/** Photo hero: full-bleed photograph in a rounded block, white copy on a navy scrim, pill actions, FSCS badge; Trustpilot in a thin band below. */
export function HomeHero({ image, imageAlt = "", buttons, trustpilot, children }: { image: string; imageAlt?: string; buttons?: Tile[]; trustpilot?: boolean; children: ReactNode }) {
  return (
    <>
      <section className="hero hero-home pt-4 pb-4 sm:pt-6">
        <Container>
          <div className="relative flex min-h-[600px] items-end overflow-hidden rounded-panel bg-surface-inverse lg:min-h-[680px] lg:items-center">
            <Img src={image} alt={imageAlt} priority sizes="(max-width: 1200px) 100vw, 1200px" className="absolute inset-0 size-full object-cover object-[72%_center]" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/60 to-navy-900/10 lg:bg-gradient-to-r lg:from-navy-900/85 lg:via-navy-900/50 lg:to-transparent" aria-hidden="true" />
            <div className="on-inverse relative w-full max-w-[640px] px-6 pb-10 pt-40 text-ink-inverse sm:px-10 lg:px-16 lg:py-20">
              <div className="prose [&>h1]:text-h1 [&>h1]:text-ink-inverse [&>p]:mt-6 [&>p]:max-w-[44ch] [&>p]:text-lead [&>p]:text-ink-inverse/90">{children}</div>
              {buttons && buttons.length > 0 && (
                <ul className="mt-8 flex flex-wrap gap-3">
                  {buttons.map((b, i) => (
                    <li key={b.href + b.label}>
                      <Link href={b.href} className={cn("group inline-flex h-14 items-center gap-3 rounded-control px-7 font-ui text-lg font-semibold no-underline transition-colors duration-(--motion-duration)", i === 0 ? "bg-surface text-ink hover:bg-brand-strong hover:text-ink-inverse" : "border-2 border-surface/80 text-ink-inverse hover:bg-surface hover:text-ink")}>
                        {b.label}<FontAwesomeIcon icon={faArrowRight} className="size-4 transition-transform duration-(--motion-duration) group-hover:translate-x-1" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/theme/images/fscs.svg" alt="FSCS Protected" width={80} height={72} className="absolute right-6 top-6 h-16 w-auto sm:right-10 sm:top-10 lg:h-20" />
          </div>
        </Container>
      </section>
      {trustpilot && <div className="trust-band py-2"><Container><div className="flex max-w-[480px] items-center"><Trustpilot /></div></Container></div>}
    </>
  );
}

/** Heading + intro + one pill on the left, then a row of cards: the children are the copy, `ProductCards` (or any grid) renders full width below. */
export function FeatureSection({ children }: { children: ReactNode }) {
  const kids = (Array.isArray(children) ? children : [children]).filter(Boolean);
  const grids = kids.filter((k) => typeof k === "object" && k !== null && (k as { type?: unknown }).type === ProductCards);
  const copy = kids.filter((k) => !grids.includes(k));
  return (
    <Section>
      <div className="prose mb-block max-w-measure [&>h2]:max-w-[16ch] [&>p]:text-lead [&>p]:text-ink-muted">{copy}</div>
      {grids}
    </Section>
  );
}

/** The first N product cards from a hub page (`/loans/` or `/savings/`), rendered through the same `Box` block the hub uses. Copy lives once, on the hub. */
export function ProductCards({ source, count = 4 }: { source: string; count?: number }) {
  const page = getPage(source); if (!page) return null;
  const boxes = [...page.body.matchAll(/<Box\b[^>]*>[\s\S]*?<\/Box>/g)].map((m) => m[0]).slice(0, count);
  if (!boxes.length) return null;
  return <ul className="card-cycle grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><Mdx source={boxes.join("\n\n")} /></ul>;
}

/** The About page's stat band, re-rendered here from its source. */
export function StatBand({ source = "/about-us/" }: { source?: string }) {
  const page = getPage(source); if (!page) return null;
  const m = page.body.match(/<StatBlock>[\s\S]*?<\/StatBlock>/); if (!m) return null;
  return <Mdx source={m[0]} />;
}

/** The first N questions of one FAQ group, with a pill through to the full page. */
export function FaqTeaser({ source = "/faqs/", group, count = 4, href, label }: { source?: string; group: string; count?: number; href: string; label: string }) {
  const page = getPage(source); if (!page) return null;
  const re = new RegExp(`<FAQGroup\\s+heading="${group.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"([^>]*)>([\\s\\S]*?)<\\/FAQGroup>`);
  const m = page.body.match(re); if (!m) return null;
  const faqs = [...m[2].matchAll(/<FAQ\b[^>]*>[\s\S]*?<\/FAQ>/g)].map((x) => x[0]).slice(0, count);
  return (
    <Section tight>
      <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:items-start">
        <div className="lg:sticky lg:top-28"><Mdx source={`## ${group}`} /><p className="mt-6"><Button href={href}>{label}</Button></p></div>
        <div className="[&>div]:py-0"><Mdx source={`<FAQGroup heading="${group}" hideHeading={true}${m[1]}>\n${faqs.join("\n")}\n</FAQGroup>`} /></div>
      </div>
    </Section>
  );
}
