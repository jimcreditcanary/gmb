import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toTone, toneClass } from "@/lib/tones";
import { Section, Container, SectionHeader } from "@/components/ui/section";
import { Img } from "./Img";
import { VideoFacade } from "./VideoFacade";
import { EmbedPlaceholder } from "./EmbedPlaceholder";
import { imageDims } from "@/lib/media";

/*
  Layout blocks (docs/design-direction.md). Component names and props are the content contract and do not change.
  Rules: left-aligned; whitespace and type scale separate sections, not tinted boxes; colour is spent once per page
  (navy details block, orange stat band, lilac member panel); structure (rules, grids) encodes information, never decorates.
*/

/** A landscape photograph fills its frame; portrait files and all SVG/PNG artwork are cut-outs that stand on a stage. */
const isCoverPhoto = (src: string) => { if (!/\.(jpe?g|webp|avif)$/i.test(src)) return false; const d = imageDims(src); return !d || d.width >= d.height; };
/** Artwork on a stage: landscape photographs fill a rounded 4:3 frame; cut-outs stand bottom-aligned on a soft frame so the mixed set reads as one. */
function Art({ src, alt = "", onTint, sizes = "(max-width: 1024px) 90vw, 520px", ratio = "aspect-[4/3]" }: { src: string; alt?: string; onTint?: boolean; sizes?: string; ratio?: string }) {
  if (isCoverPhoto(src)) return <div className={cn("overflow-hidden rounded-media", ratio)}><Img src={src} alt={alt} sizes={sizes} className="size-full object-cover" /></div>;
  const d = imageDims(src); const portrait = !!d && d.height > d.width * 1.1;   // tall cut-outs (the app phone) get a square stage, not a letterboxed 4:3
  return <div className={cn("stage p-6 sm:p-8", portrait ? "aspect-square" : ratio, onTint ? "stage-white" : "stage-soft")}><Img src={src} alt={alt} sizes={sizes} className="size-full object-contain object-bottom" /></div>;
}
const kidsOf = (children: ReactNode) => (Array.isArray(children) ? children : [children]).filter(Boolean);
const typeOf = (k: unknown) => (typeof k === "object" && k !== null ? (k as { type?: unknown }).type : undefined);

// ---------- ListBlock: a row of plain statements with the orange tick ----------
export function ListBlock({ heading, align, children }: { heading?: string; align?: "center" | "right"; children: ReactNode }) {
  return (
    <Section tight>
      <SectionHeader heading={heading} align={align} />
      <ul className="rule-grid grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
    </Section>
  );
}

/** Icon + statement, shared by ListBlock (`ListItem`) and IconGrid (`IconItem`). */
export function IconRow({ icon, children }: { icon?: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-4">
      {icon && <span className="grid size-12 shrink-0 place-items-center rounded-full bg-surface-subtle"><Img src={icon} alt="" width={30} height={30} className="size-7 object-contain" /></span>}
      <div className="prose min-w-0 grow [&>h3]:text-h4 [&>p]:text-small [&>p]:text-ink-muted [&_strong]:text-ink [&_strong]:text-base">{children}</div>
    </li>
  );
}
export { IconRow as ListItem, IconRow as IconItem };

