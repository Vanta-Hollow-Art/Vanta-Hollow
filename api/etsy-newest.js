const ETSY_API_BASE = 'https://openapi.etsy.com/v3/application';
const DEFAULT_LISTING_COUNT = 4;
const MAX_LISTING_COUNT = 24;
const ACTIVE_PAGE_SIZE = 100;
const DETAIL_BATCH_SIZE = 25;
const MAX_ACTIVE_PAGES = 1000;
const ETSY_TIMEOUT_MS = 15000;

function getCreationTimestamp(listing) {
  const timestampFields = [
    listing?.original_creation_timestamp,
    listing?.creation_timestamp,
    listing?.created_timestamp,
  ];

  for (const value of timestampFields) {
    const timestamp = Number(value);

    if (Number.isFinite(timestamp) && timestamp > 0) {
      return timestamp;
    }
  }

  return Number.NaN;
}

function getListingType(listing) {
  const listingType = typeof listing?.listing_type === 'string'
    ? listing.listing_type.trim().toLowerCase()
    : '';
  const fallbackType = typeof listing?.type === 'string'
    ? listing.type.trim().toLowerCase()
    : '';

  return listingType || fallbackType;
}

function isPhysicalListing(listing) {
  return getListingType(listing) === 'physical';
}

function getCandidateListings(listings) {
  const seenListingIds = new Set();

  return [...listings]
    .filter((listing) => {
      const listingId = Number(listing?.listing_id);
      const creationTimestamp = getCreationTimestamp(listing);

      return (
        listing?.state === 'active' &&
        isPhysicalListing(listing) &&
        Number.isSafeInteger(listingId) &&
        listingId > 0 &&
        Number.isFinite(creationTimestamp)
      );
    })
    .sort((left, right) => {
      const timestampDifference = getCreationTimestamp(right) - getCreationTimestamp(left);

      if (timestampDifference !== 0) {
        return timestampDifference;
      }

      return Number(right?.listing_id) - Number(left?.listing_id);
    })
    .filter((listing) => {
      const listingId = Number(listing?.listing_id);

      if (seenListingIds.has(listingId)) {
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

async function fetchAllActiveListings(shopId, apiKey, signal) {
  const activeListings = [];

  for (let page = 0; page < MAX_ACTIVE_PAGES; page += 1) {
    const offset = page * ACTIVE_PAGE_SIZE;
    const activeListingsUrl = new URL(`${ETSY_API_BASE}/shops/${shopId}/listings/active`);
    activeListingsUrl.searchParams.set('limit', String(ACTIVE_PAGE_SIZE));
    activeListingsUrl.searchParams.set('offset', String(offset));

    const activePayload = await fetchEtsyJson(activeListingsUrl, apiKey, signal);
    if (!Array.isArray(activePayload?.results)) {
      throw new Error('Invalid Etsy active-listings response');
    }

    const pageListings = activePayload.results;
    if (pageListings.length === 0) {
      return activeListings;
    }

    activeListings.push(...pageListings);

    const totalCount = Number(activePayload?.count);
    const hasKnownTotal = Number.isSafeInteger(totalCount) && totalCount >= 0;
    const nextOffset = offset + ACTIVE_PAGE_SIZE;

    if (
      (hasKnownTotal && nextOffset >= totalCount) ||
      pageListings.length < ACTIVE_PAGE_SIZE
    ) {
      return activeListings;
    }
  }

  throw new Error('Etsy active-listings pagination limit exceeded');
}

function getUsableListing(listing, listingId) {
  const primaryImage = Array.isArray(listing?.images)
    ? listing.images.find((image) => Number(image?.rank) === 1)
    : null;
  const title = typeof listing?.title === 'string' ? listing.title.trim() : '';
  const listingUrl = typeof listing?.url === 'string' ? listing.url.trim() : '';
  const imageUrl = primaryImage?.url_570xN || primaryImage?.url_fullxfull || '';
  const imageAlt = typeof primaryImage?.alt_text === 'string' ? primaryImage.alt_text.trim() : '';

  if (
    listing?.state !== 'active' ||
    !isPhysicalListing(listing) ||
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
}

async function fetchNewestUsableListings(candidateListings, listingCount, apiKey, signal) {
  const listings = [];

  for (
    let candidateIndex = 0;
    candidateIndex < candidateListings.length && listings.length < listingCount;
    candidateIndex += DETAIL_BATCH_SIZE
  ) {
    const candidateBatch = candidateListings.slice(
      candidateIndex,
      candidateIndex + DETAIL_BATCH_SIZE,
    );
    const listingIds = candidateBatch.map((listing) => Number(listing.listing_id));

    const batchUrl = new URL(`${ETSY_API_BASE}/listings/batch`);
    batchUrl.searchParams.set('listing_ids', listingIds.join(','));
    batchUrl.searchParams.set('includes', 'Images');

    const batchPayload = await fetchEtsyJson(batchUrl, apiKey, signal);
    if (!Array.isArray(batchPayload?.results)) {
      throw new Error('Invalid Etsy listing-details response');
    }

    const detailsById = new Map(
      batchPayload.results.map((listing) => [Number(listing?.listing_id), listing]),
    );

    for (const listingId of listingIds) {
      const usableListing = getUsableListing(detailsById.get(listingId), listingId);

      if (usableListing) {
        listings.push(usableListing);
      }

      if (listings.length === listingCount) {
        break;
      }
    }
  }

  return listings;
}

function getRequestedListingCount(request) {
  const rawLimit = Array.isArray(request.query?.limit)
    ? request.query.limit[0]
    : request.query?.limit;

  if (rawLimit === undefined || !/^\d+$/.test(String(rawLimit))) {
    return DEFAULT_LISTING_COUNT;
  }

  const requestedLimit = Number(rawLimit);

  if (!Number.isSafeInteger(requestedLimit) || requestedLimit < 1) {
    return DEFAULT_LISTING_COUNT;
  }

  return Math.min(requestedLimit, MAX_LISTING_COUNT);
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
  const listingCount = getRequestedListingCount(request);

  if (!apiKey || !apiKey.includes(':') || !/^[1-9]\d*$/.test(shopId || '')) {
    return sendUnavailable(response);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ETSY_TIMEOUT_MS);

  try {
    const activeListings = await fetchAllActiveListings(shopId, apiKey, controller.signal);
    const candidateListings = getCandidateListings(activeListings);

    if (candidateListings.length < listingCount) {
      return sendUnavailable(response);
    }

    const listings = await fetchNewestUsableListings(
      candidateListings,
      listingCount,
      apiKey,
      controller.signal,
    );

    if (listings.length !== listingCount) {
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
