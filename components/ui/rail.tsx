"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

/**
 * A horizontal card rail (monzo.com's product rows): scroll-snap list (positioned, so absolutely placed descendants such as sr-only link context stay inside the scroller instead of widening the page), one card and a bit on phones, four on desktop,
 * previous / next controls when there is more than fits. Pass <li> children; `className` goes on the <ul>.
 */
export function Rail({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [state, setState] = useState({ start: true, end: true });
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const update = () => setState({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update); ro.observe(el);
    return () => { el.removeEventListener("scroll", update); ro.disconnect(); };
  }, []);
  const go = (dir: 1 | -1) => { const el = ref.current; if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" }); };
  const hidden = state.start && state.end;
  return (
    <div className="relative">
      {/* No `scroll-smooth` on the list: with mandatory snap, Chrome animates the initial snap and stops recording LCP (Lighthouse NO_LCP); the buttons pass `behavior: smooth` themselves.
          The clip wrapper spans the page gutters so cards bleed to the edge; `overflow: hidden` (not `clip`: Chrome still counts clipped cards as page overflow) keeps the row out of the page width so the viewport cannot scroll sideways. */}
      <div className="-mx-page overflow-hidden">
        <ul ref={ref} aria-label={label} className={cn("rail relative flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain px-page pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}>{children}</ul>
      </div>
      {!hidden && (
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => go(-1)} disabled={state.start} aria-label="Previous cards" className="grid size-12 place-items-center rounded-control border border-ink text-ink transition-colors duration-(--motion-duration) hover:bg-ink hover:text-ink-inverse disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"><FontAwesomeIcon icon={faArrowLeft} className="size-4" aria-hidden="true" /></button>
          <button type="button" onClick={() => go(1)} disabled={state.end} aria-label="Next cards" className="grid size-12 place-items-center rounded-control border border-ink text-ink transition-colors duration-(--motion-duration) hover:bg-ink hover:text-ink-inverse disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"><FontAwesomeIcon icon={faArrowRight} className="size-4" aria-hidden="true" /></button>
        </div>
      )}
    </div>
  );
}

/** One rail card. Width: ~80% on phones, half on tablets, a quarter on desktop. */
export function RailItem({ className, children }: { className?: string; children: ReactNode }) {
  return <li className={cn("flex w-[80%] shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]", className)}>{children}</li>;
}
