import type { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { toneClass, type Tone } from "@/lib/tones";

/** Page-width container: 1200px content, page gutters from the token. */
export function Container({ className, wide, children }: { className?: string; wide?: boolean; children: ReactNode }) {
  return <div className={cn("mx-auto w-full px-page", wide ? "max-w-wide" : "max-w-site", className)}>{children}</div>;
}

/**
 * A page section. White by default; a tone renders as a rounded panel inside the container (never a full-bleed stripe),
 * which is the design system's rule for colour on content pages.
 */
export function Section({ tone = "surface", tight, className, panelClassName, id, children }: { tone?: Tone; tight?: boolean; className?: string; panelClassName?: string; id?: string; children: ReactNode }) {
  const tinted = tone !== "surface";
  return (
    <section id={id} className={cn(tight ? "py-section-tight" : "py-section", className)}>
      <Container>
        {tinted ? <div className={cn("rounded-panel p-(--panel-padding)", toneClass[tone], panelClassName)}>{children}</div> : children}
      </Container>
    </section>
  );
}

/** Section title + optional intro. Always an h2; alignment comes from the content's own inline style or `align`. */
export function SectionHeader({ heading, align, intro, children, className }: { heading?: string; align?: "center" | "right"; intro?: string; children?: ReactNode; className?: string }) {
  const style: CSSProperties | undefined = align ? { textAlign: align } : undefined;
  if (!heading && !intro && !children) return null;
  return (
    <header className={cn("mb-block max-w-measure", align === "center" && "mx-auto", className)} style={style}>
      {heading && <h2 dangerouslySetInnerHTML={{ __html: heading }} />}
      {intro && <p className="mt-stack text-lead text-ink-muted" dangerouslySetInnerHTML={{ __html: intro }} />}
      {children}
    </header>
  );
}