// ---------- PanelSection: the page's one strong block. Navy, three columns, white type ----------
export function PanelSection({ children }: { children: ReactNode }) {
  const kids = kidsOf(children);
  const footer = kids.find((k) => typeOf(k) === PanelFooter);
  const panels = kids.filter((k) => k !== footer);
  return (
    <Section tight>
      <ul className={cn("card-cycle grid gap-5", panels.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>{panels}</ul>
      {footer}
    </Section>
  );
}
export function Panel({ title, children }: { colour?: string; title?: string; children: ReactNode }) {
  return (
    <li className="flex">
      <div className="card-tone on-tint flex w-full flex-col rounded-card p-(--card-padding) text-ink sm:p-8">
        {title && <h3 className="mb-4" dangerouslySetInnerHTML={{ __html: title }} />}
        <div className="prose grow [&>ul]:space-y-2 [&_li]:text-small">{children}</div>
      </div>
    </li>
  );
}
export function PanelFooter({ children }: { children: ReactNode }) {
  return <footer className="prose mt-8 [&>h2]:flex [&>h2]:flex-wrap [&>h2]:items-center [&>h2]:gap-5 [&>h2]:text-h3">{children}</footer>;
}

// ---------- PopoutBlock: an editorial row. Copy left, artwork right. Tint / navy / orange only when the content asks for a box ----------
export function PopoutBlock({ colour, image, imageAlt = "", imagePosition, children }: { colour?: string; image?: string; imageAlt?: string; imagePosition?: "left" | "right"; children: ReactNode }) {
  const tone = toTone(colour);
  const boxed = tone !== "surface";
  const art = image ? <div className={cn("mx-auto w-full max-w-[460px] lg:max-w-none", imagePosition === "left" ? "lg:order-first" : "")}><Art src={image} alt={imageAlt} onTint={boxed} sizes="(max-width: 1024px) 80vw, 460px" /></div> : null;
  const inner = (
    <div className={cn("grid items-center gap-x-12 gap-y-8", image && "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]")}>
      <div className="prose max-w-measure [&>h2]:max-w-[22ch]">{children}</div>
      {art}
    </div>
  );
  if (boxed) return <Section tight tone={tone}>{inner}</Section>;
  return <Section tight><div className="border-t border-border pt-(--spacing-block)">{inner}</div></Section>;
}

// ---------- VideoSection: navy panel + video ----------
export function VideoSection({ video, children }: { video: string; children: ReactNode }) {
  return (
    <Section tight>
      <div className={cn("grid overflow-hidden rounded-panel lg:grid-cols-2", toneClass.inverse)}>
        <div className="p-(--panel-padding)"><div className="prose max-w-measure [&>p]:text-ink-inverse-muted">{children}</div></div>
        <div className="min-h-[300px]"><VideoFacade src={video} square /></div>
      </div>
    </Section>
  );
}

// ---------- ContentRow: editorial two-column row ----------
export function ContentRow({ colour, centred, children }: { colour?: string; centred?: boolean; children: ReactNode }) {
  const kids = kidsOf(children);
  const cols = kids.filter((k) => typeOf(k) === Col || typeOf(k) === ColImage);
  const header = kids.filter((k) => !cols.includes(k));
  const tone = toTone(colour);
  const boxed = tone !== "surface";
  const hasImage = cols.some((k) => typeOf(k) === ColImage);
  const body = (
    <>
      {header.length > 0 && <div className="prose mb-block [&>h2]:max-w-[22ch] [&>p]:max-w-measure">{header}</div>}
      <div className={cn("grid gap-x-12 gap-y-8", cols.length > 1 && (hasImage ? "items-center lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : "md:grid-cols-2"), centred && "items-center")}>{cols}</div>
    </>
  );
  return <Section tight tone={boxed ? tone : "surface"}>{boxed ? body : <div className="border-t border-border pt-(--spacing-block)">{body}</div>}</Section>;
}
export function Col({ variant, children }: { variant?: "icon"; children: ReactNode }) {
  return <div className={cn("prose min-w-0 [&>h2]:max-w-[22ch]", variant === "icon" && "col-icons")}>{children}</div>;
}
export function ColImage({ src, alt = "" }: { src: string; alt?: string }) {
  return <div className="mx-auto w-full max-w-[520px] lg:max-w-none"><Art src={src} alt={alt} sizes="(max-width: 1024px) 90vw, 560px" /></div>;
}
export function IconList({ children }: { children: ReactNode }) {
  return <ul className="not-prose my-8 grid list-none grid-cols-2 gap-x-4 gap-y-6 p-0 sm:grid-cols-3 lg:grid-cols-5">{children}</ul>;
}
export function IconListItem({ icon, children }: { icon?: string; children: ReactNode }) {
  return (
    <li className="flex flex-col gap-3 text-small text-ink">
      {icon && <Img src={icon} alt="" width={36} height={36} className="size-9 object-contain" />}
      <span className="max-w-[14ch] font-display leading-snug">{children}</span>
    </li>
  );
}

// ---------- StatBlock: the orange band, numerals at display size ----------
export function StatBlock({ children }: { children: ReactNode }) {
  return (
    <Section tight>
      <dl className={cn("grid gap-10 rounded-panel p-(--panel-padding) sm:grid-cols-3 [&>div]:min-w-0", toneClass.yellow)}>{children}</dl>
    </Section>
  );
}
export function Stat({ figure, label }: { figure: string; label: string }) {
  return (
    <div>
      <dd className="min-w-0 break-words font-display text-h1 leading-none tracking-heading [font-variant-numeric:tabular-nums]">{figure}</dd>
      <dt className="mt-3 font-display text-lg text-ink">{label}</dt>
    </div>
  );
}

// ---------- IconGrid: feature grid on rules ----------
export function IconGrid({ colour, heading, align, columns, children, variant }: { colour?: string; heading?: string; align?: "center" | "right"; columns?: string | number; children: ReactNode; variant?: "values" }) {
  const n = Number(columns) || 0;
  const gridCols = n >= 5 ? "sm:grid-cols-2 lg:grid-cols-3" : n === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2";
  const tone = toTone(colour || (heading || variant === "values" ? "lilac" : "cream"));
  return (
    <Section tight tone={tone}>
      <SectionHeader heading={heading} align={align} />
      <ul className={cn("rule-grid grid gap-x-10 gap-y-10", gridCols)}>{children}</ul>
    </Section>
  );
}

// ---------- ColourPanels: doorways. Navy, then lilac ----------
export function ColourPanels({ children }: { children: ReactNode }) {
  return <Section tight><ul className="doorways grid gap-6 md:grid-cols-2">{children}</ul></Section>;
}
export function ColourPanel({ image, imageAlt = "", children }: { colour?: string; image?: string; imageAlt?: string; children: ReactNode }) {
  return (
    <li className="flex">
      <div className="door on-tint flex w-full flex-col overflow-hidden rounded-panel">
        {image && <div className="px-6 pt-6 sm:px-8 sm:pt-8"><div className="stage stage-white h-52 w-full p-5 sm:h-60"><Img src={image} alt={imageAlt} sizes="(max-width: 768px) 90vw, 520px" className="size-full object-contain object-bottom" /></div></div>}
        <div className="prose grow p-(--panel-padding) [&>h2]:text-h2 [&>h2]:max-w-[16ch] [&>p]:text-small">{children}</div>
      </div>
    </li>
  );
}

// ---------- InfoBlock: heading + intro + step/year panels ----------
export function InfoBlock({ heading, align, children }: { heading?: string; align?: "center" | "right"; children: ReactNode }) {
  const kids = kidsOf(children);
  const panels = kids.filter((k) => typeOf(k) === InfoPanel);
  const intro = kids.filter((k) => !panels.includes(k));
  return (
    <Section tight>
      <SectionHeader heading={heading} align={align}>{intro.length > 0 && <div className="prose mt-stack">{intro}</div>}</SectionHeader>
      <ul className={cn("card-cycle grid gap-5", panels.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>{panels}</ul>
    </Section>
  );
}
export function InfoPanel({ year, children }: { year?: string; children: ReactNode }) {
  return (
    <li className="flex"><div className="card-tone on-tint w-full rounded-card p-(--card-padding) text-ink">
      {year && <p className="mb-3 font-display text-h2">{year}</p>}
      <div className="prose [&>p]:text-small">{children}</div>
    </div></li>
  );
}

// ---------- PhotoBand: full-width photo, copy on a navy panel ----------
export function PhotoBand({ image, imageAlt = "", children }: { image: string; imageAlt?: string; colour?: string; children: ReactNode }) {
  return (
    <Section tight>
      <div className="relative grid min-h-[520px] items-end overflow-hidden rounded-panel bg-surface-inverse">
        <Img src={image} alt={imageAlt} sizes="100vw" className="absolute inset-0 size-full object-cover" />
        <div className={cn("relative m-4 max-w-[520px] rounded-card p-(--panel-padding) sm:m-8", toneClass.inverse)}><div className="prose [&>p]:text-ink-inverse-muted">{children}</div></div>
      </div>
    </Section>
  );
}

// ---------- Embed / tools ----------
export function Embed({ src, title, height }: { src: string; title?: string; height?: number }) {
  if (/youtube\.com|youtu\.be/.test(src)) return <div className="my-6 overflow-hidden rounded-media"><VideoFacade src={src} title={title} /></div>;
  return <EmbedPlaceholder src={src} title={title} height={height} />;
}

export { Section, Container, SectionHeader, Link };
