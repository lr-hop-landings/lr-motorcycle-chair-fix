/** Export the five built, user-owned Astro landings as Gutenberg primitives.
 * Run after `npm run build`. Generated assets are scoped to this import profile.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { parse, serialize, serializeOuter } from 'parse5';
import postcss from 'postcss';

const root = path.resolve(import.meta.dirname, '..');
const plugin = path.join(root, 'wordpress-plugin/lenremont-page-importer');
const out = path.join(plugin, 'assets/reference');
await fs.mkdir(out, { recursive: true });
await fs.mkdir(path.join(plugin, 'blocks/reference-widget/templates'), { recursive: true });
const pages = [
  { key: 'main', sourcePath: '/', path: '/peretyazhka-sidenij-mototransporta/', example: 'main-motorcycle-seats.json' },
  ...['motocikly', 'skutery', 'kvadrocikly', 'baggi'].map(key => ({ key, sourcePath: `/${key}/`, path: `/peretyazhka-sidenij-mototransporta-${key}/`, example: `${key}.json` }))
];
const walk = (node, fn) => { fn(node); (node.childNodes || []).forEach(n => walk(n, fn)); };
const find = (node, predicate) => { let result; walk(node, n => { if (!result && predicate(n)) result = n; }); return result; };
const attrs = node => Object.fromEntries((node.attrs || []).filter(a => !a.name.startsWith('data-astro-')).map(a => [a.name, a.value]));
const plain = node => (node.nodeName === '#text' ? node.value : (node.childNodes || []).map(plain).join('')).trim();
const art = {};
const images = new Map();
const widgets = {};
let sharedCss, sharedScripts;
const catalog = [];
const rootId = 'hop-gutenberg';
const pageSeo = JSON.parse(await fs.readFile(path.join(root, 'wordpress-plugin/seo-pages.json'), 'utf8'));
// Keep exact-profile styles out of the reusable design-system pages, including
// the editor canvas where both stylesheets are registered at the same time.
const referenceScope = '#' + rootId + '.lr-reference';

function localAsset(url) {
  if (!url?.startsWith('/') || url.startsWith('//')) return url;
  const source = path.resolve(root, 'dist', '.' + url);
  if (!source.startsWith(path.join(root, 'dist') + path.sep)) throw new Error('Asset outside dist');
  const filename = path.basename(url);
  images.set(source, filename);
  return '{{pluginUrl}}/assets/reference/' + filename;
}
const inlineTags = new Set(['a', 'span', 'strong', 'b', 'i', 'em', 'br', 'small', 'code', 'sup', 'sub']);
const isInline = node => node.nodeName === '#text' || (inlineTags.has(node.tagName) && (node.childNodes || []).every(isInline));

for (const page of pages) {
const html = await fs.readFile(path.join(root, 'dist', '.' + page.sourcePath, 'index.html'), 'utf8');
const doc = parse(html);
const body = find(doc, n => n.tagName === 'body');
const main = find(body, n => n.tagName === 'main');
walk(doc, node => {
  if (!node.attrs) return;
  node.attrs = node.attrs.filter(a => !a.name.startsWith('data-astro-'));
  const at = attrs(node);
  for (const attr of node.attrs) {
    if (attr.name === 'href') {
      if (at.class === 'hero-back') attr.value = pages[0].path;
      else {
        const target = pages.find(p => p.sourcePath === attr.value.split('#')[0]);
        if (target) attr.value = target.path + (attr.value.includes('#') ? '#' + attr.value.split('#')[1] : '');
      }
    }
    if (attr.name === 'data-page-path' || (attr.name === 'value' && at.name === 'page_path')) attr.value = page.path;
  }
});
const nodes = children => children.flatMap(node => convert(node) || []);
function convert(node) {
  if (node.nodeName === '#comment') return null;
  if (node.nodeName === '#text') return node.value.trim() ? { type: 'text', tag: 'span', raw: true, text: node.value.replace(/\s+/g, ' '), attributes: {} } : null;
  if (!node.tagName || ['script', 'style', 'link'].includes(node.tagName)) return null;
  const at = attrs(node);
  if (node.tagName === 'svg') {
    const markup = serializeOuter(node);
    const key = 'art-' + crypto.createHash('sha256').update(markup).digest('hex').slice(0, 12);
    art[key] = markup;
    return { type: 'art', key };
  }
  if (node.tagName === 'dialog' || at.class === 'mobile-bar') {
    const key = node.tagName === 'dialog' ? at.id + (at.id === 'callback' && page.key !== 'main' ? '-' + page.key : '') : 'mobile-bar';
    const markup = serializeOuter(node);
    if (widgets[key] && widgets[key] !== markup) throw new Error('Conflicting widget: ' + key);
    widgets[key] = markup;
    return { type: 'widget', key };
  }
  if (at.id === 'quiz-app') {
    return { type: 'quiz', attributes: at };
  }
  if (node.tagName === 'img') {
    at.src = localAsset(at.src);
    return { type: 'image', attributes: at };
  }
  if (node.tagName === 'noscript') return null;
  if (/^(p|h[1-6]|strong|span|figcaption|small|summary)$/.test(node.tagName) && (node.childNodes || []).every(isInline)) {
    return { type: 'text', tag: node.tagName, text: serialize(node), attributes: at };
  }
  const result = { type: 'element', tag: node.tagName, attributes: at, children: nodes(node.childNodes || []) };
  if (node.tagName === 'section') {
    result.name = plain(find(node, n => /^h[1-6]$/.test(n.tagName)) || node).slice(0, 110);
  }
  return result;
}
const sectionNodes = main.childNodes.filter(n => n.tagName === 'section');
const manifest = {
  version: 2, profile: 'astro-main-v1',
  rootId,
  title: plain(find(doc, n => n.tagName === 'title')).replace(/\s*\|\s*Ленремонт$/, ''),
  slug: page.path.replace(/^\/|\/$/g, ''), path: page.path, vehicle: page.key === 'main' ? '' : page.key,
  source: page.key === 'main' ? 'src/pages/index.astro' : 'src/pages/[vehicle].astro',
  seo: { ...pageSeo[page.key], ogTitle: pageSeo[page.key].title, ogDescription: pageSeo[page.key].description },
  before: nodes(body.childNodes.filter(n => n !== main && body.childNodes.indexOf(n) < body.childNodes.indexOf(main))),
  sections: sectionNodes.map(n => ({ type: 'reference', tree: convert(n) })),
  after: nodes(body.childNodes.filter(n => body.childNodes.indexOf(n) > body.childNodes.indexOf(main)))
};
// The icon sprite lives inside main before its first section.
manifest.before.push(...nodes(main.childNodes.filter(n => n.tagName && n.tagName !== 'section')));
await fs.writeFile(path.join(plugin, 'examples', page.example), JSON.stringify(manifest, null, 2) + '\n');
catalog.push({ ...page, title: manifest.title, slug: manifest.slug, sections: manifest.sections.length });

// Preserve the source cascade, media queries and animations, but never style WP chrome.
// Local servers need not send a CSS charset header (e.g. FAQ's minus glyph).
let css = '@charset "UTF-8";\n';
const cssLinks = [];
walk(doc, n => { const a = attrs(n); if (n.tagName === 'link' && a.rel === 'stylesheet' && a.href.startsWith('/')) cssLinks.push(a.href); });
const scripts = [];
walk(doc, n => { const a = attrs(n); if (n.tagName === 'script' && a.type === 'module' && a.src?.startsWith('/')) scripts.push(a.src); });
if (page.key !== 'main') {
  if (JSON.stringify(cssLinks) !== JSON.stringify(sharedCss) || JSON.stringify(scripts) !== JSON.stringify(sharedScripts)) throw new Error('Page needs a separate asset profile: ' + page.key);
  continue;
}
sharedCss = cssLinks;
sharedScripts = scripts;
for (const href of cssLinks) {
  const parsed = postcss.parse(await fs.readFile(path.join(root, 'dist', '.' + href), 'utf8'));
  parsed.walkRules(rule => {
    if (rule.parent.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
    rule.selectors = rule.selectors.map(selector => {
      // Keep the specificity of Astro's scoped attribute after removing it from HTML.
      selector = selector.replace(/\[data-astro-cid-[^\]]+\]/g, ':not([data-lr-never])');
      if (/^(html|body|:root)(?![\w-])/.test(selector)) {
        return selector.replace(/^(html|body|:root)/, referenceScope);
      }
      return referenceScope + ' ' + selector;
    });
  });
  parsed.walkDecls(decl => {
    // A legacy block stylesheet may also register Manrope at different weights.
    // Give this source's exact font files their own family, including variables.
    decl.value = decl.value.replace(/"Manrope"|\bManrope\b/g, '"LR Reference Manrope"');
    decl.value = decl.value.replace(/url\(\s*(['"]?)(\/[^)'"\s]+)\1\s*\)/g, (full, quote, url) => {
      const source = path.join(root, 'dist', '.' + url);
      const filename = path.basename(url);
      images.set(source, filename);
      return 'url("' + filename + '")';
    });
  });
  css += parsed.toString() + '\n';
}
await fs.writeFile(path.join(out, 'original.css'), css);

// Original reviewed interaction code, NOT scripts taken from an incoming JSON.
if (scripts.length !== 3) throw new Error('Unexpected interaction bundle count.');
for (const [index, src] of scripts.entries()) {
  await fs.copyFile(path.join(root, 'dist', '.' + src), path.join(out, 'interaction-' + index + '.js'));
}
}
for (const [source, filename] of images) await fs.copyFile(source, path.join(out, filename));
for (const [key, markup] of Object.entries(widgets)) {
  if (!/^[a-z-]+$/.test(key)) throw new Error('Invalid widget key');
  await fs.writeFile(path.join(plugin, 'blocks/reference-widget/templates', key + '.html'), markup);
}
await fs.writeFile(path.join(out, 'art.json'), JSON.stringify(art, null, 2) + '\n');
await fs.writeFile(path.join(plugin, 'examples/catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
console.log(JSON.stringify({ pages: catalog, images: images.size, art: Object.keys(art).length, widgets: Object.keys(widgets) }));
await import('./build-editor-styles.mjs');
