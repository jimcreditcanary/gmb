import type { ReactNode } from "react";
import { Section, SectionHeader } from "@/components/ui/section";
import { Img } from "./Img";

/**
 * Product grid (was the slick carousel). Every product is visible: 3 / 2 / 1 columns. `layout` is accepted for
 * content compatibility and ignored; the carousel is gone by design (docs/design-system.md §Product grid).
 */
export function BoxSlider({ heading, intro, align, children }: { heading?: string; intro?: string; align?: "center" | "right"; layout?: "slider" | "grid"; children: ReactNode }) {
  return (
    <Section>
      <SectionHeader heading={heading} intro={intro} align={align} />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
    </Section>
  );
}
export function Box({ image, imageAlt = "", children }: { image?: string; imageAlt?: string; children: ReactNode }) {
  return (
    <li className="flex flex-col rounded-card border border-border bg-surface p-(--card-padding) shadow-card transition-shadow duration-(--motion-duration) hover:shadow-card-hover">
      {image && <div className="mb-5 flex h-40 items-center justify-center overflow-hidden"><Img src={image} alt={imageAlt} className="max-h-full w-auto max-w-full object-contain" /></div>}
      <div className="prose flex grow flex-col [&>h3]:text-h3 [&>p]:text-small [&>p]:text-ink-muted [&>ul]:text-small [&>p:has(>.button)]:mt-auto [&>p:has(>.button)]:pt-4">{children}</div>
    </li>
  );
}
