const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../lenremont-page-importer/assets/editor.js'), 'utf8');
let blocks = [], settings = { supportsLayout: false }, subscriber, updates = 0;
const wp = {
  data: {
    select: () => ({ getSettings: () => settings, getBlocks: () => blocks }),
    dispatch: () => ({ updateSettings: next => { settings = { ...settings, ...next }; updates++; subscriber(); } }),
    subscribe: fn => { subscriber = fn; },
  },
  element: {}, plugins: {}, editor: {}, components: {},
};
vm.runInNewContext(source, { window: { wp, LenremontPageImporterConfig: {} } });
assert.equal(updates, 0);
blocks = [{ name: 'core/group', attributes: { className: 'lr-reference lr-imported-page-reference' } }];
subscriber();
assert.equal(settings.supportsLayout, true);
assert.equal(updates, 1);
subscriber();
assert.equal(updates, 1, 'no subscription loop');
blocks = [];
subscriber();
assert.equal(settings.supportsLayout, false, 'restore original setting when landing removed');
blocks = [{ name: 'core/group', attributes: { className: 'other-page' } }];
subscriber();
assert.equal(settings.supportsLayout, false, 'unrelated pages unaffected');
console.log('editor layout tests passed');
blocks = [{ name: 'core/group', attributes: { className: 'lr-ai-page' } }];
subscriber();
assert.equal(settings.supportsLayout, true, 'library uses modern group layout too');
blocks = [];
subscriber();
assert.equal(settings.supportsLayout, false, 'library restores theme layout');
