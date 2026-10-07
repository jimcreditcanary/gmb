import type { Page } from "@/lib/content";
import { PageHeader } from "@/components/blocks/PageHeader";
import { PostList, Pagination } from "@/components/blocks/Posts";
import { JsonLd } from "./JsonLd";
import { organization, website, breadcrumbs } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";

type Props = { title: string; intro?: string; image?: string; posts: Page[]; page: number; totalPages: number; base: string; slug: string; label?: string; yoast?: Record<string, unknown> | null };

/** Blog index / category / tag archive, same DOM as the WP `blog` and `archive` templates. */
export function ArchivePage({ title, intro, image, posts, page, totalPages, base, slug, label, yoast }: Props) {
  return (
    <main className="main-layout" id="main">
      {yoast && <JsonLd data={yoast} />}
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [...organization(), website(), { "@type": "CollectionPage", "@id": SITE_URL + slug, url: SITE_URL + slug, name: title, isPartOf: { "@id": `${SITE_URL}/#website` }, inLanguage: "en-GB", breadcrumb: { "@id": `${SITE_URL}${slug}#breadcrumb` } }, breadcrumbs(slug, title)] }} />
      <PageHeader colour="yellow" label={label} trustpilot image={image}>
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </PageHeader>
      <section className="posts"><div className="outline">
        <PostList posts={posts} level={2} />
        <Pagination page={page} totalPages={totalPages} base={base} />
      </div></section>
    </main>
  );
}
