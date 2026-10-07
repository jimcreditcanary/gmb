import { getAllPages, getPosts } from "@/lib/content";
import { SITE, SITE_URL } from "@/lib/site";
export const dynamic = "force-static";
/** llms.txt: a plain-text map of the site for AI search / assistants. */
export function GET() {
  const pages = getAllPages().filter((p) => !p.frontmatter.noindex && p.frontmatter.template !== "post");
  const line = (p: { frontmatter: { title: string; slug: string; description: string } }) => `- [${p.frontmatter.title.replace(/ \| .*$/, "")}](${SITE_URL}${p.frontmatter.slug})${p.frontmatter.description ? `: ${p.frontmatter.description}` : ""}`;
  const by = (cat: string) => pages.filter((p) => p.frontmatter.category === cat).map(line).join("\n");
  const txt = `# ${SITE.brand}\n\n> ${SITE.regulatory.statement}\n\nMember-owned credit union for GMB trade union members and their families: ethical loans, savings accounts and money guidance. Canonical host: ${SITE_URL}\n\n## Loans\n${by("product-loan")}\n\n## Savings\n${by("product-savings")}\n\n## About, help and contact\n${by("hub")}\n${by("about")}\n${by("contact")}\n${by("utility")}\n${by("legal-regulatory")}\n\n## Blog\n${getPosts().map(line).join("\n")}\n`;
  return new Response(txt, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
