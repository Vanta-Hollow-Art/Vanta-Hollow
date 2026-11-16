# Google indexing and canonical audit

Audited production on 2026-11-16T02:49:43.199Z. Production revision: 8a9cefa527f98c51461b0a152c69c76decb0e106.

## Findings

- All 52 application pages return HTTP 200 on HTTPS www; all 46 journal pages render a distinct article without browser errors.
- All 92 artwork/mockup image URLs return HTTP 200 with image content types.
- The journal archive links to all 46 entries; no broken internal page targets or absolute apex internal links were found. Root-relative links correctly stay on www.
- All 48 live sitemap URLs use the apex host and therefore redirect, although HTTPS www is the serving host.
- The sitemap omits /journal, /journal/the-cathedral, /journal/emergence, and /journal/the-return. Those pages exist and are internally linked.
- No page includes a canonical in its initial HTML. After JavaScript, all 46 journal pages and /new-relics have correct www canonicals; /, /about, /contact, /faq, and /journal have none.
- No robots or X-Robots-Tag noindex blocks were found on the 52 production pages. robots.txt allows crawling, but advertises the redirecting apex sitemap URL.
- HTTPS apex URLs redirect permanently (308) to equivalent www paths. HTTP apex first upgrades to HTTPS apex, then www; HTTP www upgrades to HTTPS www. Trailing slash variants currently return 200, and tracking-query journal URLs already declare the clean path canonical after JavaScript.

## Search Console sample supplied by the owner

The owner reported 29 indexed, 28 discovered-but-not-indexed, and 17 redirect URLs. They supplied 10 example URLs from the discovered report; every example uses HTTPS apex and returns 308 to a working www page. These 10 URLs are redirecting alternate URLs, not missing site pages. The other 18 exclusions and the list of 17 redirects were not supplied; their exact membership, crawl history, and Google-selected canonicals cannot be determined from totals or a public crawl. The www targets may or may not be indexed: live availability does not establish Google index status.

| Supplied path on apex | Response | Working destination |
| --- | --- | --- |
| /about | 308 | https://www.vanta-hollow.com/about |
| /contact | 308 | https://www.vanta-hollow.com/contact |
| /faq | 308 | https://www.vanta-hollow.com/faq |
| /journal/kraken-of-the-black-tide | 308 | https://www.vanta-hollow.com/journal/kraken-of-the-black-tide |
| /journal/the-aftershow | 308 | https://www.vanta-hollow.com/journal/the-aftershow |
| /journal/the-ancestors-vigil | 308 | https://www.vanta-hollow.com/journal/the-ancestors-vigil |
| /journal/the-black-covenant | 308 | https://www.vanta-hollow.com/journal/the-black-covenant |
| /journal/the-black-saint | 308 | https://www.vanta-hollow.com/journal/the-black-saint |
| /journal/the-cathedral-of-teeth | 308 | https://www.vanta-hollow.com/journal/the-cathedral-of-teeth |
| /journal/the-dawnkeeper | 308 | https://www.vanta-hollow.com/journal/the-dawnkeeper |

## Focused correction in this PR

- Publish a complete sitemap of 52 HTTPS www routes, including all 46 journal entries; regenerate the deployed sitemap from the same route discovery used by IndexNow.
- Point robots.txt at the www sitemap.
- Emit route-specific static HTML shells with an absolute www canonical in the initial head, preserving the same React body, scripts, styles, and content. The existing journal metadata hook keeps the same canonical after rendering.
- Pin generated metadata/share URLs to the production host.
- Serve those HTML shells at existing extensionless URLs with Vercel cleanUrls and redirect trailing slashes to the existing no-slash convention. The existing SPA fallback and Etsy API remain.
- Keep the IndexNow key, notifier, ledger, retry behavior, and workflow unchanged. The manifest is still generated last, after page HTML and sitemap are written.

This is not full prerendering: the page body still requires JavaScript, just as before. Unknown paths still use the existing homepage fallback; this PR does not introduce a new 404 design.

## All artwork pages checked

Each row returned 200, rendered one article with a correct www canonical, had working artwork/mockup image URLs, and was linked from the archive.

