import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { discoverUrls } from './indexnow-manifest.mjs';
import { origin } from './indexnow-config.mjs';
import { artworkSeo } from '../src/artwork-seo.mjs';

export const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll("'", '&#39;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export function artworkMetadataHtml(html, url, seo) {
  if (!seo) return html;
  let result = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`);
  const image = new URL(seo.artworkImage, origin).href;
  const values = [
    ['name', 'description', seo.description],
    ['property', 'og:type', 'article'],
    ['property', 'og:title', seo.title],
    ['property', 'og:description', seo.description],
    ['property', 'og:url', url],
    ['property', 'og:image', image],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', seo.title],
    ['name', 'twitter:description', seo.description],
    ['name', 'twitter:image', image],
  ];
  for (const [attribute, key, value] of values) {
    const existing = new RegExp(`<meta\\b(?=[^>]*\\b${attribute}\\s*=\\s*["']${key}["'])[^>]*>`, 'gi');
    result = result.replace(existing, '');
    result = result.replace('</head>', `  <meta ${attribute}="${key}" content="${escapeHtml(value)}" />\n  </head>`);
  }
  return result;
}

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
    const seo = pathname.startsWith('/journal/') ? artworkSeo[pathname.slice('/journal/'.length)] : undefined;
    writeFileSync(file, artworkMetadataHtml(canonicalHtml(template, url), url, seo));
  }
  // Use the same route discovery as IndexNow so future journal additions appear.
  writeFileSync('dist/sitemap.xml', sitemapXml(urls));
  console.log(`Canonical HTML and sitemap: ${urls.length} production URLs`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--write-sitemap')) writeFileSync('public/sitemap.xml', sitemapXml(siteUrls()));
  else buildCanonicalPages();
}
