import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toTone, toneClass } from "@/lib/tones";
import { Section, Container, SectionHeader } from "@/components/ui/section";
import { Img } from "./Img";
import { VideoFacade } from "./VideoFacade";
import { EmbedPlaceholder } from "./EmbedPlaceholder";

/*
  Layout blocks (docs/design-system.md §Blocks). Component names and props are the content contract from Phase 2 and
  do not change; the markup and styling are the design system's. Every colour prop resolves through lib/tones.ts.
*/

const kidsOf = (children: ReactNode) => (Array.isArray(children) ? children : [children]).filter(Boolean);
const typeOf = (k: unknown) => (typeof k === "object" && k !== null ? (k as { type?: unknown }).type : undefined);

// ---------- ListBlock: heading + horizontal row of icon statements ----------
export function ListBlock({ heading, align, children }: { heading?: string; align?: "center" | "right"; children: ReactNode }) {
  return (
    <Section tight>
      <SectionHeader heading={heading} align={align} />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
    </Section>
  );
}

/** Icon + content row, shared by ListBlock (`ListItem`) and IconGrid (`IconItem`). Icons are decorative. */
export function IconRow({ icon, children }: { icon?: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-4">
      {icon && <span className="mt-0.5 grid size-12 shrink-0 place-items-center rounded-full bg-surface-subtle"><Img src={icon} alt="" width={28} height={28} className="size-7 object-contain" /></span>}
      <div className="prose min-w-0 grow [&>h3]:text-h4 [&>p]:text-small [&>p]:text-ink-muted [&_strong]:text-ink">{children}</div>
    </li>
  );
}
export { IconRow as ListItem, IconRow as IconItem };

