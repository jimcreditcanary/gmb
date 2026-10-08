import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faYoutube, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { SITE } from "@/lib/site";
import { Container } from "@/components/ui/section";
import { NewsletterForm } from "./NewsletterForm";

const icons = { "fa-facebook-f": faFacebookF, "fa-youtube": faYoutube, "fa-instagram": faInstagram } as const;
const labels = { "fa-facebook-f": "Facebook", "fa-youtube": "YouTube", "fa-instagram": "Instagram" } as const;

function Menu({ id, items, title }: { id: string; items: { label: string; href: string }[]; title: string }) {
  return (
    <nav id={id} aria-label={title}>
      <ul className="grid gap-2.5">{items.map((it) => <li key={it.href}>{it.href.startsWith("http") ? <a href={it.href} rel="noopener" className="font-display text-small text-ink-inverse no-underline hover:underline">{it.label}</a> : <Link href={it.href} className="font-display text-small text-ink-inverse no-underline hover:underline">{it.label}</Link>}</li>)}</ul>
    </nav>
  );
}

/** Site footer (docs/design-system.md §Footer): logo + socials, two menus, newsletter, FSCS badge, regulatory statement (locked). */
export function Footer() {
  const f = SITE.footer; const r = SITE.regulatory;
  return (
    <footer id="site-footer" className="on-inverse bg-surface-inverse py-section text-ink-inverse">
      <Container>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.6fr]">
          <div>
            <Image src={SITE.logo.footer} alt={SITE.logo.footerAlt || SITE.shortName} width={130} height={70} className="h-14 w-auto" />
            <ul className="mt-6 flex gap-3">
              {f.socials.map((s) => { const key = s.icon.split(" ").find((c) => c in icons) as keyof typeof icons | undefined; return (
                <li key={s.href}><a href={s.href} target="_blank" rel="noopener" aria-label={key ? labels[key] : s.href} className="grid size-11 place-items-center rounded-full bg-brand-strong text-ink-inverse transition-colors duration-(--motion-duration) hover:bg-brand-hover">{key && <FontAwesomeIcon icon={icons[key]} className="size-4" />}</a></li>
              ); })}
            </ul>
          </div>
          <Menu id="footer-nav-left" items={f.left} title="Footer" />
          <Menu id="footer-nav-right" items={f.right} title="Footer secondary" />
          <div>
            <p className="mb-3 font-display text-h4">{f.newsletter.heading || "Stay up to date with GMBCU"}</p>
            <NewsletterForm />
            <a href={f.fscs.href} target="_blank" rel="noopener" aria-label="Financial Services Compensation Scheme (opens in a new tab)" className="mt-8 block w-[106px]">{/* eslint-disable-next-line @next/next/no-img-element -- 7 KB SVG, eager: lazy-loading left the badge as a 32px placeholder in some captures */}
              <img src={f.fscs.image} alt={f.fscs.alt || "FSCS Protected"} width={106} height={96} loading="eager" decoding="async" style={{ width: 106, height: 96, maxWidth: "none" }} /></a>
          </div>
        </div>
        <p className="regulatory-statement mt-12 max-w-[90ch] border-t border-ink-inverse/15 pt-6 text-caption leading-relaxed text-ink-inverse-muted" data-locked="true">{r.statement}</p>
      </Container>
    </footer>
  );
}
