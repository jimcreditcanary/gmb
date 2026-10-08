import { displayTitle, type Page } from "@/lib/content";
import { Mdx } from "@/lib/mdx";
import { pageGraph } from "@/lib/jsonld";
import { JsonLd } from "./JsonLd";
import { UtmFields } from "./UtmFields";
import { LinkButton } from "@/lib/with-context";
import { Container } from "@/components/ui/section";
import { toneClass } from "@/lib/tones";

/** Paid-media landing template: no nav, one CTA, representative APR + risk warning above the fold, UTMs carried into forms. */
export function LandingPage({ page }: { page: Page }) {
  const fm = page.frontmatter; const l = fm.landing!;
  return (
    <main id="main" className="landing">
      <JsonLd data={pageGraph(fm, page.body, page.body.split(/\s+/).length)} />
      <section className={`py-(--hero-padding-y) ${toneClass.resources}`}>
        <Container>
          <div className="prose max-w-measure [&>h1]:text-h1">
            <h1>{displayTitle(fm)}</h1>
            {fm.description && <p className="text-lead text-ink-muted">{fm.description}</p>}
            <p className="font-display text-h4">{l.repApr}</p>
            <p className="text-small text-ink-muted">{l.riskWarning}</p>
            <p><LinkButton href={l.cta.href} rel="noopener" size="lg">{l.cta.label}</LinkButton></p>
            <UtmFields />
          </div>
        </Container>
      </section>
      <Mdx source={page.body} />
    </main>
  );
}
