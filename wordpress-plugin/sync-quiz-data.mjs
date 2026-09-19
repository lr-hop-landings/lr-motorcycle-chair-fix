// Copy the existing landing's editorial quiz data without changing its wording.
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
const quizSource = readFileSync(new URL('../src/scripts/moto-quiz.js', import.meta.url), 'utf8');
const end = quizSource.indexOf('const app = ');
if (end < 0) throw new Error('Quiz data boundary not found');
const branches = vm.runInNewContext(quizSource.slice(0, end) + '\nbranches;');
const file = new URL('./lenremont-page-importer/examples/main-motorcycle-seats.json', import.meta.url);
const manifest = JSON.parse(readFileSync(file, 'utf8'));
manifest.sections[0].quiz.flow = {
  branches: Object.entries(branches).map(([key, branch]) => ({ key, ...branch })),
  vehicles: ['Мотоцикл', 'Скутер', 'Квадроцикл', 'Багги', 'Другая техника'],
  methods: ['Телефон', 'MAX', 'Telegram', 'VK']
};
writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n');
console.log('Original quiz branches copied: ' + Object.keys(branches).length);
