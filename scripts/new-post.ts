/* pnpm new:post "Title of the post" [--date 2026-10-07]  → content/blog-post/<slug>.mdx with valid frontmatter. */
import fs from "node:fs";
import path from "node:path";
const args = process.argv.slice(2);
const title = args.filter((a) => !a.startsWith("--"))[0];
if (!title) { console.error('Usage: pnpm new:post "Post title" [--date YYYY-MM-DD]'); process.exit(1); }
const dateArg = args.includes("--date") ? args[args.indexOf("--date") + 1] : new Date().toISOString().slice(0, 10);
const slug = title.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const file = path.join(process.cwd(), "content/blog-post", slug + ".mdx");
if (fs.existsSync(file)) { console.error(`Already exists: ${file}`); process.exit(1); }
const human = new Date(dateArg).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
const fm = `---
title: ${JSON.stringify(title + " | GMBCU")}
description: ""
canonical: https://www.gmbcreditunion.com/${slug}/
slug: /${slug}/
category: blog-post
template: post
publishedAt: '${dateArg}T09:00:00+00:00'
updatedAt: '${dateArg}T09:00:00+00:00'
featuredImage: /media/REPLACE-ME.jpg
featuredImageAlt: ""
cardImage: /media/REPLACE-ME.jpg
headerColour: yellow
date: ${human}
excerpt: ""
tags: []
locked: false
noindex: false
---

Write the post here in Markdown. Headings start at \`###\` (the page title is the H1).
`;
fs.writeFileSync(file, fm);
console.log(`Created ${path.relative(process.cwd(), file)} — fill in description, excerpt and featuredImage, drop the image into public/media/, then run pnpm validate.`);
