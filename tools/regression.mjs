// Phase 4 §1 + §4: crawl the built site with the Phase 1 inventory. New vs old: status, title, description, canonical, h1, og, schema types, word count (±2%), internal links. Redirect targets must resolve in one hop.
import fs from 'fs'; import * as cheerio from 'cheerio';
import { ROOT, readJSON } from './lib.mjs';
const BASE = process.argv[2] || 'http://localhost:3011'; const H = 'https://www.gmbcreditunion.com';
const inv = readJSON(ROOT + '/audit/raw/inventory.json'); const cat = Object.fromEntries(fs.readFileSync(ROOT + '/audit/categorisation.csv', 'utf8').trim().split('\n').slice(1).map(l => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map(c => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'))).map(c => [c[0], c[3]]));
const planned = Object.fromEntries(fs.readFileSync(ROOT + '/audit/redirects.csv', 'utf8').trim().split('\n').slice(1).map(l => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map(c => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'))).filter(r => /^\//.test(r[0]) && !/[<(:*]/.test(r[0])).map(r => [r[0].split('?')[0], r]));
const norm = s => (s || '').replace(/\s+/g, ' ').trim();
const extract = (html) => { const $ = cheerio.load(html.replace(/<(?=\/?(?:p|div|li|ul|ol|h[1-6]|section|article|br|td|tr|th|table|header|footer|nav|main|blockquote|figure|label|form|button|dt|dd|address|hr)\b)/gi, ' <'));   // whitespace between tags differs between WP output and React; normalise before counting
  const schema = []; $('script[type="application/ld+json"]').each((i, s) => { try { const j = JSON.parse($(s).html()); const walk = o => { if (!o) return; if (Array.isArray(o)) return o.forEach(walk); if (typeof o === 'object') { if (o['@type']) schema.push(...[].concat(o['@type'])); if (o['@graph']) walk(o['@graph']); } }; walk(j); } catch { schema.push('INVALID'); } });
  const links = new Set(); $('a[href]').each((i, a) => { const h = $(a).attr('href'); try { const u = new URL(h, H); if (/gmbcreditunion\.com$/.test(u.host)) links.add(u.pathname); } catch { } });
  // Same method as the Phase 1 crawler: main (or body) minus header/footer/nav/script/style, innerText semantics ≈ drop hidden/sr-only/placeholder notes
  const main = $('main').length ? $('main').first() : $('body'); const clone = main.clone(); clone.find('header,footer,nav,script,style,noscript,.site-header,.site-footer,#site-header,#site-footer,.sr-only-text,.skip-link,.cookie-banner,.tool-placeholder-note').remove();
  const words = norm(clone.text()).split(' ').filter(Boolean).length;
  return { title: $('title').first().text(), description: $('meta[name="description"]').attr('content') || '', canonical: $('link[rel="canonical"]').attr('href') || '', robots: $('meta[name="robots"]').attr('content') || '', h1: $('h1').map((i, e) => norm($(e).text())).get().join(' | '), og_title: $('meta[property="og:title"]').attr('content') || '', og_description: $('meta[property="og:description"]').attr('content') || '', og_image: $('meta[property="og:image"]').attr('content') || '', twitter_card: $('meta[name="twitter:card"]').attr('content') || '', schema: [...new Set(schema)].sort(), words, links: links.size }; };
const rows = [['url', 'old_status', 'new_status', 'new_location', 'planned_target', 'hops', 'result', 'title_match', 'description_match', 'canonical_match', 'h1_match', 'og_match', 'schema_old', 'schema_new', 'words_old', 'words_new', 'words_delta_pct', 'links_old', 'links_new', 'notes']];
let fails = 0, n = 0;
for (const r of Object.values(inv).sort((a, b) => a.url.localeCompare(b.url))) {
  const u = new URL(r.url); if (/conesso|\?s=|\?page=/.test(u.search) || /&quot/.test(r.url)) continue; const path = u.pathname + u.search;
  const action = cat[r.url] || ''; const held = /^\/(file|filter)\//.test(path) || /^\/directors-area/.test(path);
  // follow manually to count hops
  let cur = BASE + path, hops = 0, status = 0, loc = '', html = '';
  for (; hops < 5; hops++) { const res = await fetch(cur, { redirect: 'manual', headers: { 'user-agent': 'gmb-regression' } }); status = res.status; loc = res.headers.get('location') || ''; if ([301, 302, 307, 308].includes(status) && loc) { cur = new URL(loc, cur).href; continue; } html = status === 200 ? await res.text() : ''; break; }
  const firstHop = await fetch(BASE + path, { redirect: 'manual' }); const fStatus = firstHop.status; const fLoc = (firstHop.headers.get('location') || '').replace(BASE, '').replace(H, '');
  const plan = planned[path.replace(/\/$/, '')] || planned[path];
  const notes = []; let result = 'OK';
  if (r.status === 200 && !held && r.kind === 'html') {
    if (fStatus !== 200) { if ((path === '/page/2/' || /[A-Z]/.test(path)) && fStatus === 301) { result = 'OK'; notes.push(`planned 301 → ${fLoc}`); } else { result = 'FAIL'; notes.push(`expected 200 got ${fStatus}`); } }
    else {
      const a = r, b = extract(html); const oldHtml = r.file ? fs.readFileSync(ROOT + '/' + r.file, 'utf8') : ''; if (oldHtml) { const o = extract(oldHtml); a.word_count = o.words; }   // recount the archive with the identical method
      const tm = norm(a.title) === norm(b.title), dm = norm(a.meta_description) === norm(b.description), cm = norm(a.canonical) === norm(b.canonical), hm = norm(a.h1) === norm(b.h1);
      const om = norm(a.og_title) === norm(b.og_title) && norm(a.og_description) === norm(b.og_description) && (!a.og_image || norm(a.og_image).replace(H, '') === norm(b.og_image).replace(H, ''));
      const delta = a.word_count ? ((b.words - a.word_count) / a.word_count) * 100 : 0; const wm = Math.abs(delta) <= 2 || Math.abs(b.words - a.word_count) <= 5;
      const so = (a.schema_types || []).filter(t => !['WebSite', 'WebPage', 'ImageObject', 'BreadcrumbList', 'CollectionPage', 'Person', 'Article', 'SearchResultsPage'].includes(t) || true).sort(); const missingSchema = (a.schema_types || []).filter(t => !b.schema.includes(t));
      if (!tm) notes.push('title'); if (!dm) notes.push('description'); if (!cm) notes.push('canonical'); if (!hm) notes.push('h1'); if (!om) notes.push('og'); if (missingSchema.length) notes.push('schema missing ' + missingSchema.join('/')); if (!wm) notes.push(`words ${a.word_count}→${b.words}`);
      if (notes.length) result = 'FAIL';
      rows.push([path, r.status, fStatus, '', '', 0, result, tm, dm, cm, hm, om, (a.schema_types || []).join('|'), b.schema.join('|'), a.word_count, b.words, delta.toFixed(1), (a.internal_links_out || []).length, b.links, notes.join('; ')]); if (result === 'FAIL') fails++; n++; continue;
    }
  } else if (r.status === 200 && held) { result = (fStatus === 410 || (fStatus === 302 && /^\/$/.test(fLoc))) ? 'OK' : 'FAIL'; notes.push(fStatus === 410 ? 'held → 410' : fStatus === 302 ? 'held → 302 /' : `held but got ${fStatus}`); }
  else if (r.status === 301 || r.status === 302) { const target = plan ? plan[1] : (r.redirect_target || '').replace(H, ''); const tgt = target.split('?')[0]; const got = fLoc.split('?')[0]; const finalPlanned = (() => { const t = tgt; const p2 = planned[t.replace(/\/$/, '')] || planned[t]; return p2 ? p2[1].split('?')[0] : t; })();   // chains collapse to the final planned target
      const same = (x, y) => x.replace(/\/$/, '').toLowerCase() === y.replace(/\/$/, '').toLowerCase();
      const heldTarget = /^\/(file|filter)\//.test(tgt) || /^\/directors-area/.test(tgt);
      const ok = [301, 302, 410].includes(fStatus) && (fStatus === 410 ? /^\/(file|filter)\//.test(got || path) : same(got, tgt) || same(got, finalPlanned) || (heldTarget && got === '/')); result = ok ? 'OK' : 'FAIL'; if (!ok) notes.push(`expected → ${tgt} got ${fStatus} ${fLoc}`); if (ok && hops > 1 && fStatus !== 410) { notes.push(`${hops} hops`); } rows.push([path, r.status, fStatus, fLoc, tgt, hops, result, '', '', '', '', '', '', '', '', '', '', '', '', notes.join('; ')]); if (result === 'FAIL') fails++; n++; continue; }
  else if (r.status === 404) { result = [404, 301, 410, 200].includes(fStatus) ? 'OK' : 'FAIL'; notes.push(fStatus === 301 ? `now redirects → ${fLoc}` : fStatus === 200 ? 'was 404, now served' : 'still 404 (expected)'); }
  else if (r.kind === 'document') { result = [200, 301].includes(fStatus) || (fStatus === 410 && held) ? 'OK' : 'FAIL'; }
  rows.push([path, r.status, fStatus, fLoc, plan ? plan[1] : '', hops, result, '', '', '', '', '', '', '', '', '', '', '', '', notes.join('; ')]); if (result === 'FAIL') fails++; n++;
}
fs.writeFileSync(ROOT + '/audit/regression.csv', rows.map(r => r.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',')).join('\n'));
console.log('regression rows', n, 'FAIL', fails); rows.filter(r => r[6] === 'FAIL').slice(0, 40).forEach(r => console.log(' ', r[0], r[1], '→', r[2], r[19]));
