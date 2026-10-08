import { chromium } from 'playwright'; import fs from 'fs'; import sharp from 'sharp';
const out = '/private/tmp/claude-501/-Users-jamesfell/a556f966-20d8-4501-a3d0-c63df085ba16/scratchpad/monzo'; fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36' });
const p = await ctx.newPage(); await p.goto('https://monzo.com/', { waitUntil: 'networkidle', timeout: 60000 });
try { await p.click('text=Reject all', { timeout: 4000 }); } catch {}
await p.evaluate(async () => { const t = document.body.scrollHeight; for (let y = 0; y < t; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } window.scrollTo(0, 0); });
await p.waitForTimeout(1000);
const outline = await p.evaluate(() => {
  const secs = [...document.querySelectorAll('main section, main > div > section, main > div, body > div > section')].filter(s => s.getBoundingClientRect().height > 120);
  const seen = new Set(); const rows = [];
  for (const s of secs) { if ([...seen].some(x => x.contains(s))) continue; seen.add(s);
    const r = s.getBoundingClientRect(); const cs = getComputedStyle(s);
    const h = [...s.querySelectorAll('h1,h2,h3')].slice(0, 6).map(x => x.tagName + ': ' + x.textContent.trim().replace(/\s+/g, ' ').slice(0, 90));
    const btns = [...s.querySelectorAll('a[class*=utton], button, a[href*="signup"], a[href*="download"]')].slice(0, 6).map(x => x.textContent.trim().replace(/\s+/g, ' ').slice(0, 40)).filter(Boolean);
    const imgs = s.querySelectorAll('img, video, picture').length; const cards = s.querySelectorAll('li, article, [class*="ard"]').length;
    const bg = cs.backgroundColor; const text = s.innerText.replace(/\s+/g, ' ').slice(0, 220);
    rows.push({ top: Math.round(r.top + window.scrollY), height: Math.round(r.height), bg, headings: h, buttons: [...new Set(btns)], images: imgs, cards, text });
  }
  return rows;
});
fs.writeFileSync(out + '/outline.json', JSON.stringify(outline, null, 1));
await p.screenshot({ path: out + '/desktop.png', fullPage: true });
const m = await ctx.newPage(); await m.setViewportSize({ width: 390, height: 844 }); await m.goto('https://monzo.com/', { waitUntil: 'networkidle', timeout: 60000 }); try { await m.click('text=Reject all', { timeout: 4000 }); } catch {}
await m.evaluate(async () => { const t = document.body.scrollHeight; for (let y = 0; y < t; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } window.scrollTo(0, 0); }); await m.waitForTimeout(800);
await m.screenshot({ path: out + '/mobile.png', fullPage: true });
await b.close();
const md = await sharp(out + '/desktop.png').metadata(); console.log('desktop', md.width, md.height, 'sections', outline.length);
for (let i = 0; i * 4500 < md.height; i++) await sharp(out + '/desktop.png').extract({ left: 0, top: i * 4500, width: md.width, height: Math.min(4500, md.height - i * 4500) }).resize({ width: 1000 }).png({ compressionLevel: 9 }).toFile(`${out}/v-desktop-${i}.png`);
outline.forEach((r, i) => console.log(`#${i} top=${r.top} h=${r.height} bg=${r.bg} imgs=${r.images} cards=${r.cards}\n   ${r.headings.join(' | ')}\n   btn: ${r.buttons.join(' / ')}\n   ${r.text.slice(0, 160)}`));
