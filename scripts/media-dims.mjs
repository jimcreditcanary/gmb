// Precompute intrinsic dimensions of every shipped image so <img> tags always carry width/height (CLS) without runtime probing.
import fs from 'node:fs'; import path from 'node:path'; import sharp from 'sharp';
const root = path.join(process.cwd(), 'public'); const out = {};
async function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) await walk(p); else if (/\.(png|jpe?g|webp|gif|svg|avif)$/i.test(f)) { try { const m = await sharp(p).metadata(); if (m.width && m.height) out['/' + path.relative(root, p).split(path.sep).join('/')] = [m.width, m.height]; } catch { } } } }
await walk(path.join(root, 'media')); await walk(path.join(root, 'theme'));
fs.writeFileSync(path.join(process.cwd(), 'lib/media-dims.json'), JSON.stringify(out));
console.log('media dims:', Object.keys(out).length);
