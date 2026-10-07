// Pixel diff before/after screenshots: node tools/diff.mjs [threshold%]. Writes audit/screenshots/diff/<w>/<slug>.png for pairs over threshold and audit/pixel-diff.csv.
import fs from 'fs'; import path from 'path'; import { PNG } from 'pngjs'; import pixelmatch from 'pixelmatch';
const ROOT = '/Users/jamesfell/gmb'; const thr = Number(process.argv[2] || 1);
const rows = [['width', 'page', 'before_h', 'after_h', 'diff_pct', 'status', 'diff_image']];
for (const w of ['1440', '768', '390']) {
  const bd = path.join(ROOT, 'audit/screenshots/before', w), ad = path.join(ROOT, 'audit/screenshots/after', w), dd = path.join(ROOT, 'audit/screenshots/diff', w); fs.mkdirSync(dd, { recursive: true });
  if (!fs.existsSync(ad)) continue;
  for (const f of fs.readdirSync(bd)) {
    const af = path.join(ad, f); if (!fs.existsSync(af)) { rows.push([w, f, '', '', '', 'MISSING_AFTER', '']); continue; }
    const a = PNG.sync.read(fs.readFileSync(path.join(bd, f))), b = PNG.sync.read(fs.readFileSync(af));
    const width = Math.max(a.width, b.width), height = Math.max(a.height, b.height);
    const pad = (img) => { if (img.width === width && img.height === height) return img; const o = new PNG({ width, height }); o.data.fill(255); PNG.bitblt(img, o, 0, 0, img.width, img.height, 0, 0); return o; };
    const A = pad(a), B = pad(b), D = new PNG({ width, height });
    const n = pixelmatch(A.data, B.data, D.data, width, height, { threshold: 0.12, includeAA: false });
    const pct = (n / (width * height)) * 100; const over = pct > thr;
    const df = over ? path.join(dd, f) : ''; if (over) fs.writeFileSync(df, PNG.sync.write(D));
    rows.push([w, f, a.height, b.height, pct.toFixed(2), over ? 'CHANGED' : 'OK', df ? path.relative(ROOT, df) : '']);
  }
}
fs.writeFileSync(path.join(ROOT, 'audit/pixel-diff.csv'), rows.map((r) => r.join(',')).join('\n'));
const changed = rows.slice(1).filter((r) => r[5] === 'CHANGED').length; console.log('pairs', rows.length - 1, 'changed over', thr + '%:', changed);
