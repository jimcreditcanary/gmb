/* Locked pages: compares the visible text of each `locked: true` MDX body against the text extracted from the archived WordPress HTML (source/html).
   Any word-level change fails the build. Approve a deliberate change by updating the snapshot in content/_locked/<slug>.txt (see CONTRIBUTING.md). */
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { getAllPages } from "../lib/content";

const norm = (s: string) => s.replace(/\u00a0/g, " ").replace(/•/g, " • ").replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\\([*_#[\]()<>.!-])/g, "$1").replace(/[*_`\\]/g, "").replace(/\s+/g, " ").replace(/\s+([.,;:!?)\]…])/g, "$1").replace(/\(\s+/g, "(").trim();
const mdxText = (m: string) => {
  let s = m.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/<\/?u>/g, "").replace(/<ContactForm[\s\S]*?<\/ContactForm>/g, "");   // forms are excluded from the reference text too
  // text carried in component props (headings, questions, stats, eyebrow labels, hero buttons)
  s = s.replace(/<(Panel|ListBlock|IconGrid|BoxSlider|InfoBlock|FAQGroup|FAQ|Stat|PageHeader|HomeHero|InfoPanel|ColourPanel)\b([\s\S]*?)>/g, (_, tag: string, a: string) => " " + [...a.matchAll(/(?:heading|title|question|figure|label|intro|year)="([^"]*)"/g)].map((x) => x[1]).join(" ") + " " + [...a.matchAll(/"label":"([^"]*)"/g)].map((x) => x[1]).join(" ") + " ");
  s = s.replace(/<\/?(a|A|u|strong|em|b|i|sup|sub|span)\b[^>]*>/g, "");         // inline: no whitespace
  s = s.replace(/<br\s*\/?>/g, " ").replace(/<\/?[A-Za-z][^>]*>/g, " ");          // block/components: whitespace
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/^\s*(?:[-+]|\d+\.)\s+/gm, " ").replace(/^\s*#+\s*/gm, " ").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  return norm(s.replace(/<[^>]*>/g, " "));
};
const words = (s: string) => { const m = new Map<string, number>(); for (const w of s.split(" ").filter(Boolean)) m.set(w, (m.get(w) || 0) + 1); return m; };

const snapDir = path.join(process.cwd(), "content/_locked"); fs.mkdirSync(snapDir, { recursive: true });
let failures = 0, checked = 0;
for (const p of getAllPages().filter((x) => x.frontmatter.locked)) {
  const slug = p.frontmatter.slug; const snapFile = path.join(snapDir, (slug === "/" ? "home" : slug.replace(/^\/|\/$/g, "").replace(/\//g, "__")) + ".txt");
  let reference: string | null = null;
  if (fs.existsSync(snapFile)) reference = fs.readFileSync(snapFile, "utf8");
  else {
    const html = path.join(process.cwd(), "source/html", slug, "index.html");
    if (fs.existsSync(html)) {
      const $ = cheerio.load(fs.readFileSync(html, "utf8"));
      $("main section.posts, main .wrap-posts, main .trustpilot-widget, main form, script, style, noscript, main .pagination, main .wrap-links, main img, main .data-date").remove();
      if (p.frontmatter.template === "post") $("main section.header-page").remove();
      reference = norm($("main").text()); fs.writeFileSync(snapFile, reference);
    }
  }
  if (reference === null) { console.warn(`⚠ no reference for locked page ${slug}`); continue; }
  checked++;
  const a = words(norm(reference)), b = words(mdxText(p.body));
  const missing: string[] = [], extra: string[] = [];
  for (const [w, c] of a) if ((b.get(w) || 0) < c) missing.push(w);
  for (const [w, c] of b) if ((a.get(w) || 0) < c) extra.push(w);
  const ignorable = (w: string) => /^[>…•().,;:!?"\x27-]*$/.test(w) || /^\d+\.$/.test(w);
  const m2 = missing.filter((w) => !ignorable(w)), e2 = extra.filter((w) => !ignorable(w));
  if (m2.length || e2.length) { failures++; console.error(`✖ LOCKED TEXT CHANGED ${slug}\n    missing: ${m2.slice(0, 20).join(" ")}\n    added:   ${e2.slice(0, 20).join(" ")}`); }
}
console.log(failures ? `✖ ${failures} of ${checked} locked pages differ from source` : `✔ ${checked} locked pages match their source text`);
process.exit(failures ? 1 : 0);
