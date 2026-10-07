"use client";
import { useId, useState, type ReactNode, Children, isValidElement } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

/** Accordion group. Same DOM/classes as the theme (`.accordion > .wrap > a.toggle + .inner`, `.show` when open); one open at a time, as the original jQuery did. */
export function FAQGroup({ heading, colour, children, index }: { heading: string; colour?: string; children?: ReactNode; index?: number }) {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();
  const items = Children.toArray(children).filter(isValidElement) as React.ReactElement<{ question: string; children: ReactNode }>[];
  return (
    <div className="wrap-block" id={index !== undefined ? String(index) : undefined}>
      <header className="data-header"><h2>{heading}</h2></header>
      <div className={`accordion ${colour || ""}`.trim()}>
        {items.map((item, i) => {
          const isOpen = open === i; const id = `${base}-${i}`;
          return (
            <div className="wrap" key={i}>
              <a href={`#${id}`} className={`toggle${isOpen ? " show" : ""}`} role="button" aria-expanded={isOpen} aria-controls={id} onClick={(e) => { e.preventDefault(); setOpen(isOpen ? null : i); }}>{item.props.question}</a>
              <div id={id} className={`inner${isOpen ? " show" : ""}`} aria-hidden={!isOpen} inert={!isOpen}><div className="inner-content">{item.props.children}</div></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export function FAQ({ children }: { question: string; children: ReactNode }) { return <>{children}</>; }

/** `section.faq` wrapper with the "Jump To" selector the theme renders above the groups. */
export function FAQSection({ children }: { children: ReactNode }) {
  const [openNav, setOpenNav] = useState(false);
  const groups = Children.toArray(children).filter(isValidElement) as React.ReactElement<{ heading: string }>[];
  return (
    <section className="faq"><div className="outline">
      <div className="wrap-links">
        <label>Jump To:</label>
        <div className="navigation">
          <a href="#" className="link" aria-expanded={openNav} onClick={(e) => { e.preventDefault(); setOpenNav((v) => !v); }}>Select <FontAwesomeIcon icon={faChevronDown} /></a>
          <ul className="list-links" style={{ display: openNav ? "block" : "none" }}>
            {groups.map((g, i) => <li key={i}><a href={`#${i}`} className="scrollto" onClick={(e) => { e.preventDefault(); document.getElementById(String(i))?.scrollIntoView({ behavior: "smooth" }); setOpenNav(false); }}>{g.props.heading}</a></li>)}
          </ul>
        </div>
      </div>
      {groups.map((g, i) => <FAQGroup key={i} {...g.props} index={i} />)}
    </div></section>
  );
}
