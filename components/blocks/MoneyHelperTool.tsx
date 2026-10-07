"use client";
import { useState, type ReactNode } from "react";

/**
 * Placeholder container for a MoneyHelper syndicated tool (decision 2026-10-07: embeds as placeholders for now).
 * Nothing third-party loads until the member chooses to: the panel shows the tool's own link text as a button;
 * one click loads MoneyHelper's tools.js in place (their script swaps the anchor for the iframe). No cookies, no CLS before that.
 */
export function MoneyHelperTool({ id, href, lang = "en", width, children }: { id: string; href: string; lang?: string; width?: string; children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const load = () => {
    if (!document.querySelector('script[src*="moneyadviceservice.org.uk/assets/syndication/tools.js"]')) {
      const s = document.createElement("script"); s.src = "https://www.moneyadviceservice.org.uk/assets/syndication/tools.js"; s.async = true; document.body.appendChild(s);
    }
    setLoaded(true);
  };
  return (
    <div className={`tool-placeholder tool-${id}${loaded ? " is-loaded" : ""}`}>
      {!loaded && (
        <div className="tool-placeholder-inner">
          <p><button type="button" className="button" onClick={load}>{children}</button></p>
          <p className="tool-placeholder-note"><a href={href} target="_blank" rel="noopener">{children}</a> (opens on moneyhelper.org.uk)</p>
        </div>
      )}
      {loaded && <a id={id} className="mas-widget" lang={lang} href={href} target="_blank" rel="noopener" data-width={width}>{children}</a>}
    </div>
  );
}
