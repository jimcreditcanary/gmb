import { displayTitle, type Page } from "@/lib/content";
import { LinkButton } from "@/lib/with-context";
import { Mdx } from "@/lib/mdx";
import { pageGraph } from "@/lib/jsonld";
import { JsonLd } from "./JsonLd";
import { UtmFields } from "./UtmFields";

/**
 * Paid-media landing template (new, decision: Phase 3 brief §6).
 * No header nav, one CTA, representative APR + risk warning rendered ABOVE the fold, UTM parameters carried into any form as hidden fields.
 */
export function LandingPage({ page }: { page: Page }) {
  const fm = page.frontmatter; const l = fm.landing!;
  return (
    <main className="main-layout landing" id="main">
      <JsonLd data={pageGraph(fm, page.body, page.body.split(/\s+/).length)} />
      <section className="header-page yellow landing-hero"><div className="outline">
        <div className="data-content">
          <h1>{displayTitle(fm)}</h1>
          {fm.description && <p>{fm.description}</p>}
          <p className="rep-apr"><strong>{l.repApr}</strong></p>
          <p className="risk-warning">{l.riskWarning}</p>
          <p><LinkButton href={l.cta.href} rel="noopener">{l.cta.label}</LinkButton></p>
          <UtmFields />
        </div>
      </div></section>
      <Mdx source={page.body} />
    </main>
  );
}
