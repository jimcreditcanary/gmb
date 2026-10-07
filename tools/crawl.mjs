import fs from 'fs'; import path from 'path';
import { launch, throttle, norm, allowed, isInternal, ROOT, HOST, readJSON, writeJSON, htmlSavePath, assetSavePath, ensure, sleep } from './lib.mjs';

const sitemap = readJSON(ROOT + '/audit/raw/sitemap-urls.json');
const lastmodBySitemap = Object.fromEntries(sitemap.map(u => [u.loc, u.lastmod]));
const wb = readJSON(ROOT + '/audit/raw/wayback-probe.json', []);
const seeds = new Map();
const addSeed = (u, source) => { const n = norm(u); if (n && isInternal(n) && allowed(n) && !seeds.has(n)) seeds.set(n, source); };
addSeed('https://' + HOST + '/', 'sitemap');
sitemap.forEach(u => addSeed(u.loc, 'sitemap'));
['/feed/', '/comments/feed/', '/our-blog/feed/', '/sitemap_index.xml', '/sitemap.xml', '/robots.txt', '/favicon.ico', '/apple-touch-icon.png', '/wp-sitemap.xml', '/humans.txt', '/ads.txt', '/author/', '/blog/', '/news/', '/category/uncategorised/feed/', '/our-blog/page/2/', '/page/2/', '/search/', '/?s=test', '/404-does-not-exist-abc/']
  .forEach(p => addSeed('https://' + HOST + p, 'probe'));
wb.filter(w => [200, 301, 302, 307, 308].includes(w.live_status)).forEach(w => addSeed(w.url, 'wayback'));

const DOC_RE = /\.(pdf|docx?|xlsx?|pptx?|zip|csv|png|jpe?g|gif|svg|webp|avif|ico|mp4|webm|mov|mp3|woff2?|ttf|otf|eot|css|js|json|xml|txt|lottie)$/i;
const isDoc = u => { const p = new URL(u).pathname; return DOC_RE.test(p) || /\/feed\/?$/.test(p); };

const inventory = readJSON(ROOT + '/audit/raw/inventory.json', {});
const linksIn = Object.fromEntries(Object.entries(readJSON(ROOT + '/audit/raw/links-in.json', {})).map(([k, v]) => [k, new Set(v)]));
const thirdParty = readJSON(ROOT + '/audit/raw/third-party.json', {});
const assetsSeen = readJSON(ROOT + '/audit/raw/assets-captured.json', {});
const savedSourceOf = readJSON(ROOT + '/audit/raw/source-of.json', {});
const queue = [...seeds.keys()];
const queued = new Set(queue);
const sourceOf = { ...savedSourceOf, ...Object.fromEntries(seeds) };
for (const u of Object.keys(savedSourceOf)) if (!inventory[u] && !queued.has(u) && allowed(u) && isInternal(u)) { queued.add(u); queue.push(u); }   // resume pending discoveries
let processed = 0;

const { browser, ctx } = await launch();
// Block navigation to other hosts; capture same-origin assets; log third-party resources
await ctx.route('**/*', async route => {
  const req = route.request(); const u = req.url();
  if (req.isNavigationRequest() && req.frame() === req.frame().page().mainFrame() && !isInternal(u)) return route.abort();
  if (!allowed(u) && isInternal(u)) return route.abort();
  if (/cumemberapp\.com/.test(u)) return route.abort();
  return route.continue();
});
ctx.on('response', async resp => {
  const u = resp.url(); const req = resp.request(); const type = req.resourceType();
  if (!isInternal(u)) { const k = u.split('?')[0]; thirdParty[k] = thirdParty[k] || { count: 0, type, hosts: new URL(u).host }; thirdParty[k].count++; return; }
  if (type === 'document' && req.frame() === req.frame().page().mainFrame()) return;
  const bare = u.split('?')[0];
  if (assetsSeen[bare]?.saved) return;
  const ct = (resp.headers()['content-type'] || '').split(';')[0];
  const rec = assetsSeen[bare] = assetsSeen[bare] || { status: resp.status(), type: ct, saved: false, bytes: 0, from_status: resp.status() };
  if (resp.status() !== 200) return;
  try { const body = await resp.body(); const f = assetSavePath(bare); ensure(f); fs.writeFileSync(f, body); rec.saved = true; rec.bytes = body.length; rec.file = path.relative(ROOT, f); } catch (e) { rec.err = String(e.message).slice(0, 80); }
});
const page = await ctx.newPage();

