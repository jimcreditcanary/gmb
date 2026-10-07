import { notFound } from "next/navigation";
import { ArchivePage } from "@/components/templates/ArchivePage";
import { archiveMetadata } from "@/lib/seo";
import { ARCHIVES, tag } from "@/lib/archives";
import { archiveSchema } from "@/lib/archives";
import { getTags } from "@/lib/content";
export const dynamicParams = false;
export function generateStaticParams() { return getTags().map((t) => ({ tag: t.toLowerCase() })); }
export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) { const { tag: t } = await params; const m = ARCHIVES[`/tag/${t}/`]; return m ? archiveMetadata(m.title, m.description, `/tag/${t}/`) : {}; }
export default async function Tag({ params }: { params: Promise<{ tag: string }> }) { const { tag: t } = await params; const m = ARCHIVES[`/tag/${t}/`]; if (!m) notFound(); const a = tag(t); return <ArchivePage title={m.h1} intro={m.intro} image={m.image} label={m.label} {...a} yoast={archiveSchema(m, a.slug, a.base)} />; }
