import { notFound } from "next/navigation";
import { ArchivePage } from "@/components/templates/ArchivePage";
import { archiveMetadata } from "@/lib/seo";
import { ARCHIVES, category, archiveTitle } from "@/lib/archives";
import { archiveSchema } from "@/lib/archives";
import { getPostsPage } from "@/lib/content";
export const dynamicParams = false;
export function generateStaticParams() { const { totalPages } = getPostsPage(1); return Array.from({ length: totalPages - 1 }, (_, i) => ({ cat: "uncategorised", n: String(i + 2) })); }
export async function generateMetadata({ params }: { params: Promise<{ cat: string; n: string }> }) { const { cat, n } = await params; const m = ARCHIVES[`/category/${cat}/`]; return m ? archiveMetadata(archiveTitle(m, Number(n), getPostsPage(1).totalPages), m.description, `/category/${cat}/page/${n}/`, Number(n)) : {}; }
export default async function CategoryPage({ params }: { params: Promise<{ cat: string; n: string }> }) { const { cat, n } = await params; const m = ARCHIVES[`/category/${cat}/`]; if (!m) notFound(); const a = category(cat, Number(n)); if (!a.posts.length) notFound(); return <ArchivePage title={m.h1} intro={m.intro} image={m.image} label={m.label} {...a} yoast={archiveSchema(m, a.slug, a.base)} />; }
