import { displayTitle, type Page } from "@/lib/content";
import { Mdx } from "@/lib/mdx";
import { pageGraph } from "@/lib/jsonld";
import { JsonLd } from "./JsonLd";
import { PageHeader } from "@/components/blocks/PageHeader";

const wc = (s: string) => s.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

/** Content template: every section comes from the MDX, in order. Used by home, about, product-category, product, prizesaver, resources, contact, legal and campaign pages (docs/templates.md). */
export function MdxPage({ page }: { page: Page }) {
  const fm = page.frontmatter;
  return (
    <main className="main-layout" id="main">
      {fm.schema && <JsonLd data={fm.schema} />}
      <JsonLd data={pageGraph(fm, page.body, wc(page.body))} />
      <Mdx source={page.body} />
    </main>
  );
}

/** Blog post (template `post`): hero from frontmatter (H1 = displayTitle), body from MDX with h2/h3/h4 sections. */
export function PostPage({ page }: { page: Page }) {
  const fm = page.frontmatter;
  return (
    <main className="main-layout" id="main">
      {fm.schema && <JsonLd data={fm.schema} />}
      <JsonLd data={pageGraph(fm, page.body, wc(page.body))} />
      <PageHeader colour={fm.headerColour || "yellow"} date={fm.date} image={fm.featuredImage} imageAlt={fm.featuredImageAlt || ""} imageWrap="wrap-blog">
        <h1>{displayTitle(fm)}</h1>
      </PageHeader>
      <section className="postsingle"><div className="outline">
        <article className="post type-post status-publish format-standard has-post-thumbnail hentry">
          <div className="data-content"><Mdx source={page.body} /></div>
        </article>
      </div></section>
    </main>
  );
}
