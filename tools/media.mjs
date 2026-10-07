import fs from 'fs'; import path from 'path';
import { launch, throttle, norm, isInternal, allowed, ROOT, readJSON, writeJSON, assetSavePath, ensure } from './lib.mjs';
const inv = readJSON(ROOT + '/audit/raw/inventory.json');
const refs = new Set(readJSON(ROOT + '/audit/raw/asset-refs.json', []));
const captured = readJSON(ROOT + '/audit/raw/assets-captured.json', {});
const ASSET_RE = /\.(pdf|docx?|xlsx?|pptx?|zip|csv|png|jpe?g|gif|svg|webp|avif|ico|mp4|webm|mov|mp3|m4a|woff2?|ttf|otf|eot|json|lottie|css|js)(?=$|[?#"'\s)])/i;
// 1) scan saved HTML + CSS for same-origin asset references
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(html|css|xml)$/.test(f)) { const t = fs.readFileSync(p, 'utf8');
  for (const m of t.matchAll(/(?:https?:)?\/\/(?:www\.)?gmbcreditunion\.com\/[^"'\s)<>]+/g)) { const u = norm(m[0].startsWith('//') ? 'https:' + m[0] : m[0]); if (u && ASSET_RE.test(new URL(u).pathname)) refs.add(u.split('?')[0]); }
  if (/\.css$/.test(f)) for (const m of t.matchAll(/url\(\s*["']?([^"')]+)/g)) { if (/^data:/.test(m[1])) continue; const base = 'https://www.gmbcreditunion.com/' + path.relative(ROOT + '/source/media', p).replace(/\\/g, '/'); const u = norm(m[1], base); if (u && isInternal(u)) refs.add(u.split('?')[0]); }
  for (const m of t.matchAll(/srcset="([^"]+)"/g)) for (const s of m[1].split(',')) { const u = norm(s.trim().split(/\s+/)[0]); if (u && isInternal(u)) refs.add(u.split('?')[0]); }
} } })(ROOT + '/source');
// sitemap images
for (const u of readJSON(ROOT + '/audit/raw/sitemap-urls.json').flatMap(x => x.images)) refs.add(norm(u).split('?')[0]);
// wayback media/pdf originals (nice to have)
for (const [o, s, m] of readJSON(ROOT + '/audit/raw/wayback-cdx.json').slice(1)) { const u = norm(o); if (!u) continue; const p = new URL(u).pathname; if (/^\/media\//.test(p) && ASSET_RE.test(p) && !/[&"]/.test(p)) refs.add(u.split('?')[0]); }
// 2) derive stripped-suffix candidates
function variants(u) { const out = [u]; let cur = u; for (let i = 0; i < 4; i++) { const m = cur.match(/^(.*?)(-\d{2,4}x\d{2,4}|-scaled|-rotated|-e\d{13}|-\d+x\d+@2x)(\.[a-z0-9]+)$/i); if (!m) break; cur = m[1] + m[3]; out.push(cur); } return [...new Set(out)]; }
const all = new Map(); for (const r of refs) { if (!isInternal(r) || !allowed(r)) continue; const vs = variants(r); vs.forEach((v, i) => { const e = all.get(v) || { url: v, referenced: false, derived_from: new Set() }; if (i === 0) e.referenced = true; else e.derived_from.add(r); all.set(v, e); }); }
console.log('referenced', refs.size, 'total incl. derived', all.size);
const { browser, ctx } = await launch();
const manifest = readJSON(ROOT + '/audit/raw/media-manifest.json', {}); let n = 0;
for (const e of all.values()) {
  const u = e.url; if (manifest[u]?.status === 200) continue;
  const f = assetSavePath(u);
  if (captured[u]?.saved && fs.existsSync(f)) { manifest[u] = { status: 200, bytes: fs.statSync(f).size, file: path.relative(ROOT, f), referenced: e.referenced, derived_from: [...e.derived_from], via: 'crawl-capture' }; continue; }
  await throttle();
  try { const r = await ctx.request.get(u, { maxRedirects: 2, timeout: 60000 }); const ct = (r.headers()['content-type'] || '').split(';')[0];
    if (r.status() === 200 && !/text\/html/.test(ct)) { const body = await r.body(); ensure(f); fs.writeFileSync(f, body); manifest[u] = { status: 200, bytes: body.length, content_type: ct, file: path.relative(ROOT, f), referenced: e.referenced, derived_from: [...e.derived_from], last_modified: r.headers()['last-modified'] || '' }; }
    else manifest[u] = { status: r.status(), content_type: ct, referenced: e.referenced, derived_from: [...e.derived_from] };
  } catch (err) { manifest[u] = { status: 'ERR', error: String(err.message).slice(0, 100), referenced: e.referenced, derived_from: [...e.derived_from] }; }
  if (++n % 25 === 0) { writeJSON(ROOT + '/audit/raw/media-manifest.json', manifest); console.log(n, 'fetched'); }
}
writeJSON(ROOT + '/audit/raw/media-manifest.json', manifest); await browser.close();
// image dimensions for the 'largest' decision
const sizeOf = (f) => { try { const b = fs.readFileSync(f); if (b.slice(1, 4).toString() === 'PNG') return [b.readUInt32BE(16), b.readUInt32BE(20)]; if (b[0] === 0xff && b[1] === 0xd8) { let i = 2; while (i < b.length) { if (b[i] !== 0xff) { i++; continue; } const m = b[i + 1]; if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]; i += 2 + b.readUInt16BE(i + 2); } } if (b.slice(0, 4).toString() === 'RIFF') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff]; if (b.slice(0, 3).toString() === 'GIF') return [b.readUInt16LE(6), b.readUInt16LE(8)]; } catch { } return null; };
for (const [u, m] of Object.entries(manifest)) if (m.file) { const d = sizeOf(path.join(ROOT, m.file)); if (d) { m.width = d[0]; m.height = d[1]; } }
// group by base (stripped) name and mark largest
const groups = {}; for (const u of Object.keys(manifest)) { const base = variants(u).pop(); (groups[base] = groups[base] || []).push(u); }
for (const [base, us] of Object.entries(groups)) { const ok = us.filter(u => manifest[u].status === 200); if (!ok.length) continue; const best = ok.sort((a, b) => ((manifest[b].width || 0) * (manifest[b].height || 0) || manifest[b].bytes) - ((manifest[a].width || 0) * (manifest[a].height || 0) || manifest[a].bytes))[0]; manifest[best].largest_in_group = true; manifest[best].group = base; }
writeJSON(ROOT + '/audit/raw/media-manifest.json', manifest);
const rows = [['url', 'status', 'content_type', 'bytes', 'width', 'height', 'referenced_in_site', 'derived_from', 'largest_in_group', 'file']];
for (const [u, m] of Object.entries(manifest).sort()) rows.push([u, m.status, m.content_type || '', m.bytes || '', m.width || '', m.height || '', m.referenced, (m.derived_from || []).join(' '), m.largest_in_group ? 'yes' : '', m.file || '']);
fs.writeFileSync(ROOT + '/audit/media-inventory.csv', rows.map(r => r.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',')).join('\n'));
const by = {}; Object.values(manifest).forEach(m => by[m.status] = (by[m.status] || 0) + 1); console.log('MEDIA COMPLETE', by);
