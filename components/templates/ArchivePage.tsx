import type { Page } from "@/lib/content";
import { PageHeader } from "@/components/blocks/PageHeader";
import { PostList, Pagination } from "@/components/blocks/Posts";
import { Section } from "@/components/ui/section";
import { JsonLd } from "./JsonLd";
import { organization, website, breadcrumbs } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";

type Props = { title: string; intro?: string; image?: string; posts: Page[]; page: number; totalPages: number; base: string; slug: string; label?: string; yoast?: Record<string, unknown> | null };

/** Blog index / category / tag archive: hero, featured newest post on page 1, 3-up grid, pagination. */
export function ArchivePage({ title, intro, image, posts, page, totalPages, base, slug, label, yoast }: Props) {
  return (
    <main id="main">
      {yoast && <JsonLd data={yoast} />}
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [...organization(), website(), { "@type": "CollectionPage", "@id": SITE_URL + slug, url: SITE_URL + slug, name: title, isPartOf: { "@id": `${SITE_URL}/#website` }, inLanguage: "en-GB", breadcrumb: { "@id": `${SITE_URL}${slug}#breadcrumb` } }, breadcrumbs(slug, title)] }} />
      <PageHeader colour="yellow" label={label} trustpilot image={image}>
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </PageHeader>
      <Section>
        <PostList posts={posts} level={2} featuredFirst={page === 1} />
        <Pagination page={page} totalPages={totalPages} base={base} />
      </Section>
    </main>
  );
}
