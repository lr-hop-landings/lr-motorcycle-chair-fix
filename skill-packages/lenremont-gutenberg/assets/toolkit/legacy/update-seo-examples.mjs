// Mechanical update: keep existing block manifests untouched; add approved SEO.
import fs from 'node:fs/promises';
import path from 'node:path';
const dir = path.join(import.meta.dirname, 'lenremont-page-importer/examples');
const values = JSON.parse(await fs.readFile(path.join(import.meta.dirname, 'seo-pages.json'), 'utf8'));
for (const [key, seo] of Object.entries(values)) {
  const file = path.join(dir, key === 'main' ? 'main-motorcycle-seats.json' : key + '.json');
  const manifest = JSON.parse(await fs.readFile(file, 'utf8'));
  manifest.seo = { ...seo, ogTitle: seo.title, ogDescription: seo.description };
  await fs.writeFile(file, JSON.stringify(manifest, null, 2) + '\n');
  console.log(key + ': SEO title, description, breadcrumbs title, OG title/description');
}
