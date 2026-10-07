"use client";
import { useState } from "react";

const LABELS: [RegExp, string][] = [[/inbest\.ai/, "Benefit Calculator"]];

/** Placeholder container for a third-party iframe (decision 2026-10-07): a reserved panel with one button; the iframe only loads on click. */
export function EmbedPlaceholder({ src, title, height }: { src: string; title?: string; height?: number }) {
  const [loaded, setLoaded] = useState(false);
  const label = title || LABELS.find(([re]) => re.test(src))?.[1] || "Load tool";
  const host = (() => { try { return new URL(src).hostname.replace(/^www\./, ""); } catch { return ""; } })();
  if (loaded) return <iframe id={/inbest\.ai/.test(src) ? "inbest_iframe" : undefined} src={src} title={label} style={{ width: "100%", border: 0, minHeight: height || 3360 }} />;
  return (
    <div className="tool-placeholder">
      <div className="tool-placeholder-inner">
        <p><button type="button" className="button" onClick={() => setLoaded(true)}>{label}</button></p>
        <p className="tool-placeholder-note"><a href={src} target="_blank" rel="noopener">{label}</a> (opens on {host})</p>
      </div>
    </div>
  );
}