| Artwork | Path | In old sitemap |
| --- | --- | --- |
| The Cathedral | /journal/the-cathedral | No |
| The Emergence | /journal/emergence | No |
| The Return | /journal/the-return | No |
| The Black Saint | /journal/the-black-saint | Yes |
| The Final Judgment | /journal/the-final-judgment | Yes |
| The Thirteenth Saint | /journal/the-thirteenth-saint | Yes |
| The Show Never Ends | /journal/the-show-never-ends | Yes |
| The Widow's Bloom | /journal/the-widows-bloom | Yes |
| When Hell Answered | /journal/when-hell-answered | Yes |
| The Crimson Queen | /journal/the-crimson-queen | Yes |
| The Haunted Reflection | /journal/the-haunted-reflection | Yes |
| A Cup Before Dying | /journal/a-cup-before-dying | Yes |
| The Iron Revenant | /journal/the-iron-revenant | Yes |
| The Guest | /journal/the-guest | Yes |
| The Marigold Keeper | /journal/the-marigold-keeper | Yes |
| The Final Rescue | /journal/the-final-rescue | Yes |
| The Last Oath | /journal/the-last-oath | Yes |
| The Moonbound Warden | /journal/the-moonbound-warden | Yes |
| Kraken Of The Black Tide | /journal/kraken-of-the-black-tide | Yes |
| The Oath Between Worlds | /journal/the-oath-between-worlds | Yes |
| The Drowned Bride of Saltmere | /journal/the-drowned-bride-of-saltmere | Yes |
| The One Who Stayed | /journal/the-one-who-stayed | Yes |
| The Exiled Seraph | /journal/the-exiled-seraph | Yes |
| Blackthorn Hall | /journal/blackthorn-hall | Yes |
| The Last Mercy | /journal/the-last-mercy | Yes |
| The Soulkeeper | /journal/the-soulkeeper | Yes |
| The Ancestors' Vigil | /journal/the-ancestors-vigil | Yes |
| The Cabin Light Slasher | /journal/the-cabin-light-slasher | Yes |
| The Blood Court | /journal/the-blood-court | Yes |
| The Black Covenant | /journal/the-black-covenant | Yes |
| The Final Coronation | /journal/the-final-coronation | Yes |
| The Cathedral of Teeth | /journal/the-cathedral-of-teeth | Yes |
| The Dawnkeeper | /journal/the-dawnkeeper | Yes |
| The Aftershow | /journal/the-aftershow | Yes |
| The House That Hunts | /journal/the-house-that-hunts | Yes |
| The Wyrm's Reckoning | /journal/the-wyrms-reckoning | Yes |
| The Gilded Catrina | /journal/the-gilded-catrina | Yes |
| The Graveborn | /journal/the-graveborn | Yes |
| The Rosebound Catrina | /journal/the-rosebound-catrina | Yes |
| The Night Sovereign | /journal/the-night-sovereign | Yes |
| The Last Votive | /journal/the-last-votive | Yes |
| The Haunted Carnival Gatekeeper | /journal/the-haunted-carnival-gatekeeper | Yes |
| The Standoff | /journal/the-standoff | Yes |
| The Quieting | /journal/the-quieting | Yes |
| The Silent Breach | /journal/the-silent-breach | Yes |
| The Road to Vesperhold | /journal/the-road-to-vesperhold | Yes |

## What Google still needs to process

After merge and production verification, submit/check https://www.vanta-hollow.com/sitemap.xml in the existing Search Console property (a domain property covers both hosts; a URL-prefix property must cover www). Inspect representative www URLs and compare user-declared versus Google-selected canonical, and request recrawling where appropriate. Keep the permanent non-www redirects: a redirect exclusion for an alternate host is normal and does not need to become an indexed page. Do not delete or recreate the property.

Google must recrawl the sitemap and URLs, render the existing JavaScript content, consolidate alternate URLs, and independently decide which www pages to index. Discovered currently not indexed means the reported URL has not yet been crawled; it is not proof of a duplicate-content decision or missing artwork. Neither these changes nor IndexNow guarantee Google indexing or ranking.

References:

- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://support.google.com/webmasters/answer/7440203
