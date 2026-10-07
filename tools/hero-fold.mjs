// T3.13 measurement: on a 390x844 phone viewport, is the hero's primary button inside the first screen? node tools/hero-fold.mjs [base]
import { chromium } from 'playwright';
const BASE = process.argv[2] || 'http://localhost:3011';
const pages = ['/loans/member-loan/', '/loans/consolidation-loan/', '/loans/family-loan/', '/loans/top-up-loan/', '/savings/365-saver/', '/savings/young-saver/', '/savings/prizesaver/', '/savings/premium-saver/', '/', '/loans/', '/savings/'];
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
for (const p of pages) {
  await page.goto(BASE + p, { waitUntil: 'load' });
  const r = await page.evaluate(() => { const b = document.querySelector('main section.header-page .data-content .button, main section.header .data-content .list-buttons, main section.header-page .data-content a.button'); if (!b) return null; const { bottom } = b.getBoundingClientRect(); return Math.round(bottom); });
  console.log(p.padEnd(32), r === null ? 'no hero CTA' : `CTA bottom at ${r}px ${r <= 844 ? 'IN first screen' : 'BELOW the fold'}`);
}
await browser.close();
