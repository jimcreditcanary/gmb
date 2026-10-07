"use client";
import { useEffect, useRef, useState } from "react";
import { imageDims } from "@/lib/media";

/**
 * Header animation. Renders the same artwork as a static SVG/PNG poster first (no JS cost, no CLS),
 * then upgrades to the dotLottie animation on desktop once the browser is idle. Phones and
 * prefers-reduced-motion users keep the still: the player's 1.2 MB wasm is not worth their main thread.
 */
export function Lottie({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const d = poster ? imageDims(poster) : undefined; const ratio = d ? `${d.width} / ${d.height}` : "1 / 1";
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || (!desktop && poster) || saveData) return;
    let cancelled = false; let idle: number | undefined;
    const io = new IntersectionObserver((e) => {
      if (!e.some((x) => x.isIntersecting)) return; io.disconnect();
      const start = () => { if (!cancelled) setAnimate(true); };
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      idle = w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 5000 }) : window.setTimeout(start, 2500);
    }, { rootMargin: "100px" });
    io.observe(el);
    return () => { cancelled = true; io.disconnect(); const w = window as Window & { cancelIdleCallback?: (id: number) => void }; if (idle !== undefined) { if (w.cancelIdleCallback) w.cancelIdleCallback(idle); else window.clearTimeout(idle); } };
  }, [poster]);
  useEffect(() => {
    if (!animate) return;
    let cancelled = false; let player: { destroy?: () => void } | undefined;
    import("@lottiefiles/dotlottie-web").then(({ DotLottie }) => {
      if (cancelled || !ref.current) return;
      DotLottie.setWasmUrl("/theme/dotlottie-player.wasm");
      const canvas = ref.current.querySelector("canvas"); if (!canvas) return;
      player = new DotLottie({ canvas, src, loop: true, autoplay: true, renderConfig: { autoResize: true } });
    });
    return () => { cancelled = true; player?.destroy?.(); };
  }, [animate, src]);
  return (
    <div ref={ref} className="lottie-player" style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {poster && !animate && <img src={poster} alt="" aria-hidden="true" decoding="async" {...(imageDims(poster) || {})} style={{ width: "100%", height: "auto", maxHeight: "100%", objectFit: "contain", display: "block", aspectRatio: ratio }} />}
      {(animate || !poster) && <canvas style={{ width: "100%", height: "100%", display: "block", aspectRatio: ratio }} aria-hidden="true" />}
    </div>
  );
}
