import Link from "next/link";
import type { ReactNode } from "react";
import { getPosts, cardTitle, stripTitleSuffix, type Page } from "@/lib/content";
import { Img } from "./Img";
import { Trustpilot } from "./Trustpilot";

/** One blog card, identical DOM to the theme's `.list-posts li`. */
export function PostCard({ post, level = 3 }: { post: Page; level?: 2 | 3 }) {
  const H = (`h${level}`) as "h2" | "h3";
  const fm = post.frontmatter;
  const img = fm.cardImage || fm.featuredImage;
  return (
    <li>
      <div className="data-post">
        <div className="featured-image">
          <picture className="picture-image">
            <Link href={fm.slug}>{img && <Img src={img} alt={fm.cardImageAlt || fm.cardTitle || stripTitleSuffix(fm.title)} sizes="(max-width: 640px) 100vw, 300px" />}</Link>
          </picture>
        </div>
        <div className="wrap">
          <div className="data-title"><H className="h4">{cardTitle(fm)}</H></div>
          <div className="data-excerpt">{fm.excerpt}</div>
          <div className="data-link"><Link href={fm.slug}>Read More &gt;<span className="sr-only-text">: {cardTitle(fm)}</span></Link></div>
        </div>
      </div>
    </li>
  );
}

export function PostList({ posts, level = 3 }: { posts: Page[]; level?: 2 | 3 }) {
  return <ul className="list-posts">{posts.map((p) => <PostCard key={p.frontmatter.slug} post={p} level={level} />)}</ul>;
}

/** Latest posts strip used under product/hub pages (`section.posts`). Generated, never stored as copy. */
export function RelatedPosts({ count = 3, exclude }: { count?: number; exclude?: string }) {
  const posts = getPosts().filter((p) => p.frontmatter.slug !== exclude).slice(0, count);
  return <section className="posts"><div className="outline"><PostList posts={posts} /></div></section>;
}

/** Home "Money smart advice" block: heading + intro come from MDX, cards are generated. */
export function PostsOverview({ trustpilot, count = 4, children }: { trustpilot?: boolean; count?: number; children?: ReactNode }) {
  const kids = (Array.isArray(children) ? children : [children]).filter(Boolean);
  const [title, ...rest] = kids;
  return (
    <section className="posts-overview"><div className="outline">
      <div className="row">
        <div className="column column-header"><div className="data-title">{title}</div></div>
        <div className="column column-header"><div className="data-header">{rest}</div></div>
      </div>
      <div className="wrap-posts"><PostList posts={getPosts().slice(0, count)} /></div>
      <div className="data-footer"><p></p>{trustpilot && <Trustpilot />}<p></p></div>
    </div></section>
  );
}

/** WordPress-style numbered pagination (same classes as `the_posts_pagination`). */
export function Pagination({ page, totalPages, base }: { page: number; totalPages: number; base: string }) {
  if (totalPages <= 1) return null;
  const href = (n: number) => (n === 1 ? base : `${base}page/${n}/`);
  const nums: (number | "…")[] = [];
  for (let n = 1; n <= totalPages; n++) {
    if (n === 1 || n === totalPages || Math.abs(n - page) <= 2 || (page <= 3 && n <= 6) || (page >= totalPages - 2 && n >= totalPages - 5)) nums.push(n);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  return (
    <nav className="navigation pagination" aria-label="Posts pagination">
      <h2 className="screen-reader-text">Posts pagination</h2>
      <div className="nav-links">
        {page > 1 && <Link className="prev page-numbers" href={href(page - 1)}>&lt; <span className="nav-prev-text">Newer</span></Link>}
        {nums.map((n, i) => n === "…" ? <span key={`d${i}`} className="page-numbers dots">…</span> : n === page ? <span key={n} aria-current="page" className="page-numbers current"> {n}</span> : <Link key={n} className="page-numbers" href={href(n)}> {n}</Link>)}
        {page < totalPages && <Link className="next page-numbers" href={href(page + 1)}><span className="nav-next-text">Older</span> &gt;</Link>}
      </div>
    </nav>
  );
}
