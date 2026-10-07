// Phase 4 §3: axe-core (WCAG 2.2 AA tags) on one page per template, mobile + desktop. Output: audit/axe.json + summary.
import { chromium } from 'playwright'; import fs from 'fs';
const BASE = process.argv[2] || 'http://localhost:3011';
const targets = fs.readFileSync('/Users/jamesfell/gmb/tools/lh-targets-after.txt', 'utf8').trim().split('\n').map(l => { const [k, u] = l.split(' '); return [k, u.replace('https://www.gmbcreditunion.com', BASE)]; });
const axeSrc = fs.readFileSync('/Users/jamesfell/gmb/node_modules/axe-core/axe.min.js', 'utf8');
const b = await chromium.launch({ headless: true }); const out = {}; const totals = {};
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  for (const [k, u] of targets) {
    await p.goto(u, { waitUntil: 'networkidle', timeout: 60000 }); await p.addScriptTag({ content: axeSrc });
    const r = await p.evaluate(async () => await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } }));
    const v = r.violations.map(x => ({ id: x.id, impact: x.impact, tags: x.tags.filter(t => /wcag/.test(t)), help: x.help, nodes: x.nodes.length, sample: x.nodes.slice(0, 3).map(n => n.target.join(' ')) }));
    out[`${k}@${w}`] = v; for (const x of v) { const key = x.id + (x.tags.length ? '' : ' (best-practice)'); totals[key] = (totals[key] || 0) + x.nodes; }
  }
  await p.close();
}
await b.close(); fs.writeFileSync('/Users/jamesfell/gmb/audit/axe.json', JSON.stringify(out, null, 1));
console.log('violations by rule (node count):', totals);
for (const [k, v] of Object.entries(out)) if (v.length) console.log(k, v.map(x => `${x.id}×${x.nodes}`).join(', '));
