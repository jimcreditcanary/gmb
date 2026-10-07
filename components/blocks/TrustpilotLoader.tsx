"use client";
import { useEffect } from "react";

let requested = false;
/** Loads the Trustpilot bootstrap once, after the browser is idle, so it never sits on the critical path. */
export function TrustpilotLoader() {
  useEffect(() => {
    if (requested) return;
    requested = true;
    const load = () => {
      const s = document.createElement("script");
      s.src = "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";
      s.async = true;
      document.head.appendChild(s);
    };
    if ("requestIdleCallback" in window) (window as Window & { requestIdleCallback: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback(load, { timeout: 4000 });
    else setTimeout(load, 2500);
  }, []);
  return null;
}
