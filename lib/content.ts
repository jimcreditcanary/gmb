import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { frontmatterSchema, type Frontmatter } from "./frontmatter";

export type Page = { frontmatter: Frontmatter; body: string; file: string };

/** "Member Loan | GMB Credit Union Loans" → "Member Loan". The <title> suffix never appears on the page. */
export const stripTitleSuffix = (title: string) => title.replace(/ \| (GMBCU|GMB Credit Union).*$/, "");
/** The page's visible H1: the recorded live H1 when it differed from the title, else the title without its suffix. */
export const displayTitle = (fm: Pick<Frontmatter, "title" | "h1">) => fm.h1 || stripTitleSuffix(fm.title);
/** Blog card title: the card wording on the live archive when it differed in case from the post's own H1. */
export const cardTitle = (fm: Pick<Frontmatter, "title" | "h1" | "cardTitle">) => fm.cardTitle || displayTitle(fm);

const CONTENT_DIR = path.join(process.cwd(), "content");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("_")) continue; // _site data, not pages
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.name.endsWith(".mdx")) out.push(p);
  }
  return out;
}

let cache: Page[] | null = null;

/** Every content page, validated. Cached per process (build or server). */
export function getAllPages(): Page[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const pages = walk(CONTENT_DIR).map((file) => {
    const raw = fs.readFileSync(file, "utf8");
    const { data, content } = matter(raw);
    const parsed = frontmatterSchema.safeParse(data);
    if (!parsed.success) {
      const rel = path.relative(process.cwd(), file);
      const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n");
      throw new Error(`Invalid frontmatter in ${rel}:\n${issues}`);
    }
    return { frontmatter: parsed.data, body: content, file: path.relative(process.cwd(), file) };
  });
  const seen = new Map<string, string>();
  for (const p of pages) {
    const dup = seen.get(p.frontmatter.slug);
    if (dup) throw new Error(`Duplicate slug ${p.frontmatter.slug} in ${dup} and ${p.file}`);
    seen.set(p.frontmatter.slug, p.file);
  }
  cache = pages;
  return pages;
}

export function getPage(slug: string): Page | undefined {
  const s = slug.endsWith("/") ? slug : slug + "/";
  return getAllPages().find((p) => p.frontmatter.slug === s);
}

/** Blog posts, newest first (matches the WordPress archive order). */
export function getPosts(): Page[] {
  return getAllPages()
    .filter((p) => p.frontmatter.template === "post")
    .sort((a, b) => (b.frontmatter.publishedAt || "").localeCompare(a.frontmatter.publishedAt || ""));
}

export const POSTS_PER_PAGE = 8; // WordPress archive page size on the live site (8 pages for 63 posts)

export function getPostsPage(n: number) {
  const posts = getPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  return { posts: posts.slice((n - 1) * POSTS_PER_PAGE, n * POSTS_PER_PAGE), totalPages, page: n };
}

export function getPostsByTag(tag: string) {
  return getPosts().filter((p) => p.frontmatter.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase()));
}

export function getTags(): string[] {
  return [...new Set(getPosts().flatMap((p) => p.frontmatter.tags))];
}
