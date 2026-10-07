import fs from 'fs'; import path from 'path'; import * as csstree from 'css-tree';
import { ROOT, readJSON, writeJSON } from './lib.mjs';
const cssDir = ROOT + '/source/media';
const files = []; (function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : /\.css$/.test(f) && files.push(p); } })(cssDir);
const inv = readJSON(ROOT + '/audit/raw/inventory.json');
const inlineSet = new Map(); for (const r of Object.values(inv)) { if (r.file && /index\.html$/.test(r.file)) { const h = fs.readFileSync(path.join(ROOT, r.file), 'utf8'); for (const m of h.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)) { const key = m[2].replace(/\s+/g, ' ').trim(); if (!inlineSet.has(key)) inlineSet.set(key, { attrs: m[1], css: m[2], pages: 0 }); inlineSet.get(key).pages++; } } }
const inlineStyles = [...inlineSet.values()];
const isVendor = sel => /\.fa[-\s,:]|\bfa-|featherlight|slick|animate|wp-block|has-[a-z-]+-(color|background|font-size)|mega-|dashicons|wpcf7|ppw|lottie|modern-normalize|wp-img|wp-element|screen-reader-text/.test(sel);
const colours = {}, fonts = {}, weights = {}, sizes = {}, lineHeights = {}, spacing = {}, radii = {}, shadows = {}, breakpoints = {}, transitions = {}, zIndex = {}, maxWidths = {}, letterSpacing = {}, customProps = {}, fontFaces = [];
const add = (map, key, ctx) => { if (!map[key]) map[key] = { count: 0, theme_count: 0, properties: {}, selectors: [] }; map[key].count++; if (!ctx.vendor) map[key].theme_count++; map[key].properties[ctx.prop] = (map[key].properties[ctx.prop] || 0) + 1; if (map[key].selectors.length < 6 && !ctx.vendor && !map[key].selectors.includes(ctx.sel)) map[key].selectors.push(ctx.sel); };
function scan(css, srcName) {
  let ast; try { ast = csstree.parse(css, { parseValue: true, parseAtrulePrelude: true, positions: false }); } catch (e) { console.warn('parse fail', srcName, e.message); return; }
  csstree.walk(ast, { visit: 'Atrule', enter(node) { if (node.name === 'media' && node.prelude) { const q = csstree.generate(node.prelude); breakpoints[q] = (breakpoints[q] || 0) + 1; } if (node.name === 'font-face') { const d = {}; node.block && node.block.children.forEach(c => { if (c.type === 'Declaration') d[c.property] = csstree.generate(c.value); }); d.source = srcName; fontFaces.push(d); } } });
  csstree.walk(ast, { visit: 'Rule', enter(rule) {
    const sel = csstree.generate(rule.prelude).slice(0, 120); const vendor = isVendor(sel) || /vendor|font-awesome|normalize|animate|featherlight|slick|megamenu|contact-form|dashicons|wp-includes|vendor-inline/.test(srcName);
    rule.block.children.forEach(decl => { if (decl.type !== 'Declaration') return; const prop = decl.property; const val = csstree.generate(decl.value); const ctx = { prop, sel, vendor };
      if (prop.startsWith('--')) { if (!vendor && !/^--wp--/.test(prop)) customProps[prop] = val; if (/^--wp--|^--fa-/.test(prop)) return; }
      for (const m of val.matchAll(/#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|(?<![-\w])(?:white|black|transparent|currentColor|red|blue|green|grey|gray|orange|yellow|purple|navy|pink)(?![-\w])/gi)) add(colours, m[0].toLowerCase(), ctx);
      if (prop === 'font-family' || prop === 'font') for (const f of val.split(',')) { const n = f.replace(/^[^"']*?(\d+(\.\d+)?(px|rem|em)\/?[\d.]*\s*)?/, '').replace(/["']/g, '').trim(); if (n && !/^\d/.test(n)) add(fonts, n, ctx); }
      if (prop === 'font-weight') add(weights, val, ctx); if (prop === 'font' ) { const w = val.match(/\b([1-9]00|bold|normal)\b/); if (w) add(weights, w[1], ctx); }
      if (prop === 'font-size') add(sizes, val, ctx); if (prop === 'line-height') add(lineHeights, val, ctx); if (prop === 'letter-spacing') add(letterSpacing, val, ctx);
      if (/^(margin|padding|gap|row-gap|column-gap|top|bottom|left|right)(-\w+)?$/.test(prop)) for (const t of val.split(/\s+/)) if (/^-?\d*\.?\d+(px|rem|em|%|vw|vh)$|^0$/.test(t)) add(spacing, t, ctx);
      if (/^border(-\w+)?-radius$/.test(prop)) add(radii, val, ctx); if (/box-shadow|text-shadow/.test(prop)) add(shadows, val, ctx);
      if (prop === 'transition' || prop === 'transition-duration') add(transitions, val, ctx); if (prop === 'z-index') add(zIndex, val, ctx); if (prop === 'max-width') add(maxWidths, val, ctx);
    }); } });
}
for (const f of files) scan(fs.readFileSync(f, 'utf8'), path.relative(cssDir, f));
inlineStyles.forEach((s, i) => { const vend = /global-styles|classic-theme|wp-img|ppwp|wp-block|wp-emoji/.test(s.attrs) || /--wp--preset|\.ppw-/.test(s.css); scan(s.css, (vend ? 'vendor-inline-' : 'inline-style-') + i + (s.attrs.match(/id="([^"]+)"/) || [])[1]); });
const sortObj = o => Object.fromEntries(Object.entries(o).sort((a, b) => (b[1].theme_count - a[1].theme_count) || (b[1].count - a[1].count)));
const themeOnly = o => Object.fromEntries(Object.entries(sortObj(o)).filter(([k, v]) => v.theme_count > 0));
// logo variants
const logos = {}; (function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/logo|favicon|apple-touch|icon-?\d|brand/i.test(f) && /\.(png|svg|jpe?g|ico|webp)$/i.test(f)) logos[path.relative(cssDir, p)] = fs.statSync(p).size; } })(cssDir);
const out = { generated: new Date().toISOString(), css_files_scanned: files.map(f => path.relative(cssDir, f)), inline_style_blocks_scanned: inlineStyles.map((s, i) => ({ id: (s.attrs.match(/id="([^"]+)"/) || [])[1] || ('anon-' + i), pages: s.pages, bytes: s.css.length })),
  note: 'theme_count = usages outside vendor CSS (Font Awesome, normalize, animate, featherlight, slick, megamenu, CF7, WP blocks). Full counts kept for reference.',
  colours: themeOnly(colours), colours_all: sortObj(colours), font_families: sortObj(fonts), font_faces: fontFaces, font_weights: themeOnly(weights), font_sizes: themeOnly(sizes), line_heights: themeOnly(lineHeights), letter_spacing: themeOnly(letterSpacing),
  spacing_scale: themeOnly(spacing), border_radii: themeOnly(radii), shadows: themeOnly(shadows), transitions: themeOnly(transitions), z_index: themeOnly(zIndex), max_widths: themeOnly(maxWidths), breakpoints: Object.fromEntries(Object.entries(breakpoints).sort((a, b) => b[1] - a[1])), custom_properties: customProps, logo_and_icon_files: logos };
writeJSON(ROOT + '/audit/design-tokens.json', out);
console.log('colours(theme)', Object.keys(out.colours).length, 'fonts', Object.keys(out.font_families), 'font-faces', fontFaces.length, 'breakpoints', Object.keys(out.breakpoints).length);
