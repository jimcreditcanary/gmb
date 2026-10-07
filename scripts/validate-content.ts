/* Validates every content file's frontmatter against lib/frontmatter.ts and checks that referenced media exists. Fails the build with a clear message. */
import fs from "node:fs";
import path from "node:path";
import { getAllPages } from "../lib/content";

let errors = 0;
const fail = (m: string) => { console.error("✖ " + m); errors++; };
let pages;
try { pages = getAllPages(); } catch (e) { console.error(String((e as Error).message)); process.exit(1); }
const pub = path.join(process.cwd(), "public");
for (const p of pages) {
  const refs = new Set<string>();
  for (const m of p.body.matchAll(/(?:\]\(|src="|image="|icon="|lottie=")(\/media\/[^)"\s]+|\/theme\/[^)"\s]+)/g)) refs.add(m[1]);
  for (const k of ["ogImage", "featuredImage", "cardImage"] as const) { const v = p.frontmatter[k]; if (v && v.startsWith("/")) refs.add(v); }
  const strip = (x: string) => { let cur = x; for (let i = 0; i < 4; i++) { const m = cur.match(/^(.*?)(-\d{2,4}x\d{2,4}|-scaled|-rotated|-e\d{13})(\.[a-z0-9]+)$/i); if (!m) break; cur = m[1] + m[3]; } return cur; };
  for (const r of refs) { const f = decodeURIComponent(r.split("?")[0]); if (!fs.existsSync(path.join(pub, f)) && !fs.existsSync(path.join(pub, strip(f)))) fail(`${p.file}: missing media ${r}`); }
  if (!p.frontmatter.description && !p.frontmatter.noindex) console.warn(`⚠ ${p.file}: no description (kept verbatim from the live site; add one when editing)`);
  for (const m of p.body.matchAll(/<([A-Z][A-Za-z]*)\b/g)) { /* component names are checked by the MDX compile at build */ void m; }
}
console.log(`✔ ${pages.length} content files valid${errors ? `, ${errors} error(s)` : ""}`);
process.exit(errors ? 1 : 0);
