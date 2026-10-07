import { getAllPages } from "./content";

const GENERIC = /^(learn more|read more|find out more|here|click here|more|more info|this link|visit|see more|download|apply now|get started|browse)\.?$/i;

/** Human description of a link target, used as visually hidden context after generic link text ("here", "Learn more"). */
export function describeTarget(href: string): string | undefined {
  try {
    if (href.startsWith("/")) {
      const page = getAllPages().find((p) => p.frontmatter.slug === (href.endsWith("/") ? href : href + "/"));
      if (page) return page.frontmatter.title.replace(/ \| .*$/, "");
      const m = href.match(/\/([^/]+)\.(pdf|docx?|xlsx?)$/i);
      if (m) return m[1].replace(/[-_]+/g, " ").replace(/\d{4}x\d{3,4}/g, "").trim() + ` (${m[2].toUpperCase()})`;
      return undefined;
    }
    const u = new URL(href);
    return u.hostname.replace(/^www\./, "");
  } catch { return undefined; }
}

export const isGenericLinkText = (t: string) => GENERIC.test(t.replace(/\s+/g, " ").replace(/[>›»]+$/, "").trim());
