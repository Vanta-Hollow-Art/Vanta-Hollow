import { pathToFileURL } from 'node:url';
import { origin, key, keyLocation, endpoint } from './indexnow-config.mjs';

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export function validateManifest(manifest) {
  if (manifest.version !== 1 || manifest.origin !== origin || !/^[a-f0-9]{40}$/.test(manifest.revision) || !manifest.urls || Array.isArray(manifest.urls)) throw new Error('Invalid production manifest');
  for (const [value, fingerprint] of Object.entries(manifest.urls)) {
    const url = new URL(value);
    if (url.origin !== origin || url.username || url.password || url.search || url.hash || url.href !== value || !/^[a-f0-9]{64}$/.test(fingerprint)) throw new Error(`Invalid manifest URL: ${value}`);
  }
  if (!Object.keys(manifest.urls).length) throw new Error('Empty production manifest');
  return manifest;
}
export function changes(current, previous = {}) {
  return [...new Set([...Object.keys(current), ...Object.keys(previous)])].filter(url => current[url] !== previous[url]).sort();
}
export function retryDelay(response, attempt, now = Date.now()) {
  const header = response?.headers.get('retry-after');
  const seconds = header && /^\d+$/.test(header) ? Number(header) * 1000 : Date.parse(header || '') - now;
  return Math.max(1000, Number.isFinite(seconds) ? seconds : 2000 * 2 ** attempt);
}
export async function submit(urls, { fetcher = fetch, wait = sleep } = {}) {
  const unique = [...new Set(urls)];
  if (!unique.length || unique.length > 10000) throw new Error('IndexNow batch must contain 1–10,000 URLs');
  for (const value of unique) if (new URL(value).origin !== origin) throw new Error('Foreign submission URL');
  for (let attempt = 0; attempt < 4; attempt++) {
    let response;
    try {
      response = await fetcher(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify({ host: new URL(origin).host, key, keyLocation, urlList: unique }), signal: AbortSignal.timeout(30000), redirect: 'error' });
    } catch (error) {
      if (attempt === 3) throw error;
      await wait(2000 * 2 ** attempt);
      continue;
    }
    if (response.status === 200 || response.status === 202) return response.status;
    if (response.status !== 429 && response.status < 500) throw new Error(`IndexNow rejected batch: HTTP ${response.status}`);
    const delay = retryDelay(response, attempt);
    if (attempt === 3 || delay > 60000) {
      const error = new Error(`IndexNow HTTP ${response.status}; retry on the next workflow run (Retry-After respected)`);
      error.retryAt = Date.now() + delay;
      throw error;
    }
    await wait(delay);
  }
}

// A dedicated Git ref is durable, free, and does not create Vercel branch deployments.
// No expiring Actions cache/artifact is used for deduplication.
export async function ledgerStore() {
  const repository = process.env.GITHUB_REPOSITORY;
  if (repository !== 'Vanta-Hollow-Art/Vanta-Hollow' || !process.env.GITHUB_TOKEN) throw new Error('Run through the repository IndexNow workflow');
  const base = `https://api.github.com/repos/${repository}`;
  async function api(path, method = 'GET', body) {
    const response = await fetch(`${base}${path}`, { method, headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' }, body: body && JSON.stringify(body), signal: AbortSignal.timeout(30000) });
    if (method === 'GET' && response.status === 404) return null;
    if (!response.ok) throw new Error(`GitHub ledger ${method} ${path}: HTTP ${response.status}`);
    return response.json();
  }
  const ref = await api('/git/ref/indexnow/state');
  let head = ref?.object.sha;
  let state = { version: 1, urls: {} };
  if (head) {
    const commit = await api(`/git/commits/${head}`);
    const tree = await api(`/git/trees/${commit.tree.sha}`);
    const entry = tree.tree.find(item => item.path === 'state.json');
    if (!entry) throw new Error('Ledger missing state.json; refusing to reset submission history');
    const blob = await api(`/git/blobs/${entry.sha}`);
    state = JSON.parse(Buffer.from(blob.content, 'base64').toString('utf8'));
    if (state.version !== 1 || !state.urls || Array.isArray(state.urls)) throw new Error('Invalid ledger; refusing to reset submission history');
  }
  return { state, async save(next) {
    const tree = await api('/git/trees', 'POST', { tree: [{ path: 'state.json', mode: '100644', type: 'blob', content: JSON.stringify(next, null, 2) + '\n' }] });
    const commit = await api('/git/commits', 'POST', { message: 'Record accepted IndexNow notifications', tree: tree.sha, parents: head ? [head] : [] });
    if (head) await api('/git/refs/indexnow/state', 'PATCH', { sha: commit.sha, force: false });
    else await api('/git/refs', 'POST', { ref: 'refs/indexnow/state', sha: commit.sha });
    head = commit.sha;
  } };
}

async function getPublic(path) {
  const response = await fetch(`${origin}${path}${path.includes('?') ? '&' : '?'}indexnow=${Date.now()}`, { redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Production verification ${path}: HTTP ${response.status}`);
  return response;
}
export async function run() {
  const expectedRevision = process.env.EXPECTED_REVISION;
  // Retry propagation without ever submitting a preview deployment or stale event.
  let manifest;
  for (let attempt = 0; attempt < 6; attempt++) {
    manifest = validateManifest(await (await getPublic('/indexnow.json')).json());
    if (!expectedRevision || manifest.revision === expectedRevision) break;
    if (attempt === 5) throw new Error('Production revision does not match deployment event; no URLs submitted');
    await sleep(10000);
  }
  const keyResponse = await getPublic(`/${key}.txt`);
  if (!(keyResponse.headers.get('content-type') || '').includes('text/plain') || (await keyResponse.text()).trim() !== key) throw new Error('Public key file is not valid plain text');
  const robots = await (await getPublic('/robots.txt')).text();
  if (!/User-agent:/i.test(robots) || /^\s*Disallow:\s*\S+/im.test(robots)) throw new Error('Robots policy changed; review eligibility before submitting');
  const store = await ledgerStore();
  if (store.state.retryAt > Date.now()) {
    console.log(`IndexNow cooldown until ${new Date(store.state.retryAt).toISOString()}; no submissions.`);
    return;
  }
  const pending = changes(manifest.urls, store.state.urls);
  console.log(`Verified production key and revision ${manifest.revision}; ${pending.length} changed URLs`);
  for (let offset = 0; offset < pending.length; offset += 10000) {
    // Recheck the deployment before each batch to avoid racing a promotion.
    const live = validateManifest(await (await getPublic('/indexnow.json')).json());
    if (JSON.stringify(live) !== JSON.stringify(manifest)) throw new Error('Production changed during submission; rerun workflow');
    const batch = pending.slice(offset, offset + 10000);
    let status;
    try { status = await submit(batch); }
    catch (error) {
      if (error.retryAt) {
        store.state.retryAt = error.retryAt;
        await store.save(store.state);
      }
      throw error;
    }
    for (const url of batch) {
      if (manifest.urls[url]) store.state.urls[url] = manifest.urls[url];
      else delete store.state.urls[url];
    }
    store.state.lastSubmission = { revision: manifest.revision, status, at: new Date().toISOString(), count: batch.length };
    delete store.state.retryAt;
    await store.save(store.state);
    console.log(`IndexNow HTTP ${status}: ${batch.length} URLs ${status === 202 ? 'received; engine key validation pending' : 'submitted successfully'}`);
  }
  if (!pending.length) console.log('No submissions needed; ledger unchanged.');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) run().catch(error => { console.error(error.message); process.exitCode = 1; });
