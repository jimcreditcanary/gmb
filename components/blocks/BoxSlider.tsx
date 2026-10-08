import type { ReactNode } from "react";
import { Section, SectionHeader } from "@/components/ui/section";
import { Img } from "./Img";
import { LinkButton } from "@/lib/with-context";
import { Button } from "@/components/ui/button";

type El = { type?: unknown; props?: { children?: unknown } };
const flat = (c: unknown): unknown[] => (Array.isArray(c) ? c.flatMap(flat) : [c]);
const isAction = (k: unknown) => { const e = k as El; return !!e && typeof e === "object" && e.type === "p" && flat(e.props?.children).some((c) => { const t = (c as El)?.type; return t === LinkButton || t === Button; }); };

/**
 * Product comparison (docs/design-direction.md). Every product on one scannable list: artwork, name, description,
 * the facts as a list, the two actions. Rows separated by rules, not boxed. `layout` is accepted for content
 * compatibility and ignored; the carousel is gone by design.
 */
export function BoxSlider({ heading, intro, align, children }: { heading?: string; intro?: string; align?: "center" | "right"; layout?: "slider" | "grid"; children: ReactNode }) {
  return (
    <Section>
      <SectionHeader heading={heading} intro={intro} align={align} className="[&>h2]:max-w-[16ch]" />
      <ul className="border-t border-border">{children}</ul>
    </Section>
  );
}
export function Box({ image, imageAlt = "", children }: { image?: string; imageAlt?: string; children: ReactNode }) {
  const kids = (Array.isArray(children) ? children : [children]).filter(Boolean);
  const actions = kids.filter(isAction).flatMap((k) => flat((k as El).props?.children).filter((c) => typeof c === "object" && c !== null));
  const body = kids.filter((k) => !isAction(k));
  return (
    <li className="grid items-start gap-x-10 gap-y-5 border-b border-border py-8 md:grid-cols-[minmax(0,2fr)_minmax(0,7fr)_minmax(0,3fr)] md:py-10">
      {image ? <div className="flex h-28 items-center md:h-32"><Img src={image} alt={imageAlt} className="max-h-full w-auto max-w-[200px] object-contain" /></div> : <div />}
      <div className="prose product-row [&>h3]:text-h2 [&>h3]:mb-3 [&>p]:text-ink-muted [&>p]:max-w-[60ch] [&>ul]:mt-5 [&>ul]:grid [&>ul]:gap-x-8 [&>ul]:gap-y-1 [&>ul]:sm:grid-cols-2 [&>ul]:text-small [&>ul]:font-display [&>ul]:list-none [&>ul]:p-0 [&>ul>li]:border-t [&>ul>li]:border-border [&>ul>li]:py-2 [&>ul>li]:m-0">{body}</div>
      {actions.length > 0 && <div className="product-actions flex flex-wrap gap-3 md:flex-col md:items-stretch md:pt-2 [&>.button]:justify-center">{actions as ReactNode[]}</div>}
    </li>
  );
}
