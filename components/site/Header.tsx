import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/site";
import { Container } from "@/components/ui/section";
import { Nav } from "./Nav";

/** Site header: logo, navigation, one button. Sticky so the nav is always one tap away on phones. */
export function Header() {
  return (
    <header id="site-header" className="sticky top-0 z-50 h-(--nav-height) border-b border-border bg-surface" role="banner">
      <Container className="flex h-full items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label={`${SITE.brand} home`}>
          <Image src={SITE.logo.header} alt={SITE.logo.headerAlt || SITE.shortName} width={128} height={56} priority className="h-11 w-auto" />
        </Link>
        <nav id="site-nav" aria-label="Main" className="flex items-center"><Nav items={SITE.nav} /></nav>
      </Container>
    </header>
  );
}
