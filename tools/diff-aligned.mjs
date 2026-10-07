// Shift-tolerant visual diff: downscale both screenshots 4x, split the AFTER image into 32px bands, and for each band find the best vertical match in BEFORE within ±60px (downscaled). Reports the share of pixels that differ after alignment (true content/colour change) and the share of bands with no good match (new/removed content).
import fs from 'fs'; import path from 'path'; import sharp from 'sharp';
const ROOT = '/Users/jamesfell/gmb'; const SCALE = 4, BAND = 24, WIN = 120, TOL = 48; const CMPW = { '1440': 360, '768': 384, '390': 390 };
const rows = [['width', 'page', 'before_h', 'after_h', 'naive_pct', 'aligned_pct', 'unmatched_bands_pct', 'status']];
const [BEFORE_DIR, AFTER_DIR, OUT_CSV] = [process.argv[2] || 'audit/screenshots/before', process.argv[3] || 'audit/screenshots/after', process.argv[4] || 'audit/pixel-diff-aligned.csv'];   // node tools/diff-aligned.mjs <beforeDir> <afterDir> <out.csv>
const naive = Object.fromEntries(fs.readFileSync(ROOT + '/audit/pixel-diff.csv', 'utf8').trim().split('\n').slice(1).map(l => l.split(',')).map(r => [r[0] + '/' + r[1], r[4]]));
async function gray(p, width) { const { data, info } = await sharp(p).resize({ width }).grayscale().raw().toBuffer({ resolveWithObject: true }); return { d: data, w: info.width, h: info.height }; }   // both sides scaled to the same width so a wider (overflowed) baseline still lines up
function bandDiff(A, B, ay, by, w, h) { let diff = 0; for (let y = 0; y < h; y++) { const ao = (ay + y) * w, bo = (by + y) * w; for (let x = 0; x < w; x++) if (Math.abs(A.d[ao + x] - B.d[bo + x]) > TOL) diff++; } return diff; }
for (const W of ['1440', '768', '390']) {
  const bd = path.join(ROOT, BEFORE_DIR, W), ad = path.join(ROOT, AFTER_DIR, W); if (!fs.existsSync(ad)) continue;
  for (const f of fs.readdirSync(ad)) {
    if (/^(file__|filter__|directors-area)/.test(f) || !fs.existsSync(path.join(bd, f))) continue;   // held pages are 410 now; not a visual comparison
    const A = await gray(path.join(ad, f), CMPW[W]), B = await gray(path.join(bd, f), CMPW[W]); const w = Math.min(A.w, B.w);
    let diffPx = 0, total = 0, unmatched = 0, bands = 0, lastOff = 0;
    for (let ay = 0; ay + BAND <= A.h; ay += BAND) {
      bands++; let best = Infinity, bestOff = lastOff;
      for (let off = lastOff - WIN; off <= lastOff + WIN; off += 2) { const by = ay + off; if (by < 0 || by + BAND > B.h) continue; const d = bandDiff(A, B, ay, by, w, BAND); if (d < best) { best = d; bestOff = off; } if (d === 0) break; }
      if (best === Infinity) { unmatched++; diffPx += w * BAND; } else { lastOff = bestOff; diffPx += best; if (best > w * BAND * 0.5) unmatched++; }
      total += w * BAND;
    }
    const pct = total ? (diffPx / total) * 100 : 0; const ub = bands ? (unmatched / bands) * 100 : 0;
    rows.push([W, f, B.h, A.h, naive[W + '/' + f] || '', pct.toFixed(2), ub.toFixed(1), pct > 1 ? 'CHANGED' : 'OK']);
  }
  console.log('done', W);
}
fs.writeFileSync(path.join(ROOT, OUT_CSV), rows.map(r => r.join(',')).join('\n'));
const data = rows.slice(1); for (const W of ['1440', '768', '390']) { const r = data.filter(x => x[0] === W); const p = r.map(x => +x[5]).sort((a, b) => a - b); console.log(W, 'pages', r.length, 'median', p[Math.floor(p.length / 2)] + '%', 'over 1%', r.filter(x => +x[5] > 1).length, 'over 5%', r.filter(x => +x[5] > 5).length); }
console.log('worst 15:'); data.sort((a, b) => +b[5] - +a[5]).slice(0, 15).forEach(x => console.log(' ', x[0], x[1], x[5] + '% (naive ' + x[4] + '%, unmatched bands ' + x[6] + '%)'));
