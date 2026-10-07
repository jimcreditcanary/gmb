import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPages, getPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { MdxPage, PostPage } from "@/components/templates/MdxPage";
import { LandingPage } from "@/components/templates/LandingPage";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPages().map((p) => ({ slug: p.frontmatter.slug.split("/").filter(Boolean) }));
}

const toSlug = (parts?: string[]) => "/" + (parts?.length ? parts.join("/") + "/" : "");

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await params; const page = getPage(toSlug(slug)); if (!page) return {};
  return pageMetadata(page.frontmatter);
}

export default async function ContentPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params; const page = getPage(toSlug(slug)); if (!page) notFound();
  if (page.frontmatter.template === "post") return <PostPage page={page} />;
  if (page.frontmatter.template === "landing") return <LandingPage page={page} />;
  return <MdxPage page={page} />;
}
