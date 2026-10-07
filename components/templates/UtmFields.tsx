"use client";
import { useEffect } from "react";

const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "msclkid"];

/** Captures UTM/click ids from the landing URL (session-scoped) and injects them as hidden fields into every form on the page and appends them to the CTA link. */
export function UtmFields() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    KEYS.forEach((k) => { const v = params.get(k); if (v) found[k] = v; });
    try { if (Object.keys(found).length) sessionStorage.setItem("gmbcu-utm", JSON.stringify(found)); } catch { }
    let stored: Record<string, string> = found;
    try { stored = { ...JSON.parse(sessionStorage.getItem("gmbcu-utm") || "{}"), ...found }; } catch { }
    if (!Object.keys(stored).length) return;
    document.querySelectorAll("form").forEach((f) => Object.entries(stored).forEach(([k, v]) => { if (!f.querySelector(`input[name="${k}"]`)) { const i = document.createElement("input"); i.type = "hidden"; i.name = k; i.value = v; f.appendChild(i); } }));
    document.querySelectorAll<HTMLAnchorElement>("a.button[href^='http']").forEach((a) => { try { const u = new URL(a.href); Object.entries(stored).forEach(([k, v]) => u.searchParams.set(k, v)); a.href = u.toString(); } catch { } });
  }, []);
  return null;
}