// ---------- PanelSection: 2–3 tinted panels with a title each, optional footer line ----------
export function PanelSection({ children }: { children: ReactNode }) {
  const kids = kidsOf(children);
  const footer = kids.find((k) => typeOf(k) === PanelFooter);
  const panels = kids.filter((k) => k !== footer);
  return (
    <Section tight>
      <div className={cn("grid gap-6", panels.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>{panels}</div>
      {footer}
    </Section>
  );
}
export function Panel({ colour, title, children }: { colour?: string; title?: string; children: ReactNode }) {
  const tone = toTone(colour || "cream");
  return (
    <div className={cn("flex flex-col rounded-card p-(--card-padding)", toneClass[tone])}>
      {title && <h3 className="mb-4" dangerouslySetInnerHTML={{ __html: title }} />}
      <div className="prose grow [&>ul]:space-y-2 [&_li]:text-small">{children}</div>
    </div>
  );
}
export function PanelFooter({ children }: { children: ReactNode }) {
  return <footer className="prose mt-block text-center [&>h2]:flex [&>h2]:flex-wrap [&>h2]:items-center [&>h2]:justify-center [&>h2]:gap-4 [&>h2]:text-h3">{children}</footer>;
}

// ---------- PopoutBlock: feature panel, copy one side and artwork the other ----------
export function PopoutBlock({ colour, image, imageAlt = "", imagePosition, children }: { colour?: string; image?: string; imageAlt?: string; imagePosition?: "left" | "right"; children: ReactNode }) {
  const tone = toTone(colour);
  const art = image ? <div className={cn("mx-auto w-full max-w-[460px]", imagePosition === "left" ? "lg:order-first" : "")}><Img src={image} alt={imageAlt} sizes="(max-width: 1024px) 80vw, 460px" className="h-auto w-full rounded-media object-contain" /></div> : null;
  return (
    <Section tight tone={tone} panelClassName={cn(!image && "max-w-none")}>
      <div className={cn("grid items-center gap-block", image && "lg:grid-cols-2")}>
        <div className="prose max-w-measure">{children}</div>
        {art}
      </div>
    </Section>
  );
}

// ---------- VideoSection: brand panel + video ----------
export function VideoSection({ video, children }: { video: string; children: ReactNode }) {
  return (
    <Section tight>
      <div className="grid overflow-hidden rounded-panel lg:grid-cols-2">
        <div className={cn("p-(--panel-padding)", toneClass.brand)}><div className="prose max-w-measure [&>p]:text-ink-inverse">{children}</div></div>
        <div className="min-h-[260px] bg-surface-inverse"><VideoFacade src={video} square /></div>
      </div>
    </Section>
  );
}

// ---------- ContentRow: free two-column copy / media row ----------
export function ContentRow({ colour, centred, children }: { colour?: string; centred?: boolean; children: ReactNode }) {
  const kids = kidsOf(children);
  const cols = kids.filter((k) => typeOf(k) === Col || typeOf(k) === ColImage);
  const header = kids.filter((k) => !cols.includes(k));
  const tone = toTone(colour);
  const hasImage = cols.some((k) => typeOf(k) === ColImage);
  return (
    <Section tight tone={tone}>
      {header.length > 0 && <div className="prose mx-auto mb-block max-w-measure text-center">{header}</div>}
      <div className={cn("grid gap-block", cols.length > 1 && (hasImage ? "items-center lg:grid-cols-2" : "md:grid-cols-2"), centred && "items-center")}>{cols}</div>
    </Section>
  );
}
export function Col({ variant, children }: { variant?: "icon"; children: ReactNode }) {
  return <div className={cn("prose min-w-0", variant === "icon" && "col-icons")}>{children}</div>;
}
export function ColImage({ src, alt = "" }: { src: string; alt?: string }) {
  return <div className="mx-auto w-full max-w-[520px]"><Img src={src} alt={alt} sizes="(max-width: 1024px) 90vw, 520px" className="h-auto w-full rounded-media object-contain" /></div>;
}
export function IconList({ children }: { children: ReactNode }) {
  return <ul className="not-prose my-6 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-5">{children}</ul>;
}
export function IconListItem({ icon, children }: { icon?: string; children: ReactNode }) {
  return (
    <li className="flex flex-col items-center gap-2 text-center text-small text-ink-muted">
      {icon && <span className="grid size-14 place-items-center rounded-full bg-surface-subtle"><Img src={icon} alt="" width={32} height={32} className="size-8 object-contain" /></span>}
      <span className="max-w-[12ch] leading-snug">{children}</span>
    </li>
  );
}

// ---------- StatBlock: the big-number band ----------
export function StatBlock({ children }: { children: ReactNode }) {
  return (
    <Section tight>
      <dl className={cn("grid gap-8 rounded-panel p-(--panel-padding) text-center sm:grid-cols-3", toneClass.brand)}>{children}</dl>
    </Section>
  );
}
export function Stat({ figure, label }: { figure: string; label: string }) {
  return (
    <div>
      <dd className="font-display text-h1 leading-none">{figure}</dd>
      <dt className="mt-2 font-display text-small text-ink-inverse">{label}</dt>
    </div>
  );
}

// ---------- IconGrid: feature grid (with or without heading) ----------
export function IconGrid({ colour, heading, align, columns, children, variant }: { colour?: string; heading?: string; align?: "center" | "right"; columns?: string | number; children: ReactNode; variant?: "values" }) {
  const n = Number(columns) || 0;
  const tone = heading || variant === "values" ? toTone(colour || "lilac") : toTone(colour || "cream");
  const gridCols = n >= 5 ? "sm:grid-cols-2 lg:grid-cols-3" : n === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2";
  return (
    <Section tight tone={tone}>
      <SectionHeader heading={heading} align={align} />
      <ul className={cn("grid gap-x-8 gap-y-8", gridCols)}>{children}</ul>
    </Section>
  );
}

// ---------- ColourPanels: stacked image + tinted copy tiles (complaints, member helper, home pair) ----------
export function ColourPanels({ children }: { children: ReactNode }) {
  return <Section tight><ul className="grid gap-6 md:grid-cols-2">{children}</ul></Section>;
}
export function ColourPanel({ colour, image, imageAlt = "", children }: { colour?: string; image?: string; imageAlt?: string; children: ReactNode }) {
  const tone = toTone(colour || "lilac");
  return (
    <li className="flex flex-col overflow-hidden rounded-panel bg-surface shadow-card">
      {image && <div className="aspect-[16/10] w-full overflow-hidden bg-surface-subtle"><Img src={image} alt={imageAlt} sizes="(max-width: 768px) 100vw, 580px" className="size-full object-cover" /></div>}
      <div className={cn("prose grow p-(--panel-padding) [&>h2]:text-h3", toneClass[tone])}>{children}</div>
    </li>
  );
}

// ---------- InfoBlock: heading + intro + year/step panels ----------
export function InfoBlock({ heading, align, children }: { heading?: string; align?: "center" | "right"; children: ReactNode }) {
  const kids = kidsOf(children);
  const panels = kids.filter((k) => typeOf(k) === InfoPanel);
  const intro = kids.filter((k) => !panels.includes(k));
  return (
    <Section tight>
      <SectionHeader heading={heading} align={align}>{intro.length > 0 && <div className="prose mt-stack">{intro}</div>}</SectionHeader>
      <div className={cn("grid gap-6", panels.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>{panels}</div>
    </Section>
  );
}
export function InfoPanel({ year, children }: { year?: string; children: ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-surface p-(--card-padding) shadow-card">
      {year && <p className="mb-3 font-display text-h2 text-brand-strong">{year}</p>}
      <div className="prose [&>p]:text-small">{children}</div>
    </div>
  );
}

// ---------- PhotoBand: full-width photo with the copy on a solid panel ----------
export function PhotoBand({ image, imageAlt = "", colour = "yellow", children }: { image: string; imageAlt?: string; colour?: string; children: ReactNode }) {
  const tone = toTone(colour);
  return (
    <Section tight>
      <div className="relative grid min-h-[480px] items-end overflow-hidden rounded-panel bg-surface-inverse">
        <Img src={image} alt={imageAlt} sizes="100vw" className="absolute inset-0 size-full object-cover" />
        <div className={cn("relative m-4 max-w-[560px] rounded-card p-(--panel-padding) sm:m-8", toneClass[tone])}><div className="prose">{children}</div></div>
      </div>
    </Section>
  );
}

// ---------- Embed / tools ----------
export function Embed({ src, title, height }: { src: string; title?: string; height?: number }) {
  if (/youtube\.com|youtu\.be/.test(src)) return <div className="my-6 overflow-hidden rounded-media"><VideoFacade src={src} title={title} /></div>;
  return <EmbedPlaceholder src={src} title={title} height={height} />;
}

/** Plain wrapper for pages that need a bare section (styleguide, not-found). */
export { Section, Container, SectionHeader, Link };
