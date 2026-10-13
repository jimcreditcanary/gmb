import { displayTitle, type Page } from "@/lib/content";
import { Mdx } from "@/lib/mdx";
import { pageGraph } from "@/lib/jsonld";
import { JsonLd } from "./JsonLd";
import { PageHeader } from "@/components/blocks/PageHeader";
import { Container } from "@/components/ui/section";

const wc = (s: string) => s.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

/** Content template: every section comes from the MDX, in order (home, about, product-category, product, prizesaver, resources, contact, legal, campaign). */
export function MdxPage({ page }: { page: Page }) {
  const fm = page.frontmatter;
  return (
    <main id="main">
      {fm.schema && <JsonLd data={fm.schema} />}
      <JsonLd data={pageGraph(fm, page.body, wc(page.body))} />
      <Mdx source={page.body} />
    </main>
  );
}

/** Blog post: hero from frontmatter (H1 = displayTitle, date, featured image), body as a reading column. */
export function PostPage({ page }: { page: Page }) {
  const fm = page.frontmatter;
  return (
    <main id="main">
      {fm.schema && <JsonLd data={fm.schema} />}
      <JsonLd data={pageGraph(fm, page.body, wc(page.body))} />
      <PageHeader colour={fm.headerColour || "yellow"} date={fm.date} image={fm.featuredImage} imageAlt={fm.featuredImageAlt || ""}>
        <h1>{displayTitle(fm)}</h1>
      </PageHeader>
      <article className="py-section">
        <Container>
          <div className="prose post-body mx-auto max-w-measure text-lg [&>h2]:text-h3 [&>h3]:text-h4 [&>h4]:text-body [&>p:first-child]:text-lead"><Mdx source={page.body} /></div>
        </Container>
      </article>
    </main>
  );
}
