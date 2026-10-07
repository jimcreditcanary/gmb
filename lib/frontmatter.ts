import { z } from "zod";

/**
 * Frontmatter contract for every file under /content.
 * The build fails with a readable message if a file does not satisfy this (see scripts/validate-content.ts).
 */
/**
 * Page templates (docs/templates.md). One per page; the template fixes the heading outline and the blocks a page is built from.
 *  home · about · product-category (loans/savings hubs) · product · prizesaver · resources · post (blog post; blog home is a route, not a file) · contact
 *  plus three that the site needs and the brief did not list: legal (locked), campaign (AGM, Congress, offers), landing (paid media).
 */
export const templates = ["home", "about", "product-category", "product", "prizesaver", "resources", "post", "contact", "legal", "campaign", "landing"] as const;
export const categories = ["home", "hub", "product-loan", "product-savings", "about", "contact", "blog-post", "legal-regulatory", "utility", "other", "landing"] as const;

const slug = z.string().regex(/^\/([a-z0-9-]+\/)*$/, "slug must be a root-relative path with a trailing slash, e.g. /loans/member-loan/");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}/, "ISO 8601 date expected");

export const productSchema = z.object({
  kind: z.enum(["loan", "savings"]),
  amountMin: z.number().optional(),
  amountMax: z.number().optional(),
  aprMin: z.number().optional(),
  aprMax: z.number().optional(),
  termMaxMonths: z.number().optional(),
  dividendRate: z.number().optional(),
  representative: z.object({ apr: z.number(), amount: z.number().optional(), termMonths: z.number().optional(), monthly: z.number().optional(), total: z.number().optional() }).optional(),
});

export const frontmatterSchema = z.object({
  title: z.string().min(1, "title is required (it becomes the <title>)"),
  description: z.string().default(""),
  canonical: z.string().url().startsWith("https://www.gmbcreditunion.com/", "canonical must be on https://www.gmbcreditunion.com"),
  slug,
  category: z.enum(categories),
  template: z.enum(templates),
  publishedAt: isoDate.optional(),
  updatedAt: isoDate.optional(),
  ogImage: z.string().startsWith("/").optional(),
  ogDescription: z.string().optional(),
  ogTitle: z.string().optional(),   // only when the live og:description differed from the meta description
  h1: z.string().optional(),              // only when the live H1 differed from the title
  robots: z.string().optional(),
  locked: z.boolean().default(false),
  noindex: z.boolean().default(false),
  source_url: z.string().url().optional(),
  schema: z.record(z.string(), z.unknown()).optional(),
  product: productSchema.optional(),
  // posts
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
  headerColour: z.string().optional(),
  date: z.string().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).optional(),
  excerpt: z.string().optional(),
  cardTitle: z.string().optional(),       // title as shown on blog cards (can differ in case from <title>)
  cardImage: z.string().optional(),
  cardImageAlt: z.string().optional(),
  // landing template extras
  landing: z.object({ cta: z.object({ label: z.string(), href: z.string() }), repApr: z.string(), riskWarning: z.string(), formId: z.string().optional() }).optional(),
}).superRefine((fm, ctx) => {
  if ((fm.template === "product" || fm.template === "prizesaver") && !fm.product) ctx.addIssue({ code: "custom", path: ["product"], message: "product pages need a `product:` block (kind, apr, amounts) for schema" });
  if (fm.template === "post" && !fm.publishedAt) ctx.addIssue({ code: "custom", path: ["publishedAt"], message: "posts need publishedAt" });
  if (fm.template === "landing" && !fm.landing) ctx.addIssue({ code: "custom", path: ["landing"], message: "landing pages need a `landing:` block (cta, repApr, riskWarning)" });
  if (fm.canonical !== "https://www.gmbcreditunion.com" + fm.slug) ctx.addIssue({ code: "custom", path: ["canonical"], message: `canonical must equal https://www.gmbcreditunion.com${fm.slug}` });
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
