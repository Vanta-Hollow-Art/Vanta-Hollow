import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { artworkSeo } from '../src/artwork-seo.mjs';
import { artworkMetadataHtml, escapeHtml } from '../scripts/canonical-pages.mjs';
import { origin } from '../scripts/indexnow-config.mjs';

const read = file => readFileSync(file, 'utf8');
const expectedSlugs = ['blackthorn-hall', 'the-last-oath', 'the-thirteenth-saint', 'the-widows-bloom', 'the-aftershow', 'the-crimson-queen'];

test('all 46 artworks have unique physical-art overrides', () => {
  assert.equal(Object.keys(artworkSeo).length, 46);
  assert.equal(new Set(Object.values(artworkSeo).map(s => s.title)).size, 46);
  assert.equal(new Set(Object.values(artworkSeo).map(s => s.description)).size, 46);
  for (const seo of Object.values(artworkSeo)) {
    assert.ok(seo.title.startsWith(seo.name + ' — '));
    assert.ok(seo.description.includes(seo.name));
    assert.ok(seo.description.includes('physical'));
    assert.ok(!/etsy|digital|shipping|in stock|free|canvas|archival|\$|\d+x\d+/i.test(JSON.stringify(seo)));
    assert.ok(seo.mockupAlt.includes('mockup'));
  }
});

test('all selected original HTML metadata matches the shared editorial source', () => {
  for (const [slug, seo] of Object.entries(artworkSeo)) {
    const html = read(`dist/journal/${slug}.html`);
    assert.ok(html.includes(`<title>${escapeHtml(seo.title)}</title>`));
    for (const [attribute, name, value] of [
      ['name', 'description', seo.description],
      ['property', 'og:title', seo.title],
      ['property', 'og:description', seo.description],
      ['property', 'og:url', `${origin}/journal/${slug}`],
      ['property', 'og:image', new URL(seo.artworkImage, origin).href],
      ['name', 'twitter:title', seo.title],
      ['name', 'twitter:description', seo.description],
      ['name', 'twitter:image', new URL(seo.artworkImage, origin).href],
    ]) {
      assert.ok(html.includes(`<meta ${attribute}="${name}" content="${escapeHtml(value)}" />`), `${slug}: ${name}`);
      assert.equal([...html.matchAll(new RegExp(`<meta ${attribute}="${name}"`, 'g'))].length, 1);
    }
    assert.ok(!html.includes('application/ld+json'), 'Existing Article remains client-generated; no Product/Offer inserted');
  }
});

test('non-artwork page shells retain the existing metadata', () => {
  const html = read('dist/about.html');
  assert.ok(html.includes('<title>Vanta Hollow | Dark Fantasy Wall Art</title>'));
  const fixture = '<head><title>Existing</title></head><body>App</body>';
  assert.equal(artworkMetadataHtml(fixture, `${origin}/about`, undefined), fixture);
});

test('metadata escapes punctuation and does not insert executable markup', () => {
  const html = artworkMetadataHtml('<head><title>Old</title></head><body>App</body>', `${origin}/journal/test`, {
    title: 'A <title> & "quote"', description: '<script>alert(1)</script>', artworkImage: '/images/test.png',
  });
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.equal(html.split('<body>')[1], 'App</body>');
});

test('editorial overrides and thematic links reference existing artwork routes', () => {
  const source = read('src/main.jsx');
  const entries = source.match(/const journalEntries = (\[[\s\S]*?\n\]);/)[1];
  const slugs = [...entries.matchAll(/(?:\bslug|"slug")\s*:\s*['"]([a-z0-9-]+)['"]/g)].map(m=>m[1]);
  for (const [slug, seo] of Object.entries(artworkSeo)) {
    assert.ok(slugs.includes(slug));
    assert.ok(slugs.includes(seo.relatedSlug));
    assert.notEqual(seo.relatedSlug, slug);
    assert.ok(source.includes(seo.artworkImage) || source.includes(seo.artworkImage.replaceAll("'", "\\'")));
  }
});

test('the review branch cannot deploy automatically and other branches keep the default behavior', () => {
  const config = JSON.parse(read('vercel.json'));
  assert.deepEqual(config.git.deploymentEnabled, { 'seo/phase-1': false, 'seo/remaining-journal-rollout': false });
});

test('Phase 1 metadata and original site content and configuration are preserved', async () => {
  const { createHash } = await import('node:crypto');
  const old = await import('./fixtures/phase1-seo.mjs');
  for (const slug of expectedSlugs) assert.deepEqual(artworkSeo[slug], old.artworkSeo[slug]);
  const hashes = JSON.parse(read('tests/fixtures/preserved-files.json'));
  for (const [file, expected] of Object.entries(hashes)) {
    assert.equal(createHash('sha256').update(read(file).replaceAll('\r\n','\n')).digest('hex'), expected, file);
  }
});
