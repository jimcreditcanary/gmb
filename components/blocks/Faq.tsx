"use client";
import { useId, useState, type ReactNode, Children, isValidElement } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { toTone, toneClass } from "@/lib/tones";
import { Container } from "@/components/ui/section";

/** Accordion group (docs/design-system.md §Accordion). One open at a time; the open panel animates height. */
export function FAQGroup({ heading, colour, children, index, hideHeading }: { heading: string; colour?: string; children?: ReactNode; index?: number; hideHeading?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();
  const items = Children.toArray(children).filter(isValidElement) as React.ReactElement<{ question: string; children: ReactNode }>[];
  const tone = toTone(colour || "cream");
  return (
    <div id={index !== undefined ? `faq-${index}` : undefined} className="scroll-mt-24 py-6">
      <h2 className={hideHeading ? "sr-only-text" : "mb-6"}>{heading}</h2>
      <div className="grid gap-3">
        {items.map((item, i) => {
          const isOpen = open === i; const id = `${base}-${i}`;
          return (
            <div key={i} className={cn("rounded-card", toneClass[tone])}>
              <button type="button" className="flex w-full items-center justify-between gap-4 rounded-card px-5 py-4 text-left font-display text-h4 leading-snug" aria-expanded={isOpen} aria-controls={id} onClick={() => setOpen(isOpen ? null : i)}>
                <span>{item.props.question}</span>
                <FontAwesomeIcon icon={faChevronDown} className={cn("size-4 shrink-0 transition-transform duration-(--motion-duration) ease-standard", isOpen && "rotate-180")} aria-hidden="true" />
              </button>
              <div id={id} className={cn("grid transition-[grid-template-rows] duration-(--motion-duration-slow) ease-standard", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")} aria-hidden={!isOpen} inert={!isOpen}>
                <div className="min-h-0 overflow-hidden"><div className="prose px-5 pb-5 [&>p]:text-small [&_li]:text-small">{item.props.children}</div></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export function FAQ({ children }: { question: string; children: ReactNode }) { return <>{children}</>; }

/** FAQ page body: a "Jump to" select above the groups. */
export function FAQSection({ children }: { children: ReactNode }) {
  const groups = Children.toArray(children).filter(isValidElement) as React.ReactElement<{ heading: string }>[];
  const selectId = useId();
  return (
    <section className="py-section-tight"><Container>
      <div className="mb-block flex flex-wrap items-center gap-3">
        <label htmlFor={selectId} className="font-display text-small">Jump To:</label>
        <select id={selectId} className="h-12 rounded-field border border-border-strong bg-surface px-4 text-body" defaultValue="" onChange={(e) => { const el = document.getElementById(e.target.value); el?.scrollIntoView({ behavior: "smooth" }); }}>
          <option value="" disabled>Select</option>
          {groups.map((g, i) => <option key={i} value={`faq-${i}`}>{g.props.heading}</option>)}
        </select>
      </div>
      {groups.map((g, i) => <FAQGroup key={i} {...g.props} index={i} />)}
    </Container></section>
  );
}
