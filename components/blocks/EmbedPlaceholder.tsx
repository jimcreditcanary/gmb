"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const LABELS: [RegExp, string][] = [[/inbest\.ai/, "Benefit Calculator"]];

/** Placeholder for a third-party iframe: a reserved panel with one button; the iframe loads on click (decision 2026-10-07). */
export function EmbedPlaceholder({ src, title, height }: { src: string; title?: string; height?: number }) {
  const [loaded, setLoaded] = useState(false);
  const label = title || LABELS.find(([re]) => re.test(src))?.[1] || "Load tool";
  const host = (() => { try { return new URL(src).hostname.replace(/^www\./, ""); } catch { return ""; } })();
  if (loaded) return <iframe id={/inbest\.ai/.test(src) ? "inbest_iframe" : undefined} src={src} title={label} className="w-full border-0" style={{ minHeight: height || 3360 }} />;
  return (
    <div className="tool-placeholder my-6 grid min-h-80 place-items-center rounded-panel bg-tone-savings p-8 text-center">
      <div>
        <Button onClick={() => setLoaded(true)}>{label}</Button>
        <p className="mt-3 text-small text-ink-muted"><a href={src} target="_blank" rel="noopener" className="text-ink">{label}</a> (opens on {host})</p>
      </div>
    </div>
  );
}
