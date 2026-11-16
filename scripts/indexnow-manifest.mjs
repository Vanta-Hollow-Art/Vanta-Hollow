import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { origin, key } from './indexnow-config.mjs';

export const hash = value => createHash('sha256').update(value).digest('hex');
export function discoverUrls(source, sitemap) {
  const paths = [...source.matchAll(/currentPath === ['"]([^'"]+)['"]/g)].map(m => m[1]);
  const entries = source.match(/const journalEntries = \[([\s\S]*?)\n\];/)?.[1];
  if (!entries) throw new Error('Journal route structure changed; update IndexNow discovery.');
  paths.push(...[...entries.matchAll(/(?:\bslug|"slug")\s*:\s*['"]([a-z0-9-]+)['"]/g)].map(m => `/journal/${m[1]}`));
  const routes = new Set(paths.map(path => new URL(path, origin).href));
  // The SPA returns 200 for unknown paths. Do not submit stale sitemap entries.
  for (const [, value] of sitemap.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)) {
    const url = new URL(value.trim());
    if (!['https://vanta-hollow.com', origin].includes(url.origin)) throw new Error(`Foreign sitemap URL: ${url}`);
    // The existing apex sitemap URLs redirect to the production www host.
    url.hostname = new URL(origin).hostname;
    if (!routes.has(url.href)) console.warn(`IndexNow: ignoring sitemap URL without an application route: ${url}`);
  }
  if (routes.size < 6) throw new Error('No usable application routes discovered.');
  return [...routes].sort();
}

export function buildManifest() {
  if (/<meta\b[^>]*\bcontent=["'][^"']*\bnoindex\b/i.test(readFileSync('dist/index.html', 'utf8'))) throw new Error('HTML contains noindex; review IndexNow eligibility.');
  const urls = discoverUrls(readFileSync('src/main.jsx', 'utf8'), readFileSync('public/sitemap.xml', 'utf8'));
  // Hash the actual deployed output: HTML, JS, CSS, images and other public assets.
  // Shared SPA code can affect every route, so conservatively mark all pages changed.
  const files = [];
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(path);
      else if (!['dist/indexnow.json', `dist/${key}.txt`, 'dist/sitemap.xml'].includes(path)) files.push(path);
    }
  }
  walk('dist');
  const digest = createHash('sha256');
  for (const file of files.sort()) digest.update(file).update(readFileSync(file));
  const fingerprint = digest.digest('hex');
  const revision = process.env.VERCEL_GIT_COMMIT_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const manifest = { version: 1, origin, revision, urls: Object.fromEntries(urls.map(url => [url, fingerprint])) };
  writeFileSync('dist/indexnow.json', JSON.stringify(manifest, null, 2) + '\n');
  console.log(`IndexNow manifest: ${urls.length} routes, revision ${revision}`);
  return manifest;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) buildManifest();
