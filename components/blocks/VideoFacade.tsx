"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** YouTube facade: poster + play button; the iframe (and ~1MB of YouTube JS) loads only on click. */
export function VideoFacade({ src, title = "YouTube video player", square }: { src: string; title?: string; square?: boolean }) {
  const [play, setPlay] = useState(false);
  const id = src.match(/embed\/([A-Za-z0-9_-]{6,})/)?.[1];
  if (!id) return <iframe src={src} title={title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="aspect-video w-full" />;
  const embed = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  return (
    <div className={cn("video-facade relative w-full overflow-hidden bg-surface-inverse", square ? "h-full min-h-[260px]" : "aspect-video rounded-media")}>
      {play ? (
        <iframe src={embed} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="absolute inset-0 size-full border-0" />
      ) : (
        <button type="button" onClick={() => setPlay(true)} aria-label={`Play video: ${title}`} className="group absolute inset-0 size-full cursor-pointer border-0 bg-transparent p-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" width={480} height={360} className="block size-full object-cover" />
          <span aria-hidden="true" className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-strong text-ink-inverse shadow-float transition-transform duration-(--motion-duration) group-hover:scale-105">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          </span>
        </button>
      )}
    </div>
  );
}
