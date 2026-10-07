"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";

type Consent = { analytics: boolean; marketing: boolean; ts: number };
const KEY = "gmbcu-consent-v1";
const EVT = "gmbcu:consent-change";
declare global { interface Window { dataLayer?: unknown[] } }

function gtag(...args: unknown[]) { window.dataLayer = window.dataLayer || []; window.dataLayer.push(args); }
function read(): string | null { try { return localStorage.getItem(KEY); } catch { return null; } }
function subscribe(cb: () => void) { window.addEventListener("storage", cb); document.addEventListener(EVT, cb); document.addEventListener("gmbcu:open-consent", cb); return () => { window.removeEventListener("storage", cb); document.removeEventListener(EVT, cb); document.removeEventListener("gmbcu:open-consent", cb); }; }
let reopen = 0;
function snapshot() { return (read() ?? "") + "|" + reopen; }
if (typeof document !== "undefined") document.addEventListener("gmbcu:open-consent", () => { reopen++; });

/** Applies Consent Mode v2 state and, when a GTM id is configured and consent allows, loads the container. */
export function applyConsent(c: Consent | null) {
  const granted = (v: boolean) => (v ? "granted" : "denied");
  gtag("consent", c ? "update" : "default", { ad_storage: granted(!!c?.marketing), ad_user_data: granted(!!c?.marketing), ad_personalization: granted(!!c?.marketing), analytics_storage: granted(!!c?.analytics), functionality_storage: "granted", security_storage: "granted", wait_for_update: 500 });
  const id = process.env.NEXT_PUBLIC_GTM_ID;
  if (id && c && (c.analytics || c.marketing) && !document.getElementById("gtm-js")) {
    window.dataLayer!.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const s = document.createElement("script"); s.id = "gtm-js"; s.async = true; s.src = `https://www.googletagmanager.com/gtm.js?id=${id}`; document.head.appendChild(s);
  }
}

/** PECR/UK GDPR cookie banner. Nothing non-essential runs until the visitor chooses. First-party, no third-party CMP. */
export function CookieBanner() {
  const snap = useSyncExternalStore(subscribe, snapshot, () => "ssr");
  const [stored, reopenCount] = snap.split("|");
  const [dismissedAt, setDismissedAt] = useState("");
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  useEffect(() => { if (snap === "ssr") return; let c: Consent | null = null; try { c = stored ? JSON.parse(stored) : null; } catch { } applyConsent(c); }, [snap, stored]);
  const visible = snap !== "ssr" && (!stored || (reopenCount !== "0" && dismissedAt !== reopenCount));
  const save = (c: Omit<Consent, "ts">) => { const v = { ...c, ts: Date.now() }; try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { } setDismissedAt(reopenCount || "0"); document.dispatchEvent(new Event(EVT)); };
  if (!visible) return null;
  return (
    <div className="cookie-banner" role="dialog" aria-modal="false" aria-labelledby="ck-title" aria-describedby="ck-desc">
      <h2 id="ck-title">We value your privacy</h2>
      <p id="ck-desc">We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies. <Link href="/privacy-policy/">Privacy policy</Link></p>
      {custom && (
        <div className="cookie-options">
          <label><input type="checkbox" checked disabled /> Necessary (always on)</label>
          <label><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> Analytics</label>
          <label><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> Advertising</label>
        </div>
      )}
      <div className="cookie-actions">
        {custom ? <button type="button" className="button button-alt" onClick={() => save({ analytics, marketing })}>Save preferences</button> : <button type="button" className="button button-alt" onClick={() => setCustom(true)}>Customize</button>}
        <button type="button" className="button button-alt" onClick={() => save({ analytics: false, marketing: false })}>Reject All</button>
        <button type="button" className="button" onClick={() => save({ analytics: true, marketing: true })}>Accept All</button>
      </div>
    </div>
  );
}
