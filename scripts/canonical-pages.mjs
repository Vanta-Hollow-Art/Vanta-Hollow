import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { discoverUrls } from './indexnow-manifest.mjs';
import { origin } from './indexnow-config.mjs';

export function sitemapXml(urls) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n') + '\n</urlset>\n';
}

export function canonicalHtml(html, url) {
  const parsed = new URL(url);
  if (parsed.origin !== origin || parsed.search || parsed.hash) throw new Error('Invalid canonical URL');
  if (!html.includes('</head>')) throw new Error('Built HTML has no head');
  // Keep the Vite app body, scripts, styles, and all existing metadata untouched.
  // Only one canonical is emitted, before JavaScript runs.
  const withoutCanonical = html.replace(/<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>/gi, '');
  return withoutCanonical.replace('</head>', `  <link rel="canonical" href="${parsed.href}" />\n  </head>`);
}

export function siteUrls() {
  return discoverUrls(readFileSync('src/main.jsx', 'utf8'), readFileSync('public/sitemap.xml', 'utf8'));
}

export function buildCanonicalPages() {
  const urls = siteUrls();
  const template = readFileSync('dist/index.html', 'utf8');
  for (const url of urls) {
    const pathname = new URL(url).pathname;
    const file = pathname === '/' ? 'dist/index.html' : `dist${pathname}.html`;
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, canonicalHtml(template, url));
  }
  // Use the same route discovery as IndexNow so future journal additions appear.
  writeFileSync('dist/sitemap.xml', sitemapXml(urls));
  console.log(`Canonical HTML and sitemap: ${urls.length} production URLs`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--write-sitemap')) writeFileSync('public/sitemap.xml', sitemapXml(siteUrls()));
  else buildCanonicalPages();
}
