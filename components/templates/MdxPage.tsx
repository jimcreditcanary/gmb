import type { Page } from "@/lib/content";
import { Mdx } from "@/lib/mdx";
import { pageGraph } from "@/lib/jsonld";
import { JsonLd } from "./JsonLd";
import { PageHeader } from "@/components/blocks/PageHeader";

const wc = (s: string) => s.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

/** Generic content template: every section comes from the MDX, in order. Used by home, hub, product, about, contact, legal, faq, embed, campaign and generic pages. */
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

/** Blog post: header from frontmatter, body from MDX, latest posts strip generated. */
export function PostPage({ page }: { page: Page }) {
  const fm = page.frontmatter;
  return (
    <main className="main-layout" id="main">
      {fm.schema && <JsonLd data={fm.schema} />}
      <JsonLd data={pageGraph(fm, page.body, wc(page.body))} />
      <PageHeader colour={fm.headerColour || "yellow"} date={fm.date} image={fm.featuredImage} imageAlt={fm.featuredImageAlt || ""} imageWrap="wrap-blog">
        <h1>{fm.h1 || fm.title.replace(/ \| (GMBCU|GMB Credit Union).*$/, "")}</h1>
      </PageHeader>
      <section className="postsingle"><div className="outline">
        <article className="post type-post status-publish format-standard has-post-thumbnail hentry">
          <div className="data-content"><Mdx source={page.body} /></div>
        </article>
      </div></section>
    </main>
  );
}
