# IndexNow

This integration uses the existing Vite build, Vercel Git integration, free GitHub Actions for this public repository, and the free IndexNow API. No new packages, secrets, paid services, Vercel tokens, or Google configuration are needed.

The production apex domain redirects with HTTP 308 to `www.vanta-hollow.com`. Submissions and key verification therefore use the serving `www` host. The sitemap and page canonicals also use that host; legacy apex sitemap URLs remain accepted by route discovery for compatibility. See `google-indexing-audit.md` for the canonical/sitemap correction. The existing Search Console property is unchanged.

## Deployment and verification

1. Merge the PR into `main`. Vercel's existing Git integration runs `npm run build` and publishes `dist`. Keep that build command (the post-Vite manifest step is required).
2. Verify `https://www.vanta-hollow.com/aedb4c5800850e7d2105d43076e13c8a.txt` returns HTTP 200, `text/plain`, and exactly `aedb4c5800850e7d2105d43076e13c8a` (with an optional final newline).
3. Verify `https://www.vanta-hollow.com/indexnow.json` returns JSON whose revision is the deployed Git commit. This build manifest is public, contains no secrets, and has `Cache-Control: no-store`.
4. The **IndexNow production notifications** workflow runs on a successful GitHub deployment status with environment `Production`. It checks that the custom domain serves that exact revision before submitting. Preview deployments do not submit.
5. If Vercel does not send that event or uses a different environment label, run the workflow manually from `main` after production is ready. The daily 09:23 UTC reconciliation also catches missed events, promotions, rollbacks, and failed attempts. It reads the live custom domain, never a preview URL. Ensure Actions and the job's `contents: write` permission are allowed by repository/organization policy.
6. Inspect the Actions log for the actual response: **200** means received successfully; **202** means received with engine key validation pending. Neither means indexed. The first verified run submits every discovered eligible URL; subsequent unchanged runs log zero changes.

## How changes are detected

`scripts/indexnow-manifest.mjs` discovers literal application routes and journal slugs in the existing `src/main.jsx`, cross-checks the sitemap, and fingerprints built HTML, JS, CSS, images, and public assets. It fails closed if the journal structure changes or global HTML gains `noindex`. The build runs `scripts/canonical-pages.mjs` first to emit each route's canonical HTML and the complete sitemap using the same discovered routes, then generates the IndexNow manifest. Unknown sitemap paths are not submitted because this SPA returns HTTP 200 for unknown routes. Future routing changes must update discovery and its tests.

All routes share the SPA bundle, so a changed shared bundle or asset conservatively notifies every current page. Documentation or workflow-only changes with identical build output produce no notifications. Newly discovered routes submit automatically. URLs removed from the route manifest are submitted once as removals, including removals absent from the sitemap. This integration does not change the site's existing HTTP fallback behavior; a removed route should separately return 404/410 if permanent removal semantics are wanted.

Remote Etsy data can change without a Git/Vercel deployment. This implementation detects deployed page changes, not changes at external services. It does not submit Etsy URLs. A future CMS or runtime publishing source needs its own change event integration.

## Durable submission history and failures

The workflow's built-in `GITHUB_TOKEN` writes only a submission ledger to the dedicated Git reference `refs/indexnow/state`. It is not a branch, does not change `main`, and does not trigger Vercel preview builds. Inspect it with `git fetch origin refs/indexnow/state` followed by `git show FETCH_HEAD:state.json`. Do not delete/reset this ref unless you intend to repeat the initial submission. A missing ref initializes once; malformed existing history fails rather than silently resetting.

The serialized workflow diffs the live manifest against accepted URL fingerprints. It deduplicates URLs, batches at most 10,000, validates the exact host, verifies the plain-text key and permissive robots policy, and rechecks the manifest before each batch. Changed restrictive robots rules require review rather than risking unwanted notifications. It saves history after each accepted batch and records status, count, timestamp, and revision. It distinguishes 200 from 202 and does not repeatedly submit a 202 batch just because validation is pending.

400/403/422 fail immediately. Network failures, 429, and 5xx have bounded retries. `Retry-After` supports both seconds and HTTP dates; long cooldowns are persisted in the ledger and respected across runs. Failed batches stay pending for reconciliation. GitHub ledger errors fail the workflow. Check failed workflow logs and rerun after resolving the cause; normal site deployment and visitors are unaffected.

Exactly-once delivery cannot be guaranteed across the remote API and GitHub: a lost response or process interruption after API acceptance but before ledger persistence can cause a retry. Unchanged successful runs and completed initial submissions are durably deduplicated.

## Validation

Run `npm ci`, `npm run test:indexnow`, and `npm run build`. Tests use mocked HTTP responses, including the production run and persistent ledger; they do not submit live URLs. Live key accessibility and real API acceptance can only be confirmed after the production deployment contains the key. No live success should be claimed from unit tests or preview builds.

The site content, artwork, styles, and Google Search Console setup are preserved. The sitemap, robots sitemap reference, and canonical metadata consistently identify the production www URLs. IndexNow notifies participating search engines; it does not guarantee indexing, Google indexing, or rankings. Protocol: https://www.indexnow.org/documentation
