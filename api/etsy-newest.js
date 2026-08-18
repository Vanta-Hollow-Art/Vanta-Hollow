const ETSY_API_BASE = 'https://openapi.etsy.com/v3/application';
const LISTING_COUNT = 4;
const CANDIDATE_COUNT = 25;
const ETSY_TIMEOUT_MS = 8000;

function getCreationTimestamp(listing) {
  return Number(listing?.creation_timestamp ?? listing?.created_timestamp);
}

function getListingType(listing) {
  const listingType = listing?.listing_type ?? listing?.type;
  return typeof listingType === 'string' ? listingType.trim().toLowerCase() : '';
}

function isNonDigitalListing(listing) {
  return getListingType(listing) === 'physical';
}

function getCandidateListings(listings) {
  const seenListingIds = new Set();

  return [...listings]
    .sort((left, right) => getCreationTimestamp(right) - getCreationTimestamp(left))
    .filter((listing) => {
      const listingId = Number(listing?.listing_id);
      const creationTimestamp = getCreationTimestamp(listing);

      if (
        !isNonDigitalListing(listing) ||
        !Number.isSafeInteger(listingId) ||
        listingId < 1 ||
        !Number.isFinite(creationTimestamp) ||
        seenListingIds.has(listingId)
      ) {
        return false;
      }

      seenListingIds.add(listingId);
      return true;
    });
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function isEtsyListingUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      /(^|\.)etsy\.com$/i.test(url.hostname) &&
      /^\/listing\/\d+(?:\/|$)/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

async function fetchEtsyJson(url, apiKey, signal) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'x-api-key': apiKey,
    },
    signal,
  });

  if (!response.ok) {
    const error = new Error('Etsy request failed');
    error.status = response.status;
    throw error;
  }

  return response.json();
}

function sendUnavailable(response) {
  response.setHeader('Cache-Control', 'no-store');
  return response.status(503).json({ error: 'Newest listings are temporarily unavailable.' });
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.setHeader('Cache-Control', 'no-store');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const apiKey = process.env.ETSY_API_KEY;
  const shopId = process.env.ETSY_SHOP_ID;

  if (!apiKey || !apiKey.includes(':') || !/^[1-9]\d*$/.test(shopId || '')) {
    return sendUnavailable(response);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ETSY_TIMEOUT_MS);

  try {
    const activeListingsUrl = new URL(`${ETSY_API_BASE}/shops/${shopId}/listings/active`);
    activeListingsUrl.searchParams.set('limit', String(CANDIDATE_COUNT));

    const activePayload = await fetchEtsyJson(activeListingsUrl, apiKey, controller.signal);
    if (!Array.isArray(activePayload?.results)) {
      return sendUnavailable(response);
    }

    const candidateListings = getCandidateListings(activePayload.results);

    if (candidateListings.length < LISTING_COUNT) {
      return sendUnavailable(response);
    }

    const listingIds = candidateListings.map((listing) => Number(listing.listing_id));

    const batchUrl = new URL(`${ETSY_API_BASE}/listings/batch`);
    batchUrl.searchParams.set('listing_ids', listingIds.join(','));
    batchUrl.searchParams.set('includes', 'Images');

    const batchPayload = await fetchEtsyJson(batchUrl, apiKey, controller.signal);
    if (!Array.isArray(batchPayload?.results)) {
      return sendUnavailable(response);
    }

    const detailsById = new Map(
      batchPayload.results.map((listing) => [Number(listing?.listing_id), listing]),
    );

    const listings = listingIds.map((listingId) => {
      const listing = detailsById.get(listingId);
      const primaryImage = Array.isArray(listing?.images)
        ? listing.images.find((image) => Number(image?.rank) === 1)
        : null;
      const title = typeof listing?.title === 'string' ? listing.title.trim() : '';
      const listingUrl = typeof listing?.url === 'string' ? listing.url.trim() : '';
      const imageUrl = primaryImage?.url_570xN || primaryImage?.url_fullxfull || '';
      const imageAlt = typeof primaryImage?.alt_text === 'string' ? primaryImage.alt_text.trim() : '';

      if (
        listing?.state !== 'active' ||
        !title ||
        !isEtsyListingUrl(listingUrl) ||
        !isHttpsUrl(imageUrl)
      ) {
        return null;
      }

      return {
        id: listingId,
        title,
        url: listingUrl,
        imageUrl,
        imageAlt: imageAlt || title,
      };
    }).filter(Boolean).slice(0, LISTING_COUNT);

    if (listings.length !== LISTING_COUNT) {
      return sendUnavailable(response);
    }

    response.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=86400');
    return response.status(200).json({ listings });
  } catch {
    return sendUnavailable(response);
  } finally {
    clearTimeout(timeout);
  }
}
