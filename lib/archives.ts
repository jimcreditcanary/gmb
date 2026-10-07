import fs from "node:fs";
import path from "node:path";
import { getPostsPage, getPostsByTag, POSTS_PER_PAGE } from "./content";
import { SITE_URL } from "./site";

type ArchiveMeta = { title: string; description: string; h1: string; intro?: string; image?: string; label?: string; schema?: Record<string, unknown> | null; pagedTitle?: string | null; ogTitle?: string };
/** Title of page n of an archive, as Yoast produced it ("… | Page 2 of 8 | GMBCU"); page 1 and archives without that pattern keep the base title. */
export const archiveTitle = (m: ArchiveMeta, n: number, total: number) => (n > 1 && m.pagedTitle ? m.pagedTitle.replace("{n}", String(n)).replace("{total}", String(total)) : m.title);
/** Yoast graph for an archive page, URLs rewritten for pagination. */
export const archiveSchema = (m: ArchiveMeta, slug: string, base: string) => (m.schema ? JSON.parse(JSON.stringify(m.schema).split(SITE_URL + base).join(SITE_URL + slug)) : null);
/** Titles/descriptions/intros of the generated archive pages, captured verbatim from the live site. */
export const ARCHIVES: Record<string, ArchiveMeta> = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/_site/archives.json"), "utf8"));

export const blog = (n: number) => ({ ...getPostsPage(n), base: "/our-blog/", slug: n === 1 ? "/our-blog/" : `/our-blog/page/${n}/` });
export const category = (cat: string, n: number) => ({ ...getPostsPage(n), base: `/category/${cat}/`, slug: n === 1 ? `/category/${cat}/` : `/category/${cat}/page/${n}/` }); // single category 'uncategorised' holds every post
export const tag = (t: string) => { const posts = getPostsByTag(t); return { posts, page: 1, totalPages: Math.ceil(posts.length / POSTS_PER_PAGE), base: `/tag/${t}/`, slug: `/tag/${t}/` }; };
