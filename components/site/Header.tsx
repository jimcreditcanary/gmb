import Link from "next/link";
import Image from "next/image";
import { SITE, type NavItem } from "@/lib/site";
import { MenuToggle } from "./MenuToggle";

function Item({ item, i }: { item: NavItem; i: number }) {
  const hasKids = !!item.children?.length;
  const external = item.href.startsWith("http");
  const A = external ? "a" : Link;
  return (
    <li className={`mega-menu-item mega-menu-item-type-post_type mega-menu-item-object-page${hasKids ? " mega-menu-item-has-children mega-align-bottom-left mega-menu-flyout" : ""} mega-menu-item-${i}`} id={`mega-menu-item-${i}`}>
      <A className="mega-menu-link" href={item.href} {...(hasKids ? { "aria-expanded": false, "aria-controls": `mega-sub-menu-${i}` } : {})} {...(external ? { rel: "noopener" } : {})}>
        {item.label}{hasKids && <span className="mega-indicator" aria-hidden="true"></span>}
      </A>
      {hasKids && (
        <ul className="mega-sub-menu" id={`mega-sub-menu-${i}`}>
          {item.children!.map((c, j) => (
            <li key={c.href} className={`mega-menu-item mega-menu-item-type-post_type mega-menu-item-object-page mega-menu-item-${i}${j}`}><Link className="mega-menu-link" href={c.href}>{c.label}</Link></li>
          ))}
        </ul>
      )}
    </li>
  );
}

/** Site header: same DOM as the WordPress theme + Max Mega Menu so the ported CSS applies. Hover fly-outs are CSS; mobile toggle is a small client island. */
export function Header() {
  return (
    <header id="site-header" className="site-header" role="banner">
      <div className="outline">
        <div className="wrap-logo"><Link href="/"><Image src={SITE.logo.header} alt={SITE.logo.headerAlt || "GMBCU"} width={160} height={70} priority /></Link></div>
      </div>
      <nav id="site-nav" className="site-nav" aria-label="Main">
        <div id="mega-menu-wrap-menu-header" className="mega-menu-wrap">
          <MenuToggle />
          <ul id="mega-menu-menu-header" className="mega-menu max-mega-menu mega-menu-horizontal mega-keyboard-navigation" data-event="hover_intent" data-effect="fade_up" data-breakpoint="630">
            {SITE.nav.map((item, i) => <Item key={item.href} item={item} i={i + 1} />)}
          </ul>
        </div>
      </nav>
    </header>
  );
}
