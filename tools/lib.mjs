import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
export const ROOT = '/Users/jamesfell/gmb';
export const HOST = 'www.gmbcreditunion.com';
export const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36';
export const DISALLOW = [/^\/wp-json\//, /^\/\?rest_route=/, /^\/wp-admin/, /^\/wp-login/, /^\/xmlrpc\.php/];
let last = 0;
export async function throttle(ms = 520) {   // max ~2 req/sec top-level
  const now = Date.now(); const wait = last + ms - now;
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  last = Date.now();
}
export function allowed(u) { try { const p = new URL(u); return !DISALLOW.some(re => re.test(p.pathname + p.search)); } catch { return false; } }
export function isInternal(u) { try { const h = new URL(u).host; return h === HOST || h === 'gmbcreditunion.com'; } catch { return false; } }
export function norm(u, base = 'https://' + HOST + '/') {
  try { const x = new URL(u, base); x.hash = ''; if (x.host === 'gmbcreditunion.com') x.host = HOST; if (x.protocol === 'http:') x.protocol = 'https:'; return x.href; } catch { return null; }
}
export function pathFor(u) { const p = new URL(u); return decodeURIComponent(p.pathname) + (p.search ? '__q_' + p.search.replace(/[^a-z0-9]/gi, '_') : ''); }
export function htmlSavePath(u) { let p = pathFor(u); if (!p.endsWith('/')) p += '/'; return path.join(ROOT, 'source/html', p, 'index.html'); }
export function assetSavePath(u) { const p = new URL(u).pathname; return path.join(ROOT, 'source/media', decodeURIComponent(p)); }
export function ensure(f) { fs.mkdirSync(path.dirname(f), { recursive: true }); }
export async function launch() {
  const browser = await chromium.launch({ headless: false, channel: 'chrome', args: ['--window-position=2000,0'] });
  const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1440, height: 900 }, locale: 'en-GB', ignoreHTTPSErrors: false });
  return { browser, ctx };
}
export function readJSON(f, d) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } }
export function writeJSON(f, o) { ensure(f); fs.writeFileSync(f, JSON.stringify(o, null, 1)); }
export const sleep = ms => new Promise(r => setTimeout(r, ms));
