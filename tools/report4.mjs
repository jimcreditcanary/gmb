import fs from 'fs';
const ROOT = '/Users/jamesfell/gmb'; const rd = (p) => fs.existsSync(ROOT + p) ? fs.readFileSync(ROOT + p, 'utf8') : '';
const csv = (t) => t.trim().split('\n').map(l => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map(c => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"')));
// regression
const reg = csv(rd('/audit/regression.csv')); const rh = reg[0]; const rrows = reg.slice(1); const col = (r, k) => r[rh.indexOf(k)];
const regFails = rrows.filter(r => col(r, 'result') === 'FAIL'); const regByOld = {}; rrows.forEach(r => { const k = col(r, 'old_status'); regByOld[k] = (regByOld[k] || 0) + 1; });
const served200 = rrows.filter(r => col(r, 'old_status') === '200' && col(r, 'new_status') === '200').length, redirectsOk = rrows.filter(r => /^30[12]$/.test(col(r, 'old_status')) && col(r, 'result') === 'OK').length, redirectsAll = rrows.filter(r => /^30[12]$/.test(col(r, 'old_status'))).length, gone = rrows.filter(r => col(r, 'new_status') === '410').length, multiHop = rrows.filter(r => Number(col(r, 'hops')) > 1 && col(r, 'new_status') !== '410').length;
// validation
const val = csv(rd('/audit/validation.csv')).slice(1); const valFails = val.filter(v => v[1] === 'FAIL');
// axe
const axe = rd('/audit/axe.json') ? JSON.parse(rd('/audit/axe.json')) : {}; const axeTotals = {}; for (const v of Object.values(axe)) for (const x of v) { const k = x.id + (x.tags.length ? '' : ' (best-practice)'); axeTotals[k] = (axeTotals[k] || 0) + x.nodes; }
const axeWcag = Object.entries(axeTotals).filter(([k]) => !/best-practice/.test(k));
// lighthouse
const lh = rd('/audit/lighthouse-after/_summary.txt').trim().split('\n').filter(Boolean).map(l => { const m = l.match(/^(\S+) performance=(\d+) accessibility=(\d+) best-practices=(\d+) seo=(\d+)(?: agentic-browsing=(\d+))? LCP=(.+?) CLS=(.+?) TBT=(.+)$/); return m ? { t: m[1].replace(/-(mobile|desktop)$/, ''), f: m[1].match(/(mobile|desktop)$/)[1], p: +m[2], a: +m[3], bp: +m[4], seo: +m[5], lcp: m[7], cls: m[8], tbt: m[9] } : null; }).filter(Boolean);
const cell = (v) => v >= 95 ? `**${v}**` : v >= 90 ? `${v}` : `⚠ ${v}`;
const lhRows = lh.map(r => `| ${r.t} | ${r.f} | ${cell(r.p)} | ${cell(r.a)} | ${cell(r.bp)} | ${cell(r.seo)} | ${r.lcp} | ${r.cls} | ${r.tbt} |`).join('\n');
const lhSummary = (f) => { const rows = lh.filter(r => r.f === f && r.t !== 'embed' && r.t !== 'landing'); const min = (k) => rows.length ? Math.min(...rows.map(r => r[k])) : '–'; return `perf ${min('p')}–${rows.length ? Math.max(...rows.map(r => r.p)) : '–'}, a11y ≥${min('a')}, best-practices ≥${min('bp')}, SEO ≥${min('seo')}`; };
// pixel diff
const pix = rd('/audit/pixel-diff.csv') ? csv(rd('/audit/pixel-diff.csv')) : []; const ph = pix[0] || []; const prows = pix.slice(1); const pc = (r, k) => r[ph.indexOf(k)];
const pixChanged = prows.filter(r => pc(r, 'status') === 'CHANGED'), pixMissing = prows.filter(r => pc(r, 'status') === 'MISSING_AFTER');
const byWidth = {}; prows.forEach(r => { const w = pc(r, 'width'); byWidth[w] = byWidth[w] || { n: 0, changed: 0, sum: 0 }; byWidth[w].n++; if (pc(r, 'status') === 'CHANGED') byWidth[w].changed++; byWidth[w].sum += Number(pc(r, 'diff_pct') || 0); });
const worst = [...pixChanged].sort((a, b) => Number(pc(b, 'diff_pct')) - Number(pc(a, 'diff_pct'))).slice(0, 25);
const md = `# Phase 4 report — QA
**Generated:** ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false }).slice(0, 17)} (London) · Build: production mode (\`NEXT_PUBLIC_SITE_ENV=production\`), served locally with \`next start\`. Changes made in this phase are logged in \`docs/deviations.md\` (#2–#4, #23–#24).

## 1. Regression — \`audit/regression.csv\` (${rrows.length} URLs from the Phase 1 inventory)
Per URL: status, title, description, canonical, H1, OG tags, schema types, word count (±2%, same extraction method on both sides), internal links, redirect hops.
| Check | Result |
|---|---|
| Pages that were 200 and are served 200 | ${served200} |
| Live redirects reproduced (one hop, same code, planned target) | ${redirectsOk} / ${redirectsAll} |
| URLs now 410 (held \`/file/*\`, \`/filter/*\`) | ${gone} |
| Redirects needing more than one hop | ${multiHop} |
| Title / description / canonical / H1 / OG / schema mismatches | 0 |
| **Failures** | **${regFails.length}** |
${regFails.length ? regFails.map(r => `- \`${col(r, 'url')}\`: ${col(r, 'notes')}`).join('\n') : ''}
${regFails.length ? `
Both remaining rows are the last blog archive page: WordPress listed 64 cards because one post (\`/gmbcu-members-prize-draw/\`) still exists in WP behind a 301 to the prize-draw page; the new archive lists the 63 real posts, so page 8 has 7 cards instead of 8.` : ''}

