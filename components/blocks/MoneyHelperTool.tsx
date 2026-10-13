"use client";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

/** Placeholder for a MoneyHelper syndicated tool: nothing third-party loads until the member chooses to. */
export function MoneyHelperTool({ id, href, lang = "en", width, children }: { id: string; href: string; lang?: string; width?: string; children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const load = () => {
    if (!document.querySelector('script[src*="moneyadviceservice.org.uk/assets/syndication/tools.js"]')) {
      const s = document.createElement("script"); s.src = "https://www.moneyadviceservice.org.uk/assets/syndication/tools.js"; s.async = true; document.body.appendChild(s);
    }
    setLoaded(true);
  };
  return (
    <div className={`tool-placeholder tool-${id} my-6 ${loaded ? "" : "grid min-h-80 place-items-center rounded-panel bg-tone-savings p-8 text-center"}`}>
      {!loaded && (
        <div>
          <Button onClick={load}>{children}</Button>
          <p className="mt-3 text-small text-ink-muted"><a href={href} target="_blank" rel="noopener" className="text-ink">{children}</a> (opens on moneyhelper.org.uk)</p>
        </div>
      )}
      {loaded && <a id={id} className="mas-widget" lang={lang} href={href} target="_blank" rel="noopener" data-width={width}>{children}</a>}
    </div>
  );
}
