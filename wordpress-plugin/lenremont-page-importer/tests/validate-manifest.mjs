import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import postcss from 'postcss';

const pluginDir = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(pluginDir, 'examples', 'main-motorcycle-seats.json');
const converterPath = join(pluginDir, 'assets', 'converter.js');
const manifestSource = readFileSync(manifestPath, 'utf8');
const manifest = JSON.parse(manifestSource.replaceAll('{{pluginUrl}}', 'http://example.test/plugin'));

const context = {
	module: { exports: {} },
	exports: {},
	globalThis: {},
};
vm.runInNewContext(readFileSync(converterPath, 'utf8'), context, { filename: converterPath });

const createBlock = (name, attributes = {}, innerBlocks = []) => ({ name, attributes, innerBlocks });
const referenceContext = { module: { exports: {} } };
vm.runInNewContext(readFileSync(join(pluginDir, 'assets/reference-blocks.js'), 'utf8'), referenceContext);
const reference = referenceContext.module.exports;
const converter = context.module.exports({ createBlock }, { LenremontReferenceBlocks: reference });
const result = converter.convertManifest(manifest);

assert.equal(manifest.version, 2);
assert.equal(manifest.sections.length, 13);
assert.equal(result.summary.sections, 13);
assert.equal(result.summary.warnings.length, 0);
assert.ok(result.summary.blocks > 100, 'Expected the full landing to produce more than 100 blocks.');
assert.equal(result.blocks[0].name, 'core/group');
assert.equal(result.blocks[0].attributes.anchor, 'hop-gutenberg');
assert.match(result.blocks[0].attributes.className, /lr-reference/);
const flatten = blocks => blocks.flatMap(b => [b, ...flatten(b.innerBlocks || [])]);
const all = flatten(result.blocks);
assert.equal(all.filter(b => b.name === 'lenremont/reference-quiz').length, 1);
assert.equal(all.filter(b => b.name === 'lenremont/reference-widget').length, 3);
assert.equal(all.filter(b => b.name === 'lenremont/element' && b.attributes.attributes['data-case-card'] !== undefined).length, 8);
assert.equal(all.filter(b => b.name === 'lenremont/element' && b.attributes.tag === 'details').length, 8);
assert.equal(all.filter(b => b.name === 'core/html').length, 0);
assert.ok(all.filter(b => ['core/heading','core/paragraph'].includes(b.name)).length > 70);
assert.deepEqual(JSON.parse(JSON.stringify(reference.cleanAttributes({ href: 'javascript:alert(1)', onclick: 'bad()', style: 'background:url(https://bad.test/);--vehicle-color:#244f9d', 'data-contact': '' }))), { href: '', style: '--vehicle-color:#244f9d', 'data-contact': '' });
assert.equal(reference.cleanAttributes({src:'https://example.test/a.webp'}).src, 'https://example.test/a.webp');
assert.ok(all.some(b => b.name === 'lenremont/text' && b.attributes.raw && b.attributes.text === 'Подобрать похожее решение '));
const css = readFileSync(join(pluginDir, 'assets/reference/original.css'), 'utf8');
assert.ok(css.startsWith('@charset "UTF-8";'), 'CSS must decode non-ASCII content correctly.');
assert.match(css, /font-family:"LR Reference Manrope"/);
assert.match(css, /:not\(\[data-lr-never\]\)/, 'Astro selector specificity must survive scoping.');
assert.doesNotMatch(css, /data-astro-cid-/);
assert.match(css, /#hop-gutenberg/);
postcss.parse(css).walkRules(rule => {
	if (rule.parent.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
	for (const selector of rule.selectors) assert.ok(selector.startsWith('#hop-gutenberg.lr-reference'), 'Exact-profile CSS must not style design-system pages.');
});
for (const relative of ['assets/reference/original.css', 'assets/reference-adapter.css', 'assets/frontend.css', 'assets/canvas.css']) {
	const source = readFileSync(join(pluginDir, relative), 'utf8');
	postcss.parse(source).walkRules(rule => {
		if (rule.parent.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
		for (const selector of rule.selectors) assert.match(selector, /#hop-gutenberg/, `${relative} contains an unscoped selector: ${selector}`);
	});
}

console.log(JSON.stringify(result.summary));
const editorCss = postcss.parse(readFileSync(join(pluginDir, 'assets/editor-content.css'), 'utf8'));
editorCss.walkRules(rule => {
	for (const selector of rule.selectors) {
		assert.ok(selector.startsWith('.editor-styles-wrapper '), `Editor CSS leaks outside canvas: ${selector}`);
		assert.ok(!selector.includes('#hop-gutenberg'), 'Gutenberg uses generated block IDs, not saved anchors.');
		assert.match(selector, /\.lr-reference|\.lr-imported-page/, 'Editor CSS must target an imported root.');
	}
});
const catalog = JSON.parse(readFileSync(join(pluginDir, 'examples/catalog.json'), 'utf8'));
assert.equal(catalog.length, 5);
assert.equal(new Set(catalog.map(p => p.path)).size, 5);
for (const page of catalog) {
	assert.equal(page.path, '/peretyazhka-sidenij-mototransporta' + (page.key === 'main' ? '' : '-' + page.key) + '/');
	const source = JSON.parse(readFileSync(join(pluginDir, 'examples', page.example), 'utf8'));
	const converted = converter.convertManifest(source);
	assert.equal(source.rootId, 'hop-gutenberg');
	assert.equal(converted.blocks[0].attributes.anchor, 'hop-gutenberg');
	const blocks = flatten(converted.blocks);
	const quiz = blocks.find(b => b.name === 'lenremont/reference-quiz');
	assert.equal(converted.summary.sections, 13);
	assert.equal(quiz.attributes.attributes['data-page-path'], page.path);
	assert.equal(quiz.attributes.attributes['data-vehicle'] || '', page.key === 'main' ? '' : page.key);
	const links = blocks.filter(b => b.name === 'lenremont/element' && b.attributes.tag === 'a').map(b => b.attributes.attributes.href);
	for (const target of catalog.filter(p => p.key !== page.key)) assert.ok(links.includes(target.path), `${page.key} must link to ${target.key}`);
	if (page.key !== 'main') {
		const hero = blocks.find(b => b.name === 'lenremont/element' && b.attributes.attributes.class?.includes('hero--vehicle'));
		assert.match(hero.attributes.attributes.style, /--blue:/);
		assert.match(hero.attributes.attributes.style, /--cyan:/);
		assert.match(hero.attributes.attributes.style, /--soft:/);
		assert.ok(blocks.some(b => b.name === 'lenremont/reference-widget' && b.attributes.widget === 'callback-' + page.key));
		assert.equal(blocks.filter(b => b.name === 'lenremont/element' && b.attributes.attributes['data-case-card'] !== undefined).length, 5);
	}
	console.log(JSON.stringify({page:page.key, ...converted.summary}));
}
