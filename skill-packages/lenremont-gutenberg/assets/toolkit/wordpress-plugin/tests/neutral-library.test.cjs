const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.join(__dirname, '../lenremont-page-importer');
const mod = {exports:{}};
new Function('module', fs.readFileSync(path.join(base, 'assets/neutral-library.js'), 'utf8'))(mod);
for (const file of ['main-motorcycle-seats','motocikly','skutery','kvadrocikly','baggi']) {
  const input = JSON.parse(fs.readFileSync(path.join(base, 'examples', file+'.json'), 'utf8'));
  const before = JSON.stringify(input);
  const result = mod.exports.manifest(input, '/plugin/placeholder.svg');
  assert.equal(JSON.stringify(input), before, 'source must be immutable');
  assert.equal(result.sections.length, input.sections.length);
  assert.equal(result.seo, undefined);
  let pictures = 0, quiz = 0;
  function visit(node) {
    assert.notEqual(node.type, 'widget');
    assert.notEqual(node.type, 'quiz');
    const a = node.attributes || {};
    if (a.class === 'lr-demo-quiz') quiz++;
    if (node.type === 'text') assert.doesNotMatch(node.text, /ленремонт|мото|сидень|обивк|петербург|344.?44|https?:|tel:|mailto:/i);
    if (node.type === 'image') { pictures++; assert.equal(a.src, '/plugin/placeholder.svg'); }
    if (a.href) assert.ok(a.href.startsWith('#'), a.href);
    for (const field of ['data-intent','data-contact','data-vehicle','data-vehicle-options','data-page-path']) assert.equal(a[field], undefined);
    (node.children || []).forEach(visit);
  }
  result.before.forEach(visit); result.sections.forEach(s=>visit(s.tree));
  assert.ok(pictures > 0); assert.equal(quiz, 1);
}
console.log('PASS all five neutral manifests: immutable sources, placeholder copy/images, no real destinations, neutral quiz.');
