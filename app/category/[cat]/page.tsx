import { notFound } from "next/navigation";
import { ArchivePage } from "@/components/templates/ArchivePage";
import { archiveMetadata } from "@/lib/seo";
import { ARCHIVES, category } from "@/lib/archives";
import { archiveSchema } from "@/lib/archives";
export const dynamicParams = false;
export function generateStaticParams() { return [{ cat: "uncategorised" }]; }
export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }) { const { cat } = await params; const m = ARCHIVES[`/category/${cat}/`]; return m ? archiveMetadata(m.title, m.description, `/category/${cat}/`) : {}; }
export default async function Category({ params }: { params: Promise<{ cat: string }> }) { const { cat } = await params; const m = ARCHIVES[`/category/${cat}/`]; if (!m) notFound(); const a = category(cat, 1); return <ArchivePage title={m.h1} intro={m.intro} image={m.image} label={m.label} {...a} yoast={archiveSchema(m, a.slug, a.base)} />; }
