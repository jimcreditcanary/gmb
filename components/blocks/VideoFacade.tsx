"use client";
import { useState } from "react";

/** YouTube facade: a poster + play button; the iframe (and ~1MB of YouTube JS) loads only on click. */
export function VideoFacade({ src, title = "YouTube video player" }: { src: string; title?: string }) {
  const [play, setPlay] = useState(false);
  const id = src.match(/embed\/([A-Za-z0-9_-]{6,})/)?.[1];
  if (!id) return <iframe src={src} title={title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />;
  const embed = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  return (
    <div className="video-facade" style={{ position: "relative", aspectRatio: "16 / 9", width: "100%", background: "#000", borderRadius: "var(--radius-brand, 20px)", overflow: "hidden" }}>
      {play ? (
        <iframe src={embed} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
      ) : (
        <button type="button" onClick={() => setPlay(true)} aria-label={`Play video: ${title}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", padding: 0, border: 0, background: "transparent", cursor: "pointer" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" width={480} height={360} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 68, height: 48, borderRadius: 12, background: "#e36129", display: "grid", placeItems: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          </span>
        </button>
      )}
    </div>
  );
}
