const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const converterSource = fs.readFileSync(path.join(__dirname, '../assets/converter.js'), 'utf8');
const sandbox = { module: { exports: {} }, exports: {} };
vm.runInNewContext(converterSource, sandbox, { filename: 'converter.js' });
const factory = sandbox.module.exports;

function createBlock(name, attributes = {}, innerBlocks = []) {
	return { name, attributes, innerBlocks };
}

const converter = factory({ createBlock }, {});

const result = converter.convertManifest({
	title: 'Тестовая страница',
	theme: 'motorcycle',
	sections: [
		{ type: 'hero', title: 'Первый экран', text: 'Описание' },
		{ type: 'faq', title: 'FAQ', items: [{ question: 'Вопрос?', answer: 'Ответ.' }] },
		{ type: 'content', blocks: [{ type: 'leadForm', title: 'Заявка', service: 'Тест' }] }
	]
});

assert.equal(result.title, 'Тестовая страница');
assert.equal(result.blocks.length, 1);
assert.equal(result.blocks[0].name, 'core/group');
assert.equal(result.blocks[0].attributes.anchor, 'hop-gutenberg');
assert.match(result.blocks[0].attributes.className, /lr-theme-motorcycle/);
assert.equal(result.summary.sections, 3);
assert.ok(result.summary.blocks >= 10);

const names = [];
function walk(blocks) {
	for (const block of blocks) {
		names.push(block.name);
		walk(block.innerBlocks || []);
	}
}
walk(result.blocks);

assert.ok(names.includes('core/heading'));
assert.ok(names.includes('core/details'));
assert.ok(names.includes('lenremont/lead-form'));

assert.throws(() => converter.convertManifest({}), /sections/);

console.log('converter tests passed');
