import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import vm from 'node:vm';

const skill = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const bundle = path.join(skill, 'assets/toolkit');
const { positionals, values: flags } = parseArgs({ allowPositionals: true, options: Object.fromEntries(['out','workspace','manifest','title','slug','python'].map(k=>[k,{type:'string'}]).concat([['full',{type:'boolean'}]])) });
const command = positionals[0] || 'help';
const work = path.resolve(flags.workspace || bundle);
const plugin = path.join(work, 'wordpress-plugin/lenremont-page-importer');
const file = p => path.join(plugin, p);
const read = p => fs.readFileSync(p, 'utf8');
const required = name => { if (!flags[name]) throw new Error(`Required: --${name}`); return flags[name]; };
function run(exe, args) {
  const result = spawnSync(exe, args, { cwd: work, encoding:'utf8', windowsHide:true, maxBuffer:2*1024*1024 });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.status !== 0) throw new Error((result.error?.message || result.stderr || `Exit ${result.status}`).slice(0,2200));
}
function newFile(destination, data) {
  const target = path.resolve(destination);
  fs.mkdirSync(path.dirname(target), {recursive:true});
  fs.writeFileSync(target, data, {flag:'wx'});
  return target;
}
function loadModule(filename) {
  const context = {module:{exports:{}}, exports:{}};
  vm.runInNewContext(read(filename), context, {filename, timeout:3000});
  return context.module.exports;
}
try {
  if (positionals.length > 1) throw new Error('Unexpected positional arguments. See help.');
  if (command === 'help') {
    console.log(`Lenremont Gutenberg — offline tools, no WordPress writes
info [--workspace DIR]
init --out NEW_DIRECTORY
create-json --out NEW_FILE --title TITLE --slug SLUG
validate --manifest FILE [--workspace DIR]
test [--workspace DIR] [--full]
build-editor --workspace DIR
package --workspace DIR --out NEW_ZIP [--python PYTHON]
--full requires npm ci in the workbench. build-editor also requires postcss.
create-json uses generic v1, not the exact/neutral pattern layout.
WordPress insertion and serialization must still be verified in Gutenberg.`);
  } else if (command === 'info') {
    const header = read(file('lenremont-page-importer.php'));
    console.log(JSON.stringify({skill, workbench:work, plugin, version:header.match(/Version:\s*(\S+)/)?.[1], wp:header.match(/Requires at least:\s*(\S+)/)?.[1], php:header.match(/Requires PHP:\s*(\S+)/)?.[1], restImporter:false, mcpServer:false, wordpressWrites:false},null,2));
  } else if (command === 'init') {
    const target = path.resolve(required('out'));
    const parent = fs.realpathSync(path.dirname(target));
    const canonical = path.join(parent,path.basename(target));
    if (fs.existsSync(canonical)) throw new Error('Destination already exists; refusing overwrite.');
    const rel = path.relative(bundle,canonical);
    if (!rel || (!rel.startsWith('..'+path.sep) && !path.isAbsolute(rel))) throw new Error('Destination cannot be inside bundled sources.');
    fs.cpSync(bundle,canonical,{recursive:true,errorOnExist:true,force:false,filter:p=>!['node_modules','.git'].includes(path.basename(p))});
    console.log(JSON.stringify({created:canonical,plugin:path.join(canonical,'wordpress-plugin/lenremont-page-importer')},null,2));
  } else if (command === 'create-json') {
    const title = required('title'), slug = required('slug');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Slug must use lowercase Latin letters, digits and hyphens.');
    const data = {version:1,title,slug,theme:'default',sections:[
      {type:'hero',title,text:'Здесь будет описание вашей услуги.',buttons:[{label:'Подробнее',url:'#details'}]},
      {type:'content',anchor:'details',title:'Описание услуги',blocks:[{type:'paragraph',text:'Добавьте важные сведения для клиента.'}]},
      {type:'faq',title:'Вопросы и ответы',items:[{question:'Пример вопроса?',answer:'Здесь будет ваш ответ.'}]},
      {type:'contact',title:'Связаться с нами',text:'Добавьте проверенные контакты.',form:false}
    ]};
    console.log(JSON.stringify({created:newFile(required('out'),JSON.stringify(data,null,2)+'\n'),note:'Generic v1; slug is not applied by importer. Replace placeholders before publication.'},null,2));
  } else if (command === 'validate') {
    const source = path.resolve(required('manifest'));
    if (fs.statSync(source).size > 4*1024*1024) throw new Error('Manifest exceeds 4 MiB tool limit.');
    const manifest = JSON.parse(read(source));
    if (![1,2].includes(manifest.version)) throw new Error('Expected manifest version 1 or 2.');
    if (manifest.version===2 && manifest.profile!=='astro-main-v1') throw new Error('Unknown v2 profile.');
    if (manifest.version===1 && manifest.profile) throw new Error('v1 must not specify a reference profile.');
    if (!Array.isArray(manifest.sections) || !manifest.sections.length || manifest.sections.length>100) throw new Error('Expected 1–100 sections.');
    if (manifest.version===1) for (const s of manifest.sections) if (!['hero','proof','links','cards','services','materials','pricing','process','portfolio','faq','contact','content'].includes(s.type)) throw new Error(`Unknown section: ${s.type}`);
    const converter = loadModule(file('assets/converter.js'));
    const reference = loadModule(file('assets/reference-blocks.js'));
    const createBlock = (name,attributes={},innerBlocks=[])=>({name,attributes,innerBlocks});
    const result = converter({createBlock},{LenremontReferenceBlocks:reference}).convertManifest(manifest);
    const ids = new Set(), links = [], duplicates = [];
    function walk(blocks) { for(const b of blocks) { const a=b.attributes||{}, dom=a.attributes||{}, id=a.anchor||dom.id; if(id){if(ids.has(id))duplicates.push(id);ids.add(id);}if(a.url)links.push(a.url);if(dom.href)links.push(dom.href);walk(b.innerBlocks||[]); } }
    walk(result.blocks);
    if(duplicates.length) throw new Error('Duplicate IDs: '+duplicates.join(', '));
    if(result.summary.warnings.length) throw new Error(result.summary.warnings.join('\n'));
    const unresolved=links.filter(url=>url.startsWith('#') && url!=='#' && !ids.has(url.slice(1)));
    console.log(JSON.stringify({file:source,structure:'PASS',...result.summary,unresolvedAnchors:unresolved,serialization:'NOT CHECKED: open real Gutenberg',seo:'NOT CHECKED: target-site fields required'},null,2));
    if(unresolved.length) process.exitCode=1;
  } else if (command === 'test') {
    const tests=['lenremont-page-importer/tests/converter.test.cjs','tests/editor-layout.test.cjs','tests/library.test.cjs','tests/reference-library.test.cjs','tests/section-blocks.test.cjs','tests/neutral-library.test.cjs','tests/seo-import.test.cjs','tests/quiz-transition.test.mjs'];
    if(flags.full)tests.push('lenremont-page-importer/tests/validate-manifest.mjs');
    for(const test of tests)run(process.execPath,[path.join(work,'wordpress-plugin',test)]);
    console.log(`PASS ${tests.length} suites. WordPress/browser integration not tested by this command.`);
  } else if (command === 'build-editor') {
    required('workspace');
    if(fs.realpathSync(work)===fs.realpathSync(bundle))throw new Error('Build a working copy, not the global bundle.');
    run(process.execPath,[path.join(work,'wordpress-plugin/build-editor-styles.mjs')]);
  } else if (command === 'package') {
    required('workspace');
    run(flags.python||'python',[path.join(skill,'scripts/package-plugin.py'),'--plugin',plugin,'--out',path.resolve(required('out'))]);
  } else throw new Error('Unknown command: '+command);
} catch (error) { console.error('ERROR: '+error.message); process.exitCode=1; }
