import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { getPosts, cardTitle, stripTitleSuffix, type Page } from "@/lib/content";
import { Section } from "@/components/ui/section";
import { Img } from "./Img";
import { Trustpilot } from "./Trustpilot";

/** Blog card (docs/design-system.md §Cards): image, title, excerpt, "Read More >" (copy kept). Whole card is the link. */
export function PostCard({ post, level = 3, featured }: { post: Page; level?: 2 | 3; featured?: boolean }) {
  const H = (`h${level}`) as "h2" | "h3";
  const fm = post.frontmatter;
  const img = fm.cardImage || fm.featuredImage;
  const title = cardTitle(fm);
  return (
    <li className={cn("group relative flex flex-col", featured && "md:col-span-2 lg:col-span-3 md:grid md:grid-cols-[3fr_2fr] md:items-center md:gap-8")}>
      <div className={cn("overflow-hidden rounded-media bg-surface-subtle", featured ? "aspect-[16/9]" : "aspect-[4/3]")}>
        {img && <Img src={img} alt={fm.cardImageAlt || fm.cardTitle || stripTitleSuffix(fm.title)} sizes={featured ? "(max-width: 768px) 100vw, 720px" : "(max-width: 640px) 100vw, 380px"} className="size-full object-cover transition-transform duration-(--motion-duration-slow) ease-standard group-hover:scale-[1.03]" />}
      </div>
      <div className={cn("flex grow flex-col pt-4", featured && "md:pt-0")}>
        <H className={cn("leading-snug group-hover:underline group-hover:decoration-brand group-hover:underline-offset-4", featured ? "font-display text-h2" : "font-ui text-h4 font-bold")}>{title}</H>
        {fm.excerpt && <p className={cn("mt-2 text-ink-muted", featured ? "text-body" : "text-small")}>{fm.excerpt}</p>}
        <p className="mt-auto pt-3"><Link href={fm.slug} className="font-ui text-small font-semibold text-ink underline decoration-brand-strong decoration-2 underline-offset-4 after:absolute after:inset-0 after:content-['']">Read More &gt;<span className="sr-only-text">: {title}</span></Link></p>
      </div>
    </li>
  );
}

/** `featuredFirst`: the newest post leads as a wide feature, the rest follow in the grid. */
export function PostList({ posts, level = 3, featuredFirst, cols = 3 }: { posts: Page[]; level?: 2 | 3; featuredFirst?: boolean; cols?: 3 | 4 }) {
  return <ul className={cn("grid gap-x-6 gap-y-10 sm:grid-cols-2", cols === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>{posts.map((p, i) => <PostCard key={p.frontmatter.slug} post={p} level={level} featured={featuredFirst && i === 0} />)}</ul>;
}

/** Latest posts strip. Generated, never stored as copy. */
export function RelatedPosts({ count = 3, exclude }: { count?: number; exclude?: string }) {
  const posts = getPosts().filter((p) => p.frontmatter.slug !== exclude).slice(0, count);
  return <Section tight><PostList posts={posts} /></Section>;
}

/** Home / resources "blog" block: heading + intro come from MDX, cards are generated. */
export function PostsOverview({ trustpilot, count = 4, children }: { trustpilot?: boolean; count?: number; children?: ReactNode }) {
  const kids = (Array.isArray(children) ? children : [children]).filter(Boolean);
  return (
    <Section tone="subtle">
      <div className="prose mb-block max-w-measure [&>p]:text-lead [&>p]:text-ink-muted">{kids}</div>
      <PostList posts={getPosts().slice(0, count)} cols={4} />
      {trustpilot && <div className="mx-auto mt-block flex max-w-[560px] justify-center"><Trustpilot /></div>}
    </Section>
  );
}

/** Numbered pagination, same URLs as WordPress (`/page/N/`). */
export function Pagination({ page, totalPages, base }: { page: number; totalPages: number; base: string }) {
  if (totalPages <= 1) return null;
  const href = (n: number) => (n === 1 ? base : `${base}page/${n}/`);
  const nums: (number | "…")[] = [];
  for (let n = 1; n <= totalPages; n++) {
    if (n === 1 || n === totalPages || Math.abs(n - page) <= 2 || (page <= 3 && n <= 6) || (page >= totalPages - 2 && n >= totalPages - 5)) nums.push(n);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  const pill = "inline-flex h-10 min-w-10 items-center justify-center rounded-control px-3 font-ui text-small font-semibold no-underline transition-colors duration-(--motion-duration)";
  return (
    <nav className="mt-block flex flex-wrap items-center justify-center gap-2" aria-label="Posts pagination">
      <h2 className="screen-reader-text">Posts pagination</h2>
      {page > 1 && <Link className={cn(pill, "border border-border text-ink hover:bg-surface-subtle")} href={href(page - 1)}>&lt; Newer</Link>}
      {nums.map((n, i) => n === "…" ? <span key={`d${i}`} className={cn(pill, "text-ink-subtle")}>…</span> : n === page ? <span key={n} aria-current="page" className={cn(pill, "bg-ink text-ink-inverse")}>{n}</span> : <Link key={n} className={cn(pill, "border border-border text-ink hover:bg-surface-subtle")} href={href(n)}>{n}</Link>)}
      {page < totalPages && <Link className={cn(pill, "border border-border text-ink hover:bg-surface-subtle")} href={href(page + 1)}>Older &gt;</Link>}
    </nav>
  );
}
