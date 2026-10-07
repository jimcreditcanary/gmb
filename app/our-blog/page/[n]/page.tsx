import { notFound } from "next/navigation";
import { ArchivePage } from "@/components/templates/ArchivePage";
import { archiveMetadata } from "@/lib/seo";
import { ARCHIVES, blog, archiveTitle } from "@/lib/archives";
import { archiveSchema } from "@/lib/archives";
import { getPostsPage } from "@/lib/content";
export const dynamicParams = false;
export function generateStaticParams() { const { totalPages } = getPostsPage(1); return Array.from({ length: totalPages - 1 }, (_, i) => ({ n: String(i + 2) })); }
const meta = ARCHIVES["/our-blog/"];
export async function generateMetadata({ params }: { params: Promise<{ n: string }> }) { const { n } = await params; return archiveMetadata(archiveTitle(meta, Number(n), getPostsPage(1).totalPages), meta.description, `/our-blog/page/${n}/`, Number(n)); }
export default async function BlogPage({ params }: { params: Promise<{ n: string }> }) { const n = Number((await params).n); const a = blog(n); if (!a.posts.length) notFound(); return <ArchivePage title={meta.h1} intro={meta.intro} image={meta.image} label={meta.label} {...a} yoast={archiveSchema(meta, a.slug, a.base)} />; }
