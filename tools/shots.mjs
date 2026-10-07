import fs from 'fs'; import path from 'path';
import { launch, throttle, isInternal, allowed, ROOT, readJSON, writeJSON, pathFor, ensure, sleep } from './lib.mjs';
const outDir = process.argv[2] || ROOT + '/audit/screenshots/before';
const baseOverride = process.argv[3];   // e.g. http://localhost:3000 for the "after" pass
const inv = readJSON(ROOT + '/audit/raw/inventory.json');
const pages = Object.values(inv).filter(r => r.kind === 'html' && r.final_status === 200 && /html/.test(r.content_type) && !r.redirect_target).map(r => r.url).sort((a, b) => (/\/(file|filter)\//.test(a) ? 1 : 0) - (/\/(file|filter)\//.test(b) ? 1 : 0) || a.localeCompare(b));
const only = process.env.SHOT_ONLY ? new RegExp(process.env.SHOT_ONLY) : null;   // e.g. SHOT_ONLY='^https://www.gmbcreditunion.com/(loans|savings)/' for a subset
const shoot = only ? pages.filter(u => only.test(u)) : pages;
console.log('pages to shoot', shoot.length);
const { browser, ctx } = await launch();
await ctx.route('**/*', r => (/cumemberapp\.com/.test(r.request().url()) ? r.abort() : r.continue()));
const log = readJSON(outDir + '/_log.json', {});
for (const [w, h] of [[1440, 900], [768, 1024], [390, 844]]) {
  const page = await ctx.newPage(); await page.setViewportSize({ width: w, height: h });
  for (const u of shoot) {
    const slug = pathFor(u).replace(/^\/|\/$/g, '').replace(/\//g, '__') || 'home';
    const f = path.join(outDir, String(w), slug + '.png'); if (fs.existsSync(f)) continue;
    const target = baseOverride ? u.replace(/^https:\/\/www\.gmbcreditunion\.com/, baseOverride) : u;
    await throttle();
    try {
      await page.goto(target, { waitUntil: 'load', timeout: 60000 });
      await page.evaluate(async () => { // trigger lazy-load by scrolling
        const total = document.body.scrollHeight; for (let y = 0; y < total; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
      await sleep(1200);
      await page.addStyleTag({ content: '*,*::before,*::after{animation-play-state:paused!important;transition:none!important;caret-color:transparent!important} .cky-consent-container,.cky-overlay,.cky-btn-revisit-wrapper,.cky-modal,.cookie-banner{display:none!important}' });   // hide CookieYes banner (GTM-injected) so diffs compare page content, not the consent overlay
      ensure(f); await page.screenshot({ path: f, fullPage: true });
      log[`${w}:${u}`] = { ok: true, file: path.relative(ROOT, f) };
    } catch (e) { log[`${w}:${u}`] = { ok: false, err: String(e.message).slice(0, 120) }; }
    writeJSON(outDir + '/_log.json', log);
  }
  await page.close(); console.log('done width', w);
}
await browser.close(); console.log('SHOTS COMPLETE');
