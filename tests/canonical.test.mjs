import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { canonicalHtml, siteUrls, sitemapXml } from '../scripts/canonical-pages.mjs';
import { origin, key } from '../scripts/indexnow-config.mjs';

const read = file => readFileSync(file, 'utf8');
test('every built route has one correct initial canonical and the same app body', () => {
  const urls = siteUrls();
  const body = read('dist/index.html').split('<body>')[1];
  for (const url of urls) {
    const pathname = new URL(url).pathname;
    const html = read(pathname === '/' ? 'dist/index.html' : `dist${pathname}.html`);
    const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map(m => m[1]);
    assert.deepEqual(canonicals, [url], url);
    assert.equal(html.split('<body>')[1], body, `App body changed: ${url}`);
    assert.ok(!html.includes('noindex'), url);
  }
});
test('published sitemap matches every discovered route and IndexNow manifest', () => {
  const urls = siteUrls();
  const sitemap = read('dist/sitemap.xml');
  assert.equal(sitemap, sitemapXml(urls));
  assert.equal(read('public/sitemap.xml'), sitemap);
  assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]), urls);
  assert.deepEqual(Object.keys(JSON.parse(read('dist/indexnow.json')).urls).sort(), urls);
  for (const path of ['/journal', '/journal/the-cathedral', '/journal/emergence', '/journal/the-return']) assert.ok(urls.includes(`${origin}${path}`));
});
test('robots and IndexNow verification remain available with canonical routing', () => {
  assert.ok(read('dist/robots.txt').includes(`Sitemap: ${origin}/sitemap.xml`));
  assert.ok(!/Disallow:\s*\S/.test(read('dist/robots.txt')));
  assert.equal(read(`dist/${key}.txt`).trim(), key);
  const config = JSON.parse(read('vercel.json'));
  assert.equal(config.cleanUrls, true);
  assert.equal(config.trailingSlash, false);
  assert.deepEqual(config.headers, [{source:'/indexnow.json',headers:[{key:'Cache-Control',value:'no-store'}]}]);
});
test('canonical injection preserves body and replaces an existing canonical', () => {
  const html = '<html><head><link href="https://example.com" rel="canonical"><title>Existing title</title></head><body>Existing app</body></html>';
  const output = canonicalHtml(html, `${origin}/about`);
  assert.equal((output.match(/rel="canonical"/g) || []).length, 1);
  assert.ok(output.includes(`href="${origin}/about"`));
  assert.ok(output.endsWith('<body>Existing app</body></html>'));
  assert.ok(output.includes('<title>Existing title</title>'));
  assert.throws(() => canonicalHtml(html, 'https://example.com/about'), /Invalid canonical/);
});
