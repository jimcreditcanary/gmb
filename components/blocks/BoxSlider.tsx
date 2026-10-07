"use client";
import { useRef, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader } from "./SectionHeader";

/** Product teaser slider. The theme used slick (4/3/2/1 per row at 1200/992/640). Reproduced with CSS scroll-snap + arrows: no carousel JS. */
export function BoxSlider({ heading, intro, align, children }: { heading?: string; intro?: string; align?: "center" | "right"; children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => { const el = track.current; if (!el) return; const w = el.firstElementChild?.getBoundingClientRect().width || 300; el.scrollBy({ left: dir * w, behavior: "smooth" }); };
  return (
    <section className="box-slider bg-white"><div className="outline">
      {(heading || intro) && <SectionHeader heading={heading} align={align}>{intro && <p style={align ? { textAlign: align } : undefined} dangerouslySetInnerHTML={{ __html: intro }} />}</SectionHeader>}
      <div className="wrap-boxslider">
        <div className="init-boxslider slick-initialized slick-slider">
          <button type="button" className="slick-next" aria-label="Previous" onClick={() => scroll(-1)}><FontAwesomeIcon icon={faArrowLeft} /></button>
          <div className="slick-list"><div className="slick-track snap-track" ref={track}>{children}</div></div>
          <button type="button" className="slick-prev" aria-label="Next" onClick={() => scroll(1)}><FontAwesomeIcon icon={faArrowRight} /></button>
        </div>
      </div>
    </div></section>
  );
}
export function Box({ image, imageAlt = "", children }: { image?: string; imageAlt?: string; children: ReactNode }) {
  return (
    <div className="slick-slide snap-slide"><div className="wrap">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {image && <div className="data-image"><img src={image} alt={imageAlt} loading="lazy" decoding="async" /></div>}
      <div className="data-content">{children}</div>
    </div></div>
  );
}
