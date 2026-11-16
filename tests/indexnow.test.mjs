import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { discoverUrls } from '../scripts/indexnow-manifest.mjs';
import { changes, validateManifest, retryDelay, submit, run } from '../scripts/indexnow.mjs';
import { origin, key, keyLocation } from '../scripts/indexnow-config.mjs';

const url = `${origin}/about`;
const manifest = { version: 1, origin, revision: 'a'.repeat(40), urls: { [url]: 'b'.repeat(64) } };
test('real routes include journal archive and entries omitted from sitemap', () => {
  const urls = discoverUrls(readFileSync('src/main.jsx', 'utf8'), readFileSync('public/sitemap.xml', 'utf8'));
  assert.ok(urls.includes(`${origin}/journal`));
  assert.ok(urls.includes(`${origin}/journal/the-cathedral`));
  assert.equal(urls.length, new Set(urls).size);
  assert.ok(urls.length > 48);
});
test('key file contains exactly the configured key', () => assert.equal(readFileSync(`public/${key}.txt`, 'utf8').trim(), key));
test('first run seeds once, unchanged run is empty, update/add/delete are included', () => {
  assert.deepEqual(changes({ a: '1', b: '2' }), ['a', 'b']);
  assert.deepEqual(changes({ a: '1' }, { a: '1' }), []);
  assert.deepEqual(changes({ a: '2', c: '3' }, { a: '1', b: '2' }), ['a', 'b', 'c']);
});
test('manifest rejects foreign URLs, query strings, fragments and invalid revision', () => {
  assert.equal(validateManifest(manifest), manifest);
  for (const bad of ['https://example.com/', `${url}?a=1`, `${url}#a`, 'https://user@www.vanta-hollow.com/about']) assert.throws(() => validateManifest({ ...manifest, urls: { [bad]: 'b'.repeat(64) } }));
  assert.throws(() => validateManifest({ ...manifest, revision: 'main' }));
  assert.throws(() => validateManifest({ ...manifest, urls: {} }));
});
for (const status of [200, 202]) test(`HTTP ${status} is accepted and URLs are deduplicated`, async () => {
  const result = await submit([url, url], { fetcher: async (endpoint, options) => {
    assert.equal(endpoint, 'https://api.indexnow.org/indexnow');
    assert.deepEqual(JSON.parse(options.body), { host: 'www.vanta-hollow.com', key, keyLocation, urlList: [url] });
    return new Response('', { status });
  } });
  assert.equal(result, status);
});
for (const status of [400, 403, 422]) test(`HTTP ${status} fails without retry`, async () => {
  let calls = 0;
  await assert.rejects(submit([url], { fetcher: async () => { calls++; return new Response('', { status }); } }), new RegExp(String(status)));
  assert.equal(calls, 1);
});
test('429 respects Retry-After and retries successfully', async () => {
  let calls = 0;
  const waits = [];
  assert.equal(await submit([url], { fetcher: async () => ++calls === 1 ? new Response('', { status: 429, headers: { 'Retry-After': '3' } }) : new Response('', { status: 200 }), wait: async ms => waits.push(ms) }), 200);
  assert.deepEqual(waits, [3000]);
});
test('long rate limit defers to next run without sleeping or marking success', async () => {
  await assert.rejects(submit([url], { fetcher: async () => new Response('', { status: 429, headers: { 'Retry-After': '3600' } }), wait: async () => assert.fail('must defer') }), /next workflow/);
});
test('HTTP date Retry-After and bounded server/network retries', async () => {
  assert.equal(retryDelay(new Response('', { headers: { 'Retry-After': 'Wed, 21 Oct 2015 07:28:00 GMT' } }), 0, Date.parse('2015-10-21T07:27:50Z')), 10000);
  for (const network of [true, false]) {
    let calls = 0;
    await assert.rejects(submit([url], { fetcher: async () => { calls++; if (network) throw new Error('offline'); return new Response('', { status: 503 }); }, wait: async () => {} }));
    assert.equal(calls, 4);
  }
});
test('invalid or oversized batches never reach the API', async () => {
  for (const urls of [[], ['https://example.com/'], Array.from({ length: 10001 }, (_, i) => `${origin}/${i}`)]) await assert.rejects(submit(urls, { fetcher: async () => assert.fail('must not fetch') }));
});
test('production lifecycle persists success, skips duplicates, retains failures and records removals/cooldowns', async () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = { ...process.env };
  process.env.GITHUB_REPOSITORY = 'Vanta-Hollow-Art/Vanta-Hollow';
  process.env.GITHUB_TOKEN = 'test-token';
  delete process.env.EXPECTED_REVISION;
  let stored;
  let posts = 0;
  let head;
  let live = structuredClone(manifest);
  let apiStatus = 200;
  let keyBody = key;
  let saves = 0;
  globalThis.fetch = async (input, options = {}) => {
    const value = String(input);
    const json = body => Response.json(body);
    if (value.startsWith(`${origin}/indexnow.json`)) return json(live);
    if (value.startsWith(keyLocation)) return new Response(keyBody, { headers: { 'content-type': 'text/plain' } });
    if (value.startsWith(`${origin}/robots.txt`)) return new Response('User-agent: *\nAllow: /');
    if (value === 'https://api.indexnow.org/indexnow') { posts++; return new Response('', { status: apiStatus, headers: apiStatus === 429 ? { 'Retry-After': '3600' } : {} }); }
    const path = value.replace('https://api.github.com/repos/Vanta-Hollow-Art/Vanta-Hollow', '');
    if (path === '/git/ref/indexnow/state') return head ? json({ object: { sha: head } }) : new Response('', { status: 404 });
    if (path === '/git/trees' && options.method === 'POST') { saves++; stored = JSON.parse(JSON.parse(options.body).tree[0].content); return json({ sha: 'tree' }); }
    if (path === '/git/commits' && options.method === 'POST') return json({ sha: 'commit' });
    if (path === '/git/refs' || path === '/git/refs/indexnow/state') { head = 'commit'; return json({}); }
    if (path === '/git/commits/commit') return json({ tree: { sha: 'tree' } });
    if (path === '/git/trees/tree') return json({ tree: [{ path: 'state.json', sha: 'blob' }] });
    if (path === '/git/blobs/blob') return json({ content: Buffer.from(JSON.stringify(stored)).toString('base64') });
    assert.fail(`Unexpected request: ${value}`);
  };
  try {
    await run();
    assert.deepEqual(stored.urls, manifest.urls);
    await run();
    assert.equal(posts, 1);
    assert.equal(saves, 1);
    live.urls[url] = 'c'.repeat(64);
    apiStatus = 403;
    await assert.rejects(run(), /403/);
    assert.equal(stored.urls[url], manifest.urls[url]);
    assert.equal(saves, 1);
    apiStatus = 202;
    await run();
    assert.equal(stored.lastSubmission.status, 202);
    assert.equal(stored.urls[url], live.urls[url]);
    // Remove the old page and add a different one in a later production build.
    live.urls = { [`${origin}/faq`]: 'd'.repeat(64) };
    apiStatus = 200;
    await run();
    assert.deepEqual(stored.urls, live.urls);
    assert.equal(stored.lastSubmission.count, 2);
    const beforeKeyFailure = posts;
    keyBody = '<html>SPA fallback</html>';
    await assert.rejects(run(), /key file/);
    assert.equal(posts, beforeKeyFailure);
    keyBody = key;
    live.urls[`${origin}/faq`] = 'e'.repeat(64);
    apiStatus = 429;
    await assert.rejects(run(), /next workflow/);
    assert.ok(stored.retryAt > Date.now());
    const beforeCooldown = posts;
    await run();
    assert.equal(posts, beforeCooldown);
  } finally { globalThis.fetch = originalFetch; process.env = originalEnv; }
});
