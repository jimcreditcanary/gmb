// Design-system review shots: node tools/shots-ds.mjs [base] → scratch dir, full page at 1440 and 390, reveal animation disabled.
import { chromium } from 'playwright'; import fs from 'fs'; import sharp from 'sharp';
const BASE = process.argv[2] || 'http://localhost:3011';
const out = '/private/tmp/claude-501/-Users-jamesfell/a556f966-20d8-4501-a3d0-c63df085ba16/scratchpad/ds'; fs.mkdirSync(out, { recursive: true });
const pages = { home: '/', loans: '/loans/', member: '/loans/member-loan/', blog: '/our-blog/', post: '/how-check-your-credit-score-free/', contact: '/contact-us/', faqs: '/faqs/', about: '/about-us/', styleguide: '/styleguide/', complaints: '/complaints/' };
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  for (const [k, p] of Object.entries(pages)) {
    await page.goto(BASE + p, { waitUntil: 'load' });
    await page.evaluate(async () => { const t = document.body.scrollHeight; for (let y = 0; y < t; y += 300) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0, 0); });
    await page.evaluate(() => Promise.all([...document.images].filter(i => !i.complete).map(i => new Promise(r => { i.onload = i.onerror = r; }))));   // lazy images must have landed before the capture
    await page.addStyleTag({ content: '.cookie-banner{display:none!important} *,*::before,*::after{animation:none!important;transition:none!important}' });
    await page.waitForTimeout(400);
    const f = `${out}/${k}-${w}.png`; await page.screenshot({ path: f, fullPage: true });
    const m = await sharp(f).metadata(); const cap = w > 1000 ? 5000 : 4600;
    await sharp(f).extract({ left: 0, top: 0, width: m.width, height: Math.min(cap, m.height) }).resize({ width: Math.min(1000, m.width) }).png({ compressionLevel: 9 }).toFile(`${out}/v-${k}-${w}.png`);
    console.log(k, w, m.width, m.height);
  }
  await page.close();
}
await browser.close();
