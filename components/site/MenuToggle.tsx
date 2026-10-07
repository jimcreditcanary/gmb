"use client";
import { useEffect, useState } from "react";

/** Mobile hamburger (≤630px). Toggles the same classes Max Mega Menu used so the ported CSS shows/hides the list. Also handles tap-to-open fly-outs on touch. */
export function MenuToggle() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const wrap = document.getElementById("mega-menu-wrap-menu-header"); const ul = document.getElementById("mega-menu-menu-header"); const toggle = wrap?.querySelector(".mega-menu-toggle");
    if (!wrap || !ul || !toggle) return;
    ul.classList.toggle("mega-menu-open", open); toggle.classList.toggle("mega-menu-open", open); document.body.classList.toggle("mega-menu-open", open);
  }, [open]);
  useEffect(() => {
    // sub-menu toggling: on the mobile layout a tap on a parent opens its fly-out (second tap follows the link, as `data-second-click="go"`)
    const ul = document.getElementById("mega-menu-menu-header"); if (!ul) return;
    const onClick = (e: Event) => {
      const a = (e.target as HTMLElement).closest("li.mega-menu-item-has-children > a.mega-menu-link") as HTMLAnchorElement | null; if (!a) return;
      const li = a.parentElement!; const mobile = window.matchMedia("(max-width: 630px)").matches;
      if (!mobile) return;
      if (!li.classList.contains("mega-toggle-on")) { e.preventDefault(); ul.querySelectorAll("li.mega-toggle-on").forEach((x) => x.classList.remove("mega-toggle-on")); li.classList.add("mega-toggle-on"); a.setAttribute("aria-expanded", "true"); }
    };
    ul.addEventListener("click", onClick); return () => ul.removeEventListener("click", onClick);
  }, []);
  useEffect(() => {
    // keyboard: open fly-out on focus within, close on Escape
    const ul = document.getElementById("mega-menu-menu-header"); if (!ul) return;
    const onFocus = (e: FocusEvent) => { ul.querySelectorAll("li.mega-toggle-on").forEach((x) => x.classList.remove("mega-toggle-on")); const li = (e.target as HTMLElement).closest("li.mega-menu-item-has-children"); if (li) li.classList.add("mega-toggle-on"); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { ul.querySelectorAll("li.mega-toggle-on").forEach((x) => x.classList.remove("mega-toggle-on")); setOpen(false); } };
    ul.addEventListener("focusin", onFocus); document.addEventListener("keydown", onKey);
    return () => { ul.removeEventListener("focusin", onFocus); document.removeEventListener("keydown", onKey); };
  }, []);
  return (
    <div className="mega-menu-toggle">
      <div className="mega-toggle-blocks-left"></div><div className="mega-toggle-blocks-center"></div>
      <div className="mega-toggle-blocks-right">
        <div className="mega-toggle-block mega-menu-toggle-animated-block mega-toggle-block-0" id="mega-toggle-block-0">
          <button aria-controls="mega-menu-menu-header" aria-expanded={open} aria-haspopup="true" aria-label="Toggle Menu" className={`mega-toggle-animated mega-toggle-animated-slider${open ? " is-active" : ""}`} type="button" onClick={() => setOpen((v) => !v)}>
            <span className="mega-toggle-animated-box"><span className="mega-toggle-animated-inner"></span></span>
          </button>
        </div>
      </div>
    </div>
  );
}
