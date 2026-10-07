// Side-by-side "before | after" composites for review: audit/screenshots/compare/<w>/<slug>.png (both images scaled to the same width, padded to equal height).
import fs from 'fs'; import path from 'path'; import sharp from 'sharp';
const ROOT = '/Users/jamesfell/gmb'; const pages = process.argv.slice(2);
const list = pages.length ? pages : ['home', 'loans', 'loans__member-loan', 'savings__member-saver', 'about-us', 'contact-us', 'faqs', 'privacy-policy', 'complaints', 'our-blog', 'cash-flow-king', '2026-agm-summary', 'gmb-credit-union-prize-draw', 'resources__member-helper', 'resources__member-helper__budget-planner', 'cost-of-living', 'what-do-our-members-most-about-us'];
for (const w of ['1440', '390']) {
  const out = path.join(ROOT, 'audit/screenshots/compare', w); fs.mkdirSync(out, { recursive: true });
  for (const slug of list) {
    const b = path.join(ROOT, 'audit/screenshots/before', w, slug + '.png'), a = path.join(ROOT, 'audit/screenshots/after', w, slug + '.png'); if (!fs.existsSync(b) || !fs.existsSync(a)) continue;
    const W = +w; const [bi, ai] = await Promise.all([sharp(b).resize({ width: W }).png().toBuffer({ resolveWithObject: true }), sharp(a).resize({ width: W }).png().toBuffer({ resolveWithObject: true })]);
    const H = Math.max(bi.info.height, ai.info.height); const gap = 24;
    await sharp({ create: { width: W * 2 + gap, height: H + 40, channels: 3, background: '#e5e7eb' } })
      .composite([{ input: bi.data, left: 0, top: 40 }, { input: ai.data, left: W + gap, top: 40 }, { input: Buffer.from(`<svg width="${W * 2 + gap}" height="40"><text x="12" y="27" font-family="Helvetica" font-size="20" fill="#111">BEFORE (WordPress) — ${slug} @${w}</text><text x="${W + gap + 12}" y="27" font-family="Helvetica" font-size="20" fill="#111">AFTER (Next.js)</text></svg>`), left: 0, top: 0 }])
      .png({ compressionLevel: 9 }).toFile(path.join(out, slug + '.png'));
  }
  console.log('composites', w, fs.readdirSync(out).length);
}
