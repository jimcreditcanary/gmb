import type { Metadata } from "next";
import type { Frontmatter } from "./frontmatter";
import { SITE, SITE_URL, absolute } from "./site";

/** Metadata built from frontmatter: titles, descriptions, canonicals and OG values are the live site's, verbatim. */
export function pageMetadata(fm: Frontmatter): Metadata {
  const noindex = fm.noindex || !SITE.isProduction;
  const og = fm.ogImage ? absolute(fm.ogImage) : `${SITE_URL}/og/?title=${encodeURIComponent(fm.title.replace(/ \| .*$/, ""))}&slug=${encodeURIComponent(fm.slug)}`;
  return {
    title: { absolute: fm.title },
    description: fm.description || undefined,
    alternates: { canonical: fm.canonical },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    openGraph: { locale: "en_GB", type: fm.template === "post" ? "article" : "website", title: fm.ogTitle || fm.title, description: fm.ogDescription || fm.description || undefined, url: fm.canonical, siteName: SITE.shortName, images: [{ url: og }], ...(fm.template === "post" ? { publishedTime: fm.publishedAt, modifiedTime: fm.updatedAt } : { modifiedTime: fm.updatedAt }) },
    twitter: { card: "summary_large_image", title: fm.ogTitle || fm.title, description: fm.ogDescription || fm.description || undefined, images: [og] },
    other: fm.updatedAt && fm.template !== "post" ? { "article:modified_time": fm.updatedAt } : undefined,
  };
}

export function archiveMetadata(title: string, description: string, slug: string, page = 1): Metadata {
  const noindex = page > 1 || !SITE.isProduction;
  return { title: { absolute: title }, description, alternates: { canonical: SITE_URL + slug }, robots: noindex ? { index: false, follow: true } : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 }, openGraph: { locale: "en_GB", type: "website", title, description, url: SITE_URL + slug, siteName: SITE.shortName }, twitter: { card: "summary_large_image" } };
}
