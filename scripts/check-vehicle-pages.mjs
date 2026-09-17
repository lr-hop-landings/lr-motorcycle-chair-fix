// Run after npm run build: node scripts/check-vehicle-pages.mjs
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const routes = ["motocikly", "skutery", "kvadrocikly", "baggi"];
const labels = ["Мотоцикл", "Скутер", "Квадроцикл", "Багги"];
const titles = new Set();
const decode = text => text.replaceAll(/&(?:quot|#34);/g, '"').replaceAll("&amp;", "&");

for (const [index, route] of routes.entries()) {
  const html = readFileSync(`dist/${route}/index.html`, "utf8");
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  assert(title && !titles.has(title), `${route}: unique title`);
  titles.add(title);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${route}: one H1`);
  assert(html.includes('в Санкт-Петербурге'), `${route}: service geography`);
  assert(html.includes(`data-vehicle="${route}"`), `${route}: quiz preset`);
  assert(html.includes(`name="vehicle_type" value="${labels[index]}"`), `${route}: callback context`);
  assert(html.includes(`name="page_path" value="/${route}/"`), `${route}: callback route`);
  assert.equal((html.match(/id="quiz-app"/g) || []).length, 1, `${route}: one quiz`);
  const options = JSON.parse(decode(html.match(/data-vehicle-options="([^"]+)"/)?.[1] || "null"));
  assert.deepEqual(options.map(item => item.label), [...labels, "Другая техника"], `${route}: separate categories`);
  assert(!html.includes('peretyazhka-sidenya-motoczikla.htm'), `${route}: does not inherit old canonical`);
  if (process.env.SITE_URL) {
    const expected = new URL(`/${route}/`, process.env.SITE_URL).href;
    assert(html.includes(`rel="canonical" href="${expected}"`), `${route}: self canonical`);
  }
  assert(html.includes('href="#vehicles-title"'), `${route}: jump to vehicle overview`);
  assert(html.includes('id="vehicles-title"'), `${route}: vehicle overview section`);
  assert((html.match(/data-cta="vehicle_page"/g) || []).length === 3, `${route}: three linked vehicle cards`);
  assert(html.includes('class="vehicle vehicle--active"'), `${route}: current vehicle is not a link`);
  assert(!html.includes('aria-label="Другие типы техники"'), `${route}: no duplicate vehicle nav`);
  assert(html.includes('id="portfolio"'), `${route}: portfolio exists`);
  assert.equal((html.match(/data-case-card/g) || []).length, 5, `${route}: five before/after cases`);
  assert(html.includes('data-case-swiper'), `${route}: case carousel`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, `${route}: unique IDs`);
  for (const [, source] of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)) {
    if (source.startsWith("/")) assert(existsSync(resolve("dist", source.slice(1))), `${route}: image exists ${source}`);
  }
}

const home = readFileSync("dist/index.html", "utf8");
assert(home.includes('id="vehicles-title"'), "overview has vehicle section");
for (const route of routes) assert(home.includes(`href="/${route}/"`), `overview links to ${route}`);
assert(!home.includes('data-vehicle="'), "overview does not lock a category");
console.log("PASS: 4 category pages + overview; metadata, links, assets, examples and form context.");
