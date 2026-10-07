import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faYoutube, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { SITE } from "@/lib/site";
import { NewsletterForm } from "./NewsletterForm";

const icons = { "fa-facebook-f": faFacebookF, "fa-youtube": faYoutube, "fa-instagram": faInstagram } as const;
const labels = { "fa-facebook-f": "Facebook", "fa-youtube": "YouTube", "fa-instagram": "Instagram" } as const;

function Menu({ id, items }: { id: string; items: { label: string; href: string }[] }) {
  return (
    <nav id={id} className="footer-nav" aria-label={id === "footer-nav-left" ? "Footer" : "Footer secondary"}>
      <div className={`menu-${id.replace("nav", "menu").replace("footer-", "footer-")}-container`}>
        <ul className="menu">{items.map((it) => <li key={it.href} className="menu-item">{it.href.startsWith("http") ? <a href={it.href} rel="noopener">{it.label}</a> : <Link href={it.href}>{it.label}</Link>}</li>)}</ul>
      </div>
    </nav>
  );
}

/** Site footer: same DOM as the theme (logo, socials, two menus, newsletter, FSCS badge) + the approved regulatory statement (locked). */
export function Footer() {
  const f = SITE.footer; const r = SITE.regulatory;
  return (
    <footer id="site-footer" className="site-footer">
      <div className="outline">
        <div className="row">
          <div className="column column-logo">
            <div className="wrap-logo"><Image src={SITE.logo.footer} alt={SITE.logo.footerAlt || "GMBCU"} width={130} height={70} /></div>
            <div className="wrap-social">
              <ul className="list-social">
                {f.socials.map((s) => { const key = s.icon.split(" ").find((c) => c in icons) as keyof typeof icons | undefined; return (
                  <li key={s.href}><a href={s.href} target="_blank" rel="noopener" aria-label={key ? labels[key] : s.href}>{key && <FontAwesomeIcon icon={icons[key]} />}</a></li>
                ); })}
              </ul>
            </div>
          </div>
          <div className="column column-nav"><Menu id="footer-nav-left" items={f.left} /></div>
          <div className="column column-nav"><Menu id="footer-nav-right" items={f.right} /></div>
          <div className="column column-newsletter">
            <div className="wrap-newsletter">
              <label htmlFor="mce-EMAIL"><FontAwesomeIcon icon={faEnvelope} />{f.newsletter.heading || "Stay up to date with GMBCU"}</label>
              <NewsletterForm />
            </div>
            <div className="wrap-fscs"><a href={f.fscs.href} target="_blank" rel="noopener" aria-label="Financial Services Compensation Scheme (opens in a new tab)"><Image src={f.fscs.image} alt={f.fscs.alt || "FSCS Protected"} width={120} height={60} /></a></div>
          </div>
        </div>
        <div className="row">
          <div className="column">
            <p className="regulatory-statement" data-locked="true">{r.statement}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