function templateGuess(bodyClass, url) {
  const c = ' ' + bodyClass + ' ';
  if (/ error404 /.test(c)) return '404';
  if (/ home /.test(c)) return 'home';
  if (/ single-post /.test(c)) return 'blog-post';
  if (/ single-file /.test(c)) return 'file-single';
  if (/ post-type-archive-file /.test(c)) return 'file-archive';
  if (/ tax-filter /.test(c)) return 'filter-archive';
  if (/ category /.test(c)) return 'category-archive';
  if (/ tag /.test(c)) return 'tag-archive';
  if (/ author /.test(c)) return 'author-archive';
  if (/ search /.test(c)) return 'search';
  if (/ blog /.test(c) || / archive /.test(c)) return 'blog-index';
  if (/ page-template-page-builder/.test(c)) return 'page-builder';
  const m = c.match(/ page-template-([a-z0-9-]+?)(?:-php)? /); if (m && m[1] !== 'default') return 'page-' + m[1];
  if (/ page /.test(c)) return 'page-default';
  if (/ single /.test(c)) return 'single-other';
  return 'unknown';
}

async function probeDoc(u) {
  // follow redirects manually to record chain
  const chain = []; let cur = u; let r;
  for (let hop = 0; hop < 6; hop++) {
    await throttle();
    r = await ctx.request.get(cur, { maxRedirects: 0, timeout: 45000 });
    const s = r.status(); const loc = r.headers()['location'];
    if ([301, 302, 307, 308].includes(s) && loc) { chain.push({ url: cur, status: s, to: norm(loc, cur) }); cur = norm(loc, cur); continue; }
    break;
  }
  const ct = (r.headers()['content-type'] || '').split(';')[0];
  const rec = { url: u, status: chain.length ? chain[0].status : r.status(), final_status: r.status(), final_url: cur, redirect_target: chain.length ? chain[0].to : '', redirect_chain: chain, content_type: ct, last_modified: r.headers()['last-modified'] || '', kind: 'document' };
  if (r.status() === 200 && isInternal(cur)) {
    try { const body = await r.body(); const f = /\/feed\/?$/.test(new URL(cur).pathname) || /xml|html|plain/.test(ct) && !DOC_RE.test(new URL(cur).pathname) ? htmlSavePath(cur).replace(/index\.html$/, 'index' + (/xml/.test(ct) ? '.xml' : /plain/.test(ct) ? '.txt' : '.html')) : assetSavePath(cur); ensure(f); fs.writeFileSync(f, body); rec.file = path.relative(ROOT, f); rec.bytes = body.length;
      if (/xml/.test(ct)) { for (const m of body.toString().matchAll(/<(?:loc|link)>([^<]+)</g)) enqueue(m[1], cur); for (const m of body.toString().matchAll(/href="(https?:\/\/(?:www\.)?gmbcreditunion\.com[^"]*)"/g)) enqueue(m[1], cur); }
    } catch (e) { rec.err = String(e.message).slice(0, 100); }
  }
  return rec;
}
function enqueue(u, from) {
  const n = norm(u, from); if (!n || !isInternal(n) || !allowed(n)) return;
  if (/replytocom=|\?share=|\?s=.*&|wp-login|action=|utm_/.test(n) && n !== 'https://' + HOST + '/?s=test') return;
  if (/\?page=\d+/.test(n) && (sourceOf[n] !== 'wayback')) { if (!queued.has(n)) junkSeen.add(n); return; }   // '?page=N' duplicates emitted by pagination markup
  if (from) { (linksIn[n] = linksIn[n] || new Set()).add(from); }
  if (!queued.has(n)) { queued.add(n); queue.push(n); sourceOf[n] = sourceOf[n] || 'crawl'; }
}

async function crawlHtml(u) {
  await throttle();
  let resp;
  try { resp = await page.goto(u, { waitUntil: 'load', timeout: 60000 }); } catch (e) { return { url: u, status: 'ERR', error: String(e.message).slice(0, 150), kind: 'html' }; }
  if (!resp) return { url: u, status: 'ERR', error: 'no response (aborted navigation?)', kind: 'html' };
  const chain = []; let rq = resp.request().redirectedFrom();
  while (rq) { const rr = await rq.response(); chain.unshift({ url: rq.url(), status: rr?.status(), to: rr?.headers()['location'] }); rq = rq.redirectedFrom(); }
  const finalUrl = resp.url(); const status = chain.length ? chain[0].status : resp.status();
  const rec = { url: u, status, final_status: resp.status(), final_url: finalUrl, redirect_target: chain.length ? norm(chain[0].to, chain[0].url) : '', redirect_chain: chain, content_type: (resp.headers()['content-type'] || '').split(';')[0], last_modified_header: resp.headers()['last-modified'] || '', kind: 'html', x_robots_tag: resp.headers()['x-robots-tag'] || '' };
  if (finalUrl !== u && norm(finalUrl) !== u) { enqueue(finalUrl, null); rec.note = 'redirected; final URL crawled separately'; }
  if (!/html/.test(rec.content_type)) return rec;
  await sleep(800);  // let lazy bits settle
  let raw = ''; try { raw = await resp.text(); } catch { raw = await page.content(); rec.note = (rec.note || '') + ' raw via DOM'; }
  if (finalUrl === u || norm(finalUrl) === u) { const f = htmlSavePath(u); ensure(f); fs.writeFileSync(f, raw); rec.file = path.relative(ROOT, f); rec.html_bytes = raw.length; }
  const meta = await page.evaluate(() => {
    const q = s => document.querySelector(s); const attr = (s, a) => q(s)?.getAttribute(a) ?? '';
    const txt = el => (el?.innerText || '').replace(/\s+/g, ' ').trim();
    const main = q('main') || q('#main') || q('.site-main') || q('#content') || q('.content') || document.body;
    const clone = main.cloneNode(true); clone.querySelectorAll('header,footer,nav,script,style,noscript,.site-header,.site-footer,#site-header,#site-footer').forEach(n => n.remove());
    const bodyText = txt(clone); const words = bodyText ? bodyText.split(/\s+/).length : 0;
    const schema = []; document.querySelectorAll('script[type="application/ld+json"]').forEach(s => { try { const j = JSON.parse(s.textContent); const walk = o => { if (!o) return; if (Array.isArray(o)) return o.forEach(walk); if (typeof o === 'object') { if (o['@type']) schema.push(...[].concat(o['@type'])); if (o['@graph']) walk(o['@graph']); } }; walk(j); } catch { schema.push('INVALID_JSONLD'); } });
    const anchors = [...document.querySelectorAll('a[href]')].map(a => ({ href: a.href, text: (a.innerText || a.getAttribute('aria-label') || '').trim().slice(0, 80), rel: a.rel, target: a.target }));
    const imgs = [...document.querySelectorAll('img')].map(i => ({ src: i.currentSrc || i.src, srcset: i.getAttribute('srcset') || '', alt: i.getAttribute('alt'), w: i.naturalWidth, h: i.naturalHeight, loading: i.getAttribute('loading') }));
    const pics = [...document.querySelectorAll('source[srcset],source[src]')].map(s => s.getAttribute('srcset') || s.getAttribute('src'));
    const bg = []; for (const el of document.querySelectorAll('*')) { const b = getComputedStyle(el).backgroundImage; if (b && b !== 'none') for (const m of b.matchAll(/url\(["']?([^"')]+)/g)) bg.push(m[1]); }
    const forms = [...document.querySelectorAll('form')].map(f => ({ action: f.getAttribute('action'), method: f.method, id: f.id, cls: f.className, fields: [...f.querySelectorAll('input,select,textarea,button')].map(i => ({ tag: i.tagName.toLowerCase(), type: i.type, name: i.name, id: i.id, required: i.required, value: i.type === 'hidden' ? i.value : undefined, placeholder: i.placeholder })) }));
    const iframes = [...document.querySelectorAll('iframe')].map(i => i.src);
    const scripts = [...document.querySelectorAll('script[src]')].map(s => s.src);
    const inlineScripts = [...document.querySelectorAll('script:not([src])')].filter(s => !/ld\+json/.test(s.type)).map(s => s.textContent.trim().slice(0, 200));
    const links = [...document.querySelectorAll('link[href]')].map(l => ({ rel: l.rel, href: l.href, as: l.getAttribute('as') }));
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => h.tagName.toLowerCase() + ': ' + txt(h).slice(0, 120));
    const hasPw = !!q('form.ppw-form, .ppw-ppf-input-container, form.post-password-form, input[name="post_password"]');
    const embeds = [...document.querySelectorAll('[class*="trustpilot"], [data-locale][data-template-id], .fb-page, .twitter-timeline, dotlottie-player, lottie-player, video, audio, [class*="mc-embed"], .wpcf7')].map(e => e.tagName.toLowerCase() + '.' + e.className.toString().slice(0, 60));
    const videos = [...document.querySelectorAll('video source, video[src]')].map(v => v.src || v.getAttribute('src'));
    return {
      title: document.title, meta_description: attr('meta[name="description"]', 'content'), canonical: attr('link[rel="canonical"]', 'href'), robots_meta: attr('meta[name="robots"]', 'content'),
      h1: [...document.querySelectorAll('h1')].map(h => txt(h)).join(' | '), h1_count: document.querySelectorAll('h1').length,
      og_title: attr('meta[property="og:title"]', 'content'), og_description: attr('meta[property="og:description"]', 'content'), og_image: attr('meta[property="og:image"]', 'content'), og_type: attr('meta[property="og:type"]', 'content'), og_url: attr('meta[property="og:url"]', 'content'),
      twitter_card: attr('meta[name="twitter:card"]', 'content'), twitter_title: attr('meta[name="twitter:title"]', 'content'), twitter_image: attr('meta[name="twitter:image"]', 'content'),
      article_modified: attr('meta[property="article:modified_time"]', 'content'), article_published: attr('meta[property="article:published_time"]', 'content'),
      schema_types: [...new Set(schema)], word_count: words, body_class: document.body.className, lang: document.documentElement.lang, generator: attr('meta[name="generator"]', 'content'),
      anchors, imgs, pics, bg: [...new Set(bg)], forms, iframes, scripts, inlineScripts, links, headings, hasPw, embeds, videos,
      main_selector: main === document.body ? 'body' : (main.id ? '#' + main.id : main.tagName.toLowerCase() + '.' + main.className),
      html_text_sample: bodyText.slice(0, 300)
    };
  });
  Object.assign(rec, meta);
  rec.template_guess = templateGuess(meta.body_class, u);
  rec.internal_links_out = [...new Set(meta.anchors.map(a => norm(a.href, finalUrl)).filter(h => h && isInternal(h)))];
  rec.external_links_out = [...new Set(meta.anchors.map(a => a.href).filter(h => h && !isInternal(h) && /^https?:/.test(h)))];
  rec.images_count = meta.imgs.length;
  // discover
  for (const a of meta.anchors) enqueue(a.href, finalUrl);
  for (const l of meta.links) if (/alternate|shortlink|next|prev|canonical/.test(l.rel) && isInternal(l.href)) enqueue(l.href, null);
  for (const i of meta.imgs) { if (isInternal(i.src)) enqueueAsset(i.src); for (const s of i.srcset.split(',')) { const su = s.trim().split(/\s+/)[0]; if (su) enqueueAsset(norm(su, finalUrl)); } }
  for (const p of meta.pics) for (const s of (p || '').split(',')) { const su = s.trim().split(/\s+/)[0]; if (su) enqueueAsset(norm(su, finalUrl)); }
  for (const b of meta.bg) enqueueAsset(norm(b, finalUrl));
  for (const v of meta.videos) enqueueAsset(norm(v, finalUrl));
  for (const a of meta.anchors) if (isInternal(a.href) && DOC_RE.test(new URL(a.href).pathname)) enqueueAsset(norm(a.href));
  return rec;
}
const assetRefs = new Set(readJSON(ROOT + '/audit/raw/asset-refs.json', [])); const junkSeen = new Set(readJSON(ROOT + '/audit/raw/junk-skipped.json', []));
function enqueueAsset(u) { if (u && isInternal(u)) assetRefs.add(u.split('?')[0]); }

function save() {
  writeJSON(ROOT + '/audit/raw/inventory.json', inventory);
  writeJSON(ROOT + '/audit/raw/links-in.json', Object.fromEntries(Object.entries(linksIn).map(([k, v]) => [k, [...v]])));
  writeJSON(ROOT + '/audit/raw/third-party.json', thirdParty);
  writeJSON(ROOT + '/audit/raw/assets-captured.json', assetsSeen);
  writeJSON(ROOT + '/audit/raw/asset-refs.json', [...assetRefs]);
  writeJSON(ROOT + '/audit/raw/source-of.json', sourceOf); writeJSON(ROOT + '/audit/raw/junk-skipped.json', [...junkSeen]);
}
const t0 = Date.now();
while (queue.length) {
  const u = queue.shift();
  if (inventory[u] && inventory[u].status !== 'ERR') continue;
  try {
    const rec = isDoc(u) ? await probeDoc(u) : await crawlHtml(u);
    rec.source = sourceOf[u] || 'crawl'; rec.sitemap_lastmod = lastmodBySitemap[u] || '';
    inventory[u] = rec;
  } catch (e) { inventory[u] = { url: u, status: 'ERR', error: String(e.message).slice(0, 150), source: sourceOf[u] }; }
  processed++;
  if (processed % 20 === 0) { save(); console.log(`${processed} done, ${queue.length} queued, ${((Date.now() - t0) / 60000).toFixed(1)} min`); }
}
save();
await browser.close();
console.log('CRAWL COMPLETE', processed, 'urls in', ((Date.now() - t0) / 60000).toFixed(1), 'min');
