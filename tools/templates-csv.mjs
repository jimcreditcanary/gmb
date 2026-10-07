// Page → template register (docs/templates.md). Regenerate after adding pages: node tools/templates-csv.mjs
import fs from "node:fs"; import path from "node:path"; import matter from "gray-matter";
const root = "content"; const rows = [["slug", "template", "category", "title", "locked", "noindex", "file"]];
const q = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
for (const cat of fs.readdirSync(root).filter((c) => !c.startsWith("_"))) for (const f of fs.readdirSync(path.join(root, cat))) {
  const { data } = matter.read(path.join(root, cat, f)); rows.push([data.slug, data.template, data.category, data.title, !!data.locked, !!data.noindex, `content/${cat}/${f}`]);
}
rows.push(["/our-blog/", "blog-home", "archive", "Our Blog | GMB Credit Union", false, false, "app/our-blog/page.tsx (+ /category/*, /tag/*, /our-blog/page/N/)"]);
const order = ["home", "about", "product-category", "product", "prizesaver", "resources", "blog-home", "post", "contact", "legal", "campaign", "landing"];
const body = rows.slice(1).sort((a, b) => order.indexOf(a[1]) - order.indexOf(b[1]) || a[0].localeCompare(b[0]));
fs.writeFileSync("audit/templates.csv", [rows[0], ...body].map((r) => r.map(q).join(",")).join("\n") + "\n");
const counts = {}; for (const r of body) counts[r[1]] = (counts[r[1]] || 0) + 1; console.log(counts);