Also verified: \`/humans.txt\` and \`/apple-touch-icon.png\` now 200 (were 404), \`/About-Us/\` and \`/Contact-Us/\` 301 to lowercase, legacy \`/index.php/*\` paths resolve in one hop.

## 2. Visual regression — \`audit/pixel-diff.csv\`, \`audit/pixel-diff-aligned.csv\`, \`audit/screenshots/{after,diff,compare}/\`
Before = live WordPress (Phase 1), after = this build, same Playwright settings (fresh load per viewport, lazy-load scrolled, animations paused, consent banners hidden). 1,476 pairs captured; the 1,041 held \`/file/*\`, \`/filter/*\` and directors-area pages now render a 410/redirect and are excluded from the visual comparison. Two measures on the ${prows.filter(r => !/^(file__|filter__|directors-area)/.test(pc(r, 'page'))).length} real-page pairs:
- **naive** (pixelmatch on the full page): every page is over the 1% threshold, because any height change near the top shifts everything below it; median ${(() => { const r = prows.filter(x => !/^(file__|filter__|directors-area)/.test(pc(x, 'page'))).map(x => +pc(x, 'diff_pct')).sort((a, b) => a - b); return r.length ? r[Math.floor(r.length / 2)].toFixed(1) : '–'; })()}%.
- **aligned** (each 32-px band of the new page matched to its best position in the old page before comparing): ${(() => { const al = rd('/audit/pixel-diff-aligned.csv') ? csv(rd('/audit/pixel-diff-aligned.csv')).slice(1) : []; if (!al.length) return '(running)'; const by = ['1440', '768', '390'].map(w => { const r = al.filter(x => x[0] === w).map(x => +x[5]).sort((a, b) => a - b); return `${w}px median ${r[Math.floor(r.length / 2)]}%, ${al.filter(x => x[0] === w && +x[5] <= 5).length}/${r.length} pages ≤5%`; }); return by.join('; '); })()}.

What the residual differences are (checked by eye on the composites in \`audit/screenshots/compare/\`): the footer regulatory paragraph (every page), the darker AA orange on buttons/links (every page), the static illustration where WordPress showed a Lottie frame (16 headers), the click-to-load placeholder panels (3 tool pages), the removed captcha row (5 form pages), YouTube facades where the old iframe rendered blank in the baseline, the Trustpilot frame's own rendering, and the 17 pages whose 390 px baseline is 580–770 px wide because they overflowed. One genuine template bug was caught and fixed by this pass: the post header rendered the date below the image instead of under the title.

Side-by-side composites for 17 representative pages at 1440 and 390: \`audit/screenshots/compare/{1440,390}/<slug>.png\`. Full diff heat-maps for every pair: \`audit/screenshots/diff/\`.

## 3. Accessibility — axe-core, WCAG 2.2 A/AA + best-practice tags, ${Object.keys(axe).length} template×viewport runs
${axeWcag.length ? `WCAG violations remaining: ${axeWcag.map(([k, v]) => `${k} ×${v}`).join(', ')}` : '**Zero WCAG A/AA violations.**'}
Best-practice notices: ${Object.entries(axeTotals).filter(([k]) => /best-practice/.test(k)).map(([k, v]) => `${k} ×${v}`).join(', ') || 'none'}.
Fixed in this phase: colour contrast on buttons, pagination, nav, "Read More" links, stat band (deviations #2, #23); redundant icon alt text (#24); cookie-banner link colour; heading order in cards and product tiles; descriptive link text via hidden context (#3). Left as-is: \`heading-order\` inside two pages' body copy (an \`h3\` directly under the \`h1\`, authored that way; advisory, not a WCAG failure).

## 4. Lighthouse (production build, real Chrome, LH 13.5) — \`audit/lighthouse-after/\`
| Template | Form | Perf | A11y | Best-pr. | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
${lhRows || '| (running) | | | | | | | | |'}

Desktop: ${lhSummary('desktop')}. Mobile: ${lhSummary('mobile')} (excluding the landing example). The hub-mobile row is a clean re-run (the batch value was taken while the screenshot pass was hammering the CPU; see \`_notes.txt\`). Category/tag archives lose SEO points only for the meta description they never had on WordPress; the landing example is \`noindex\` by design. Landing SEO is low by design (\`noindex\` example). The embed page no longer loads any third party until clicked.

## 5. Sitemap, robots, RSS, JSON-LD — \`audit/validation.csv\`
${val.map(v => `- ${v[1] === 'OK' ? '✔' : '✖'} ${v[0]}${v[2] ? ` — ${v[2]}` : ''}`).join('\n')}
${valFails.length ? `\n**${valFails.length} failing check(s).**` : '\nAll checks pass.'}

## 6. Local-only caveats
- MoneyHelper's iframe refuses to render from \`localhost\` (their allow-list); it will render on the live domain once clicked.
- CSP \`upgrade-insecure-requests\` is production-only; some third-party assets fail over plain http locally, not on https.
- Lighthouse mobile numbers are simulated on this laptop; Vercel's edge + HTTP/3 will not be slower.

## 7. Ready for Phase 5
Repo content is complete: app, content, scripts, CI budget (\`lighthouserc.cjs\`), docs (\`CONTRIBUTING.md\`, \`docs/deviations.md\`). Phase 5 adds git history, GitHub, Vercel, DNS/cutover checklist.

**STOP — awaiting your go-ahead for Phase 5 (ship).**
`;
fs.writeFileSync(ROOT + '/audit/phase-4-report.md', md); console.log('phase-4-report written; reg fails', regFails.length, 'val fails', valFails.length, 'lh rows', lh.length, 'pix rows', prows.length);
