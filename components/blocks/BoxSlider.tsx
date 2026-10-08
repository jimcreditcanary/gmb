import type { ReactNode } from "react";
import { Section, SectionHeader } from "@/components/ui/section";
import { Img } from "./Img";
import { LinkButton } from "@/lib/with-context";
import { Button } from "@/components/ui/button";

type El = { type?: unknown; props?: { children?: unknown } };
const flat = (c: unknown): unknown[] => (Array.isArray(c) ? c.flatMap(flat) : [c]);
const isAction = (k: unknown) => { const e = k as El; return !!e && typeof e === "object" && e.type === "p" && flat(e.props?.children).some((c) => { const t = (c as El)?.type; return t === LinkButton || t === Button; }); };

/**
 * Product cards (docs/design-direction.md, Monzo model): every product as a colour card cycling through the brand tints,
 * artwork on top, facts as a list, the two actions at the bottom. `layout` is accepted for content compatibility and ignored.
 */
export function BoxSlider({ heading, intro, align, children }: { heading?: string; intro?: string; align?: "center" | "right"; layout?: "slider" | "grid"; children: ReactNode }) {
  return (
    <Section>
      <SectionHeader heading={heading} intro={intro} align={align} className="[&>h2]:max-w-[16ch]" />
      <ul className="card-cycle grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
    </Section>
  );
}
export function Box({ image, imageAlt = "", children }: { image?: string; imageAlt?: string; children: ReactNode }) {
  const kids = (Array.isArray(children) ? children : [children]).filter(Boolean);
  const actions = kids.filter(isAction).flatMap((k) => flat((k as El).props?.children).filter((c) => typeof c === "object" && c !== null));
  const body = kids.filter((k) => !isAction(k));
  return (
    <li className="flex">
      <div className="card-tone on-tint flex w-full flex-col rounded-card p-(--card-padding) text-ink sm:p-8">
        {image && <div className="mb-6 flex h-36 items-center"><Img src={image} alt={imageAlt} className="max-h-full w-auto max-w-[200px] object-contain" /></div>}
        <div className="prose grow [&>h3]:text-h3 [&>p]:text-small [&>ul]:mt-4 [&>ul]:list-none [&>ul]:p-0 [&>ul]:text-small [&>ul]:font-display [&>ul>li]:border-t [&>ul>li]:border-ink/15 [&>ul>li]:py-2 [&>ul>li]:m-0">{body}</div>
        {actions.length > 0 && <div className="mt-6 flex flex-wrap gap-3 [&>.button.button-alt]:bg-transparent">{actions as ReactNode[]}</div>}
      </div>
    </li>
  );
}
