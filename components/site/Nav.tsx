"use client";
import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/site";
import { Button } from "@/components/ui/button";

/**
 * Site navigation (docs/design-system.md §Navigation). Desktop: links with hover/focus fly-outs; the last external
 * item ("Member Hub") is the nav's one button. Phone: hamburger → full-width panel with expandable groups.
 */
export function Nav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<string | null>(null);
  const pathname = usePathname();
  const panelId = useId();
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) { setSeenPath(pathname); setOpen(false); setSub(null); }   // close the panel on navigation (render-time adjustment, not an effect)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);
  const cta = items.find((i) => i.href.startsWith("http"));
  const links = items.filter((i) => i !== cta);
  const active = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <>
      {/* desktop */}
      <ul className="hidden items-center gap-1 lg:flex">
        {links.map((item) => (
          <li key={item.href} className="group relative">
            <Link href={item.href} className={cn("inline-flex h-10 items-center gap-1.5 rounded-control px-3.5 font-ui text-small font-semibold text-ink no-underline transition-colors duration-(--motion-duration) hover:bg-surface-subtle hover:text-ink", active(item.href) && "bg-surface-subtle")} aria-current={active(item.href) ? "page" : undefined} {...(item.children?.length ? { "aria-haspopup": "true" } : {})}>
              {item.label}{item.children?.length ? <FontAwesomeIcon icon={faChevronDown} className="size-3 opacity-70 transition-transform duration-(--motion-duration) group-hover:rotate-180 group-focus-within:rotate-180" aria-hidden="true" /> : null}
            </Link>
            {item.children?.length ? (
              <ul className="invisible absolute left-0 top-full z-40 min-w-56 translate-y-1 rounded-card border border-border bg-surface p-2 opacity-0 shadow-float transition-[opacity,transform,visibility] duration-(--motion-duration) ease-standard group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                {item.children.map((c) => <li key={c.href}><Link href={c.href} className="block rounded-field px-3 py-2 font-ui text-small font-medium text-ink no-underline hover:bg-surface-subtle hover:text-ink">{c.label}</Link></li>)}
              </ul>
            ) : null}
          </li>
        ))}
        {cta && <li className="ml-2"><Button href={cta.href} size="sm" variant="dark" rel="noopener">{cta.label}</Button></li>}
      </ul>
      {/* phone */}
      <button type="button" className="grid size-11 place-items-center rounded-control text-ink lg:hidden" aria-controls={panelId} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
        <span className="relative block h-4 w-6" aria-hidden="true">
          <span className={cn("absolute left-0 top-0 h-0.5 w-6 rounded bg-current transition-transform duration-(--motion-duration)", open && "translate-y-[7px] rotate-45")} />
          <span className={cn("absolute left-0 top-[7px] h-0.5 w-6 rounded bg-current transition-opacity duration-(--motion-duration)", open && "opacity-0")} />
          <span className={cn("absolute left-0 top-[14px] h-0.5 w-6 rounded bg-current transition-transform duration-(--motion-duration)", open && "-translate-y-[7px] -rotate-45")} />
        </span>
      </button>
      <div id={panelId} className={cn("fixed inset-x-0 bottom-0 top-(--nav-height) z-40 overflow-y-auto border-t border-border bg-surface px-page py-6 lg:hidden", open ? "block" : "hidden")}>
        <ul className="grid gap-1">
          {links.map((item) => (
            <li key={item.href} className="border-b border-border">
              <div className="flex items-center">
                <Link href={item.href} className="grow py-3.5 font-ui text-h4 font-bold text-ink no-underline">{item.label}</Link>
                {item.children?.length ? <button type="button" className="grid size-11 place-items-center rounded-control" aria-expanded={sub === item.href} aria-label={`Show ${item.label} pages`} onClick={() => setSub(sub === item.href ? null : item.href)}><FontAwesomeIcon icon={faChevronDown} className={cn("size-4 transition-transform duration-(--motion-duration)", sub === item.href && "rotate-180")} aria-hidden="true" /></button> : null}
              </div>
              {item.children?.length && sub === item.href ? (
                <ul className="mb-3 grid gap-0.5 pl-3">{item.children.map((c) => <li key={c.href}><Link href={c.href} className="block py-2 text-body text-ink-muted no-underline hover:text-ink">{c.label}</Link></li>)}</ul>
              ) : null}
            </li>
          ))}
        </ul>
        {cta && <div className="mt-6"><Button href={cta.href} block variant="dark" rel="noopener">{cta.label}</Button></div>}
      </div>
    </>
  );
}
