import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import * as blocks from "@/components/blocks";
import { Img } from "@/components/blocks/Img";
import { describeTarget, isGenericLinkText } from "@/lib/linkcontext";

/** Generic link text ("here", "Learn more") gets a visually hidden description of the target: no visible change, descriptive for screen readers and search engines (decision 2026-10-07 §4.3). */
function withContext(href: string, children: ReactNode): ReactNode {
  const text = typeof children === "string" ? children : Array.isArray(children) && children.every((c) => typeof c === "string") ? children.join("") : null;
  if (text === null || !isGenericLinkText(text)) return children;
  const ctx = describeTarget(href); if (!ctx) return children;
  return <>{children}<span className="sr-only-text">: {ctx}</span></>;
}

/** Markdown element overrides: internal links become <Link>, images get dimensions. Copy is untouched. */
function A({ href = "", children, ...rest }: ComponentProps<"a">) {
  const internal = href.startsWith("/") && !/\.[a-z0-9]{2,4}$/i.test(href);
  const kids = withContext(href, children);
  if (internal) return <Link href={href} {...rest}>{kids}</Link>;
  const external = /^https?:\/\//.test(href) && !href.includes("gmbcreditunion.com");
  return <a href={href} {...rest} rel={rest.rel || (external ? "noopener" : undefined)}>{kids}</a>;
}
function MdImg({ src = "", alt = "" }: ComponentProps<"img">) {
  return <Img src={typeof src === "string" ? src : ""} alt={alt} />;
}

export const mdxComponents = { ...blocks, a: A, A, img: MdImg } as Record<string, unknown>;

export function Mdx({ source, extra }: { source: string; extra?: Record<string, unknown> }): ReactNode {
  return <MDXRemote source={source} components={{ ...mdxComponents, ...(extra || {}) } as never} options={{ mdxOptions: { remarkPlugins: [] /* no GFM: its autolink-literal turned bare www. text inside links into nested anchors */, format: "mdx" }, blockJS: false /* content is repo-controlled; expression props (arrays/objects) are needed */, blockDangerousJS: true }} />;
}
