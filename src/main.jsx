import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Copy,
  Menu,
  Search,
} from 'lucide-react';
import './styles.css';

const etsyShop = 'https://vantahollow.etsy.com';
const collectorFavoritesUrl = 'https://www.etsy.com/shop/vantahollow/?etsrc=sdt&section_id=56626705';
const shopPoliciesUrl = 'https://www.etsy.com/shop/vantahollow/?etsrc=sdt#policies';
const formspreeFormId = import.meta.env.VITE_FORMSPREE_FORM_ID;
const currentPath = window.location.pathname.replace(/\/$/, '') || '/';

const etsyLinkProps = {
  target: '_blank',
  rel: 'noreferrer',
};

const categories = [
  {
    name: 'Sugar Skull Art',
    label: 'Sugar Skull Art',
    image: '/images/categories/sugar-skull-art.jpg',
    href: 'https://www.etsy.com/shop/vantahollow/?etsrc=sdt&section_id=55965741',
  },
  {
    name: 'Horror Art',
    label: 'Horror Art',
    image: '/images/categories/horror-art.jpg',
    href: 'https://www.etsy.com/shop/vantahollow?section_id=55965747',
  },
  {
    name: 'Clown Art',
    label: 'Clown Art',
    image: '/images/categories/clown-art.jpg',
    href: 'https://www.etsy.com/shop/VantaHollow?section_id=59608394',
  },
  {
    name: 'Dark Fairytale Art',
    label: 'Dark Fairytale Art',
    image: '/images/categories/dark-fairytale-art.jpg',
    href: 'https://www.etsy.com/shop/vantahollow/?etsrc=sdt&section_id=55948934',
  },
  {
    name: 'Dark Fantasy Art',
    label: 'Dark Fantasy Art',
    image: '/images/categories/dark-fantasy-art.jpg',
    href: 'https://www.etsy.com/shop/vantahollow?section_id=55948980',
  },
  {
    name: 'Demon Art',
    label: 'Demon Art',
    image: '/images/categories/demon-art.jpg',
    href: 'https://www.etsy.com/shop/VantaHollow?section_id=59624503',
  },
  {
    name: 'Premium Canvases',
    label: 'Premium Canvases',
    image: '/images/categories/premium-canvases.jpg',
    href: 'https://www.etsy.com/shop/vantahollow/?etsrc=sdt&section_id=57721612',
  },
];

const manualNewestListings = [
  {
    day: 'Newest Listing 1',
    label: 'Newest Listing',
    image: '/images/newest/listing-1.png',
    href: etsyShop,
  },
  {
    day: 'Newest Listing 2',
    label: 'Newest Listing',
    image: '/images/newest/listing-2.png',
    href: etsyShop,
  },
  {
    day: 'Newest Listing 3',
    label: 'Newest Listing',
    image: '/images/newest/listing-3.png',
    href: etsyShop,
  },
  {
    day: 'Newest Listing 4',
    label: 'Newest Listing',
    image: '/images/newest/listing-4.png',
    href: etsyShop,
  },
];

function getArtworkName(title) {
  const separatorIndex = title.search(/\s[-–—=]\s/);

  return separatorIndex === -1 ? title : title.slice(0, separatorIndex).trim() || title;
}

function getValidatedNewestListings(payload, expectedCount = 4) {
  if (!Array.isArray(payload?.listings) || payload.listings.length !== expectedCount) {
    return null;
  }

  const listings = payload.listings.map((listing) => {
    const listingId = String(listing?.id || '').trim();
    const title = typeof listing?.title === 'string' ? listing.title.trim() : '';
    const image = typeof listing?.imageUrl === 'string' ? listing.imageUrl.trim() : '';
    const imageAlt = typeof listing?.imageAlt === 'string' ? listing.imageAlt.trim() : '';
    const href = typeof listing?.url === 'string' ? listing.url.trim() : '';

    try {
      const listingUrl = new URL(href);
      const imageUrl = new URL(image);
      const isEtsyListing =
        listingUrl.protocol === 'https:' &&
        /(^|\.)etsy\.com$/i.test(listingUrl.hostname) &&
        /^\/listing\/\d+(?:\/|$)/.test(listingUrl.pathname);

      if (!listingId || !title || imageUrl.protocol !== 'https:' || !isEtsyListing) {
        return null;
      }
    } catch {
      return null;
    }

    return {
      listingId,
      day: title,
      label: getArtworkName(title),
      image,
      imageAlt: imageAlt || title,
      href,
    };
  });

  return listings.every(Boolean) ? listings : null;
}

const collectorFavorites = [
  {
    title: 'Day of the Dead',
    label: 'Day of the Dead',
    image: '/images/collector-favorites/favorite-1.png',
    href: 'https://vantahollow.etsy.com/listing/1524739765',
  },
  {
    title: 'Dark Alice',
    label: 'Dark Alice',
    image: '/images/collector-favorites/favorite-2.png',
    href: 'https://vantahollow.etsy.com/listing/1463946996',
  },
  {
    title: 'Evil Clown',
    label: 'Evil Clown',
    image: '/images/collector-favorites/favorite-3.png',
    href: 'https://vantahollow.etsy.com/listing/1468266381',
  },
];

const features = [
  {
    icon: '/images/mockup/icon-crown.png',
    title: '125+ Unique Designs',
    body: 'Growing dark fantasy collection',
  },
  {
    icon: '/images/mockup/icon-diamond.png',
    title: 'Premium Quality',
    body: 'Museum grade prints that last a lifetime',
  },
  {
    icon: '/images/mockup/icon-package.png',
    title: 'Secure Packaging',
    body: 'Carefully packed for dark treasures',
  },
  {
    icon: '/images/mockup/icon-heart.png',
    title: 'Made By Dark Souls',
    body: 'For the misfits, the dreamers, the nightwalkers',
  },
];

const journalEntries = [
  {
    entryNumber: 'Archive Entry 001',
    title: 'The Cathedral',
    slug: 'the-cathedral',
    artworkImage: '/images/journal/the-cathedral/the-cathedral.png',
    framedMockup: '/images/journal/the-cathedral/the-cathedral-framed.png',
    publishedDate: 'June 30, 2026',
    category: 'Horror',
    collection: 'Horror',
    series: 'Cathedral Trilogy',
    keywords: ['cathedral', 'gothic', 'architecture', 'stained glass', 'lantern'],
    relatedArticles: ['emergence', 'the-return'],
    excerpt:
      'A cathedral rises from the dark like a memory that refuses to fade. This archive entry studies the architecture, light, and quiet tension behind one of the Hollow\'s flagship visions.',
    story: (
      <>
        {'The Cathedral began with the question: '}
        <em>What exists beyond the places history refuses to remember?</em>
        {'\n\nThe artwork tells the story of a lone traveler answering a call that few ever hear. Beyond the last road and beyond the reach of kingdoms, she discovers a cathedral unlike anything built by human hands. Its impossible architecture rises from the mountains as though it has always existed, waiting in silence for someone willing to answer its invitation.\n\nThe Cathedral never explains itself. It offers no answers about who built it or what waits beyond its crimson entrance. Instead, it invites the viewer to stand beside the traveler for a single moment—the instant before curiosity becomes commitment. By the time she realizes she may not have discovered the Cathedral at all, it is already too late.'}
      </>
    ),
    behindTheCreation: `The original vision wasn't simply to create another gothic cathedral. It needed to feel ancient, impossible, and alive—as though the mountain itself had grown into a monument for something that should never have been worshipped.

Every major decision revolved around scale. The lone figure was intentionally kept small so the viewer would instinctively compare themselves to the structure towering above her. The cathedral wasn't meant to feel abandoned. It was meant to feel patient.

The crimson glow became the emotional centerpiece of the composition. Rather than filling the artwork with red, the light was restrained and concentrated around the entrance, allowing it to act as both a beacon and a warning. It doesn't force the traveler inside—it simply waits for her to choose.`,
    creativeProcess: `One of the greatest challenges was balancing beauty with unease.

Early concepts leaned too heavily into horror, making the cathedral feel aggressive rather than mysterious. As the composition evolved, many of the obvious horror elements were stripped away in favor of cleaner architecture, stronger silhouettes, and more deliberate lighting.

The skull wasn't added as decoration. The Cathedral's architecture forms a colossal skull-like face that dominates the structure from the first glance. Crimson light burns from the mouth-like entrance, making the facade one of the defining characteristics of the final piece.

Every revision pushed toward a single goal: creating an image that revealed something new every time someone stood in front of it.`,
    symbolism: `Cathedrals have traditionally represented sanctuary, faith, and salvation.

The Cathedral turns that idea on its head.

Its towering walls inspire reverence, yet offer no comfort. The crimson light spilling from its entrance resembles a welcome, but nothing within the image suggests safety. Instead, the building exists as a monument to curiosity itself—the irresistible desire to step forward even when every instinct says not to.

The traveler represents every viewer who has ever felt drawn toward the unknown despite knowing better.

Sometimes the greatest danger isn't being hunted.

It's willingly answering the call.`,
    hiddenDetails: `The Cathedral was designed to reward slow observation.

At first glance, the architecture dominates the scene as a colossal skull-like face. The Cathedral's towers and stonework form its unmistakable features, while crimson light spills from the mouth-like entrance below. The longer the viewer studies the piece, the more the building seems to possess a face of its own.

The reflections beneath the cathedral subtly exaggerate its height, making the structure feel even larger than the eye first perceives. Nearly every vertical line guides attention toward the center tower, while the surrounding clouds naturally frame the entrance below.

Even the red lighting is intentionally restrained. Rather than flooding the entire composition with color, it appears only where it serves the story, drawing the eye toward the single place every path eventually leads.`,
    collectorNotes: `The Cathedral is the opening chapter of the Cathedral Trilogy and serves as the foundation for the world of Vanta Hollow.

Its visual language established many of the elements that continue to appear throughout later works: impossible architecture, restrained color palettes, cinematic lighting, and environments that feel like living characters rather than simple backgrounds.

Although it stands as a complete artwork on its own, The Cathedral also marks the beginning of a much larger journey into the Hollow. For many collectors, it becomes the piece that introduces them to the world before they continue deeper into its stories.`,
    closingArchive: `Every legend begins with a single step.

For the traveler, that step carried her beyond the last road, beyond forgotten kingdoms, and to a place that should never have existed.

She believed she had discovered the Cathedral.

Perhaps that's what every visitor believes.

The Cathedral has stood there far longer than memory itself.

Waiting.

Listening.

Calling.

And every once in a while...

Someone answers.`,
    featuredDescription:
      'A dark fantasy collector piece built around gothic architecture, cinematic scale, and the silence before entering the unknown.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4528260885',
    seo: {
      title: 'The Cathedral | The Hollow Journal | Vanta Hollow',
      description:
        'Explore the inspiration, symbolism, hidden details, and collector notes behind The Cathedral from Vanta Hollow.',
    },
  },
  {
    entryNumber: 'Archive Entry 002',
    title: 'The Emergence',
    slug: 'emergence',
    artworkImage: '/images/journal/the-emergence/the-emergence.png',
    framedMockup: '/images/journal/the-emergence/the-emergence-framed.png',
    publishedDate: 'June 30, 2026',
    category: 'Horror',
    collection: 'Horror',
    keywords: ['emergence', 'fairytale', 'transformation', 'shadow', 'awakening'],
    relatedArticles: ['the-cathedral', 'the-return'],
    excerpt:
      'The Emergence captures the instant a hidden world begins to breathe. This entry preserves the visual choices that turn transformation into something elegant, strange, and cinematic.',
    story: (
      <>
        {'The Cathedral promised no salvation. It only asked a question:\n\n'}
        <em>Would you step inside?</em>
        {'\n\nShe answered.\n\nWhat happened beyond those crimson gates has never been witnessed by another soul. No records remain. No survivors ever spoke of what waited inside those impossible halls. When the Cathedral\'s ancient doors opened once more, the woman who emerged wore the same face...but whatever humanity had entered was gone.\n\nThe Emergence marks the moment the Hollow claimed its first disciple. She was never rescued. She was remade. The Cathedral did not destroy her. It transformed her into something that now carries its presence beyond those forgotten mountains.'}
      </>
    ),
    behindTheCreation: `While The Cathedral focused on place, The Emergence shifts the attention to transformation.

The goal was never to create another haunted figure or gothic queen. Every design decision revolved around the unsettling idea that the Cathedral leaves its mark on anyone who answers its call. She needed to feel recognizable enough that viewers believed she was once human, yet different enough that something about her presence immediately felt wrong.

Rather than relying on exaggerated horror, the composition leans into restraint. Her expression reveals almost nothing, allowing the viewer to decide whether she has accepted her fate willingly...or no longer possesses the ability to resist it.`,
    creativeProcess: `One of the greatest challenges was finding the balance between beauty and corruption.

Too much darkness, and the mystery disappeared. Too much elegance, and the transformation lost its weight. The final composition lives between those extremes, allowing traces of the woman she once was to remain visible beneath whatever the Cathedral has made her become.

Lighting became one of the most important storytelling tools. The crimson glow no longer exists only within the Cathedral itself. It now follows her, suggesting that whatever power awakened inside those halls has crossed into the world beyond.`,
    symbolism: `The Emergence explores the idea that some places never truly let people leave.

The Cathedral does not imprison its visitors behind locked doors. Instead, it sends them back changed. The transformation becomes part of them, quietly reshaping the world wherever they walk.

She represents the cost of forbidden curiosity. The moment someone chooses to cross a threshold they were never meant to find, they become part of the story that place has been writing long before they arrived.

Sometimes the greatest horrors are not the monsters waiting inside.

Sometimes they are the people who return.`,
    hiddenDetails: `Although the figure commands immediate attention, the surrounding atmosphere quietly reinforces the story. The crimson lighting subtly echoes the Cathedral's entrance from the first piece, visually linking the two artworks without repeating the same composition.

Her posture remains calm rather than aggressive. Nothing about her suggests violence, yet the stillness itself creates tension. Even the smallest details were chosen to make viewers question whether they are looking at a survivor...or an extension of the Cathedral's will.

Collectors often notice new visual connections to The Cathedral after displaying the two pieces together, revealing details that are easy to overlook when viewed individually.`,
    collectorNotes: `The Emergence serves as the second chapter of the Cathedral Trilogy, shifting the narrative away from architecture and toward consequence.

Where The Cathedral asks whether the traveler will answer the call, The Emergence reveals what happens after that decision has already been made. Together, the two pieces establish the central idea that the Hollow does not merely contain darkness—it reshapes those who enter it.

Displayed alongside The Cathedral, the two works become a continuous story rather than separate illustrations.`,
    closingArchive: `She walked through the Cathedral's doors searching for answers.

The Cathedral gave her a purpose instead.

Now the gates stand silent once more.

Waiting.

Because every place that hungers eventually calls again.

And sooner or later...

Someone always answers.`,
    featuredDescription:
      'A dark fairytale artwork for collectors drawn to transformation, shadow, and cinematic mystery.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4529108056',
    seo: {
      title: 'The Emergence | The Hollow Journal | Vanta Hollow',
      description:
        'Explore the inspiration, creative process, symbolism, and collector notes behind The Emergence from Vanta Hollow.',
    },
  },
  {
    entryNumber: 'Archive Entry 003',
    title: 'The Return',
    slug: 'the-return',
    artworkImage: '/images/journal/the-return/the-return.png',
    framedMockup: '/images/journal/the-return/the-return-framed.png',
    publishedDate: 'June 30, 2026',
    category: 'Horror',
    collection: 'Horror',
    keywords: ['return', 'horror', 'haunting', 'ritual', 'shadow'],
    relatedArticles: ['the-cathedral', 'emergence'],
    excerpt:
      'The Return documents the feeling of something crossing back into the world. Its archive record follows the atmosphere, symbolism, and quiet dread hidden inside the composition.',
    story:
      'The Return is about arrival after absence. The artwork suggests that whatever has come back was not forgotten, only waiting beyond the edge of sight.',
    behindTheCreation:
      'The piece was guided by tension and restraint. Instead of relying on spectacle, the atmosphere was built through a heavy palette, directional light, and a composition that makes the viewer feel watched.',
    creativeProcess:
      'Early versions leaned more directly into horror. The final direction pulled back, allowing the setting, posture, and surrounding darkness to carry the unease with more elegance.',
    symbolism:
      'The darkness functions as a witness. Lighting becomes a signal, the architecture becomes a boundary, and the central presence suggests a recurring theme in the Hollow: the past never stays buried.',
    hiddenDetails:
      'The strongest details sit in the negative space. Notice how the composition guides attention toward what is visible, then quietly asks what might be standing just outside the frame.',
    collectorNotes:
      'A gothic horror archive entry designed for collectors who prefer slow dread over obvious shock. One of the most atmosphere-driven pieces in this first Journal set.',
    closingArchive:
      'The Return closes with the sense that the image has not ended. It has only paused long enough for the viewer to realize something has already arrived.',
    featuredDescription:
      'A gothic horror collector artwork built around return, silence, and the pressure of unseen presence.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4532432647',
    seo: {
      title: 'The Return | The Hollow Journal | Vanta Hollow',
      description:
        'Explore the story, hidden details, symbolism, and collector notes behind The Return from Vanta Hollow.',
    },
  },
];

const archiveFilters = ['All', 'Dark Fantasy', 'Horror', 'Sugar Skull', 'Gothic', 'Fairytales', 'Newest', 'Oldest'];

function Wordmark({ footer = false }) {
  return (
    <img
      className={footer ? 'wordmark-img footer-wordmark' : 'wordmark-img'}
      src="/images/mockup/logo-header.png"
      alt="Vanta Hollow"
    />
  );
}

function getEntryUrl(entry) {
  return `/journal/${entry.slug}`;
}

function getAbsoluteUrl(path) {
  if (typeof window === 'undefined') {
    return path;
  }

  return new URL(path, window.location.origin).href;
}

function formatPublishedDate(entry) {
  return `Published: ${entry.publishedDate}`;
}

function getMetadataLines(entry) {
  return [
    ['Collection', entry.collection],
    ['Category', entry.category],
    ['Series', entry.series],
  ].filter(([, value]) => Boolean(value));
}

function useRevealOnView() {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return undefined;
    }

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return [elementRef, isVisible];
}

function JournalArtworkImage({ entry, className = '', framed = false, priority = false }) {
  return (
    <div className={`artwork-placeholder journal-artwork-image ${framed ? 'framed' : ''} ${className}`.trim()}>
      <img
        src={framed ? entry.framedMockup : entry.artworkImage}
        alt={framed ? `${entry.title} framed artwork mockup` : `${entry.title} artwork`}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
}

function JournalArchiveRecord({ entry }) {
  const [recordRef, isVisible] = useRevealOnView();
  const archiveMetadata = [
    ['Collection', entry.collection],
    ['Category', entry.category],
  ].filter(([, value]) => Boolean(value));

  return (
    <article className={`journal-record journal-reveal ${isVisible ? 'visible' : ''}`} ref={recordRef}>
      <a className="journal-record-art" href={getEntryUrl(entry)} aria-label={`Read ${entry.title}`}>
        <JournalArtworkImage entry={entry} />
      </a>
      <div className="journal-record-copy">
        <p className="journal-entry-number">{entry.entryNumber}</p>
        <h2>{entry.title}</h2>
        <div className="journal-card-meta">
          <p className="journal-date">{formatPublishedDate(entry)}</p>
          {archiveMetadata.map(([label, value]) => (
            <p className="journal-meta-line" key={label}>
              {label}: {value}
            </p>
          ))}
        </div>
        <p>{entry.excerpt}</p>
        <a className="button journal-button" href={getEntryUrl(entry)}>
          Read Entry <span aria-hidden="true">&rsaquo;</span>
        </a>
      </div>
    </article>
  );
}

function JournalLandingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredEntries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filtered = journalEntries.filter((entry) => {
      const searchableText = [
        entry.title,
        entry.category,
        entry.collection,
        entry.series,
        entry.excerpt,
        ...(entry.keywords || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesFilter =
        activeFilter === 'All' ||
        activeFilter === 'Newest' ||
        activeFilter === 'Oldest' ||
        entry.category === activeFilter;

      return matchesSearch && matchesFilter;
    });

    if (activeFilter === 'Newest') {
      return [...filtered].reverse();
    }

    return filtered;
  }, [activeFilter, searchTerm]);

  return (
    <section className="journal-page journal-landing">
      <div className="journal-hero">
        <p className="info-eyebrow">The Hollow Archive</p>
        <h1>The Hollow Journal</h1>
        <p>
          Every masterpiece carries a story beyond the canvas.
          <br />
          <br />
          Step inside the Hollow and explore the inspiration, symbolism, hidden details, and creative journey behind every flagship creation.
        </p>
      </div>

      <div className="journal-tools" aria-label="Search and filter The Hollow Journal">
        <label className="journal-search" htmlFor="journal-search">
          <Search size={16} aria-hidden="true" />
          <span>Search Entries</span>
          <input
            id="journal-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by title, keyword, category, or series"
          />
        </label>

        <div className="journal-filters" aria-label="Journal filters">
          {archiveFilters.map((filter) => (
            <button
              className={activeFilter === filter ? 'active' : undefined}
              type="button"
              onClick={() => setActiveFilter(filter)}
              key={filter}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="journal-archive" aria-label="The Hollow Journal archive">
        {filteredEntries.map((entry) => (
          <JournalArchiveRecord entry={entry} key={entry.slug} />
        ))}
        {filteredEntries.length === 0 ? (
          <p className="journal-empty">No archive entries found.</p>
        ) : null}
      </div>
    </section>
  );
}

function JournalEntrySection({ title, children }) {
  return (
    <section className="journal-story-section">
      <h2>{title}</h2>
      <p>{children}</p>
    </section>
  );
}

function useJournalSeo(entry) {
  useEffect(() => {
    const pageTitle = entry.seo?.title || `${entry.title} | The Hollow Journal | Vanta Hollow`;
    const pageDescription = entry.seo?.description || entry.excerpt;
    const canonicalUrl = getAbsoluteUrl(getEntryUrl(entry));
    const imageUrl = getAbsoluteUrl(entry.artworkImage);
    const previousTitle = document.title;
    const touchedMeta = [];

    const upsertMeta = (selector, attributes) => {
      let element = document.head.querySelector(selector);

      if (!element) {
        element = document.createElement('meta');
        document.head.appendChild(element);
      }

      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
      touchedMeta.push(element);
    };

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    document.title = pageTitle;
    upsertMeta('meta[name="description"]', { name: 'description', content: pageDescription });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'article' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: pageTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: pageDescription });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: pageTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: pageDescription });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });

    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.dataset.journalSchema = entry.slug;
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: entry.title,
      description: pageDescription,
      image: imageUrl,
      datePublished: entry.publishedDate,
      author: {
        '@type': 'Organization',
        name: 'Vanta Hollow',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Vanta Hollow',
      },
      mainEntityOfPage: canonicalUrl,
    });
    document.head.appendChild(schema);

    return () => {
      document.title = previousTitle;
      schema.remove();
      touchedMeta.forEach((element) => {
        if (!element.getAttribute('content')) {
          element.remove();
        }
      });
    };
  }, [entry]);
}

function useNewRelicsSeo() {
  useEffect(() => {
    const pageTitle = 'New Relics | Latest Dark Fantasy & Horror Art | Vanta Hollow';
    const pageDescription = 'Explore the latest physical dark fantasy and horror art releases from Vanta Hollow, gathered newest to oldest by original creation date.';
    const canonicalUrl = getAbsoluteUrl('/new-relics');
    const previousTitle = document.title;
    const touchedElements = [];

    const upsertElement = (selector, tagName, attributes) => {
      let element = document.head.querySelector(selector);
      const wasCreated = !element;
      const previousAttributes = {};

      if (!element) {
        element = document.createElement(tagName);
        document.head.appendChild(element);
      }

      Object.entries(attributes).forEach(([key, value]) => {
        previousAttributes[key] = element.getAttribute(key);
        element.setAttribute(key, value);
      });

      touchedElements.push({ element, wasCreated, previousAttributes });
    };

    document.title = pageTitle;
    upsertElement('link[rel="canonical"]', 'link', { rel: 'canonical', href: canonicalUrl });
    upsertElement('meta[name="description"]', 'meta', { name: 'description', content: pageDescription });
    upsertElement('meta[property="og:type"]', 'meta', { property: 'og:type', content: 'website' });
    upsertElement('meta[property="og:title"]', 'meta', { property: 'og:title', content: pageTitle });
    upsertElement('meta[property="og:description"]', 'meta', { property: 'og:description', content: pageDescription });
    upsertElement('meta[property="og:url"]', 'meta', { property: 'og:url', content: canonicalUrl });
    upsertElement('meta[name="twitter:card"]', 'meta', { name: 'twitter:card', content: 'summary' });
    upsertElement('meta[name="twitter:title"]', 'meta', { name: 'twitter:title', content: pageTitle });
    upsertElement('meta[name="twitter:description"]', 'meta', { name: 'twitter:description', content: pageDescription });

    return () => {
      document.title = previousTitle;
      touchedElements.forEach(({ element, wasCreated, previousAttributes }) => {
        if (wasCreated) {
          element.remove();
          return;
        }

        Object.entries(previousAttributes).forEach(([key, value]) => {
          if (value === null) {
            element.removeAttribute(key);
          } else {
            element.setAttribute(key, value);
          }
        });
      });
    };
  }, []);
}

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, nextProgress)));
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  return <div className="journal-progress" style={{ transform: `scaleX(${progress / 100})` }} />;
}

function ShareArchive({ entry }) {
  const [copied, setCopied] = useState(false);
  const entryUrl = getAbsoluteUrl(getEntryUrl(entry));
  const encodedUrl = encodeURIComponent(entryUrl);
  const encodedTitle = encodeURIComponent(`${entry.title} | Vanta Hollow`);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(entryUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="journal-share">
      <h2>Share This Entry</h2>
      <div>
        <a href={`https://www.pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`} target="_blank" rel="noreferrer" aria-label="Share on Pinterest">
          <SocialIcon type="pinterest" />
          <span>Pinterest</span>
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer" aria-label="Share on Facebook">
          <SocialIcon type="facebook" />
          <span>Facebook</span>
        </a>
        <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noreferrer" aria-label="Share on X">
          <span className="share-x-icon" aria-hidden="true">X</span>
          <span>X</span>
        </a>
        <button type="button" onClick={copyLink}>
          <Copy size={16} aria-hidden="true" />
          <span>{copied ? 'Copied' : 'Copy Link'}</span>
        </button>
      </div>
    </section>
  );
}

function JournalRelatedEntry({ entry }) {
  const [entryRef, isVisible] = useRevealOnView();

  return (
    <article className={`journal-related-entry journal-reveal ${isVisible ? 'visible' : ''}`} ref={entryRef}>
      <a href={getEntryUrl(entry)} aria-label={`Read ${entry.title}`}>
        <JournalArtworkImage entry={entry} />
      </a>
      <h3>{entry.title}</h3>
      <p>{entry.excerpt}</p>
      <a className="button journal-button" href={getEntryUrl(entry)}>
        Read Entry <span aria-hidden="true">&rsaquo;</span>
      </a>
    </article>
  );
}

function RelatedEntries({ entry }) {
  const relatedEntries = (entry.relatedArticles || [])
    .map((slug) => journalEntries.find((item) => item.slug === slug))
    .filter(Boolean);
  const fallbackEntries = journalEntries.filter((item) => item.slug !== entry.slug);
  const entries = [...relatedEntries, ...fallbackEntries.filter((item) => !relatedEntries.includes(item))].slice(0, 2);

  return (
    <section className="journal-related">
      <h2>Explore More Entries</h2>
      <div className="journal-related-grid">
        {entries.map((relatedEntry) => (
          <JournalRelatedEntry entry={relatedEntry} key={relatedEntry.slug} />
        ))}
      </div>
    </section>
  );
}

function JournalEntryPage({ entry }) {
  useJournalSeo(entry);
  const entryIndex = journalEntries.findIndex((item) => item.slug === entry.slug);
  const previousEntry = entryIndex > 0 ? journalEntries[entryIndex - 1] : null;
  const nextEntry = entryIndex < journalEntries.length - 1 ? journalEntries[entryIndex + 1] : null;
  const metadataLines = getMetadataLines(entry);

  return (
    <article className="journal-page journal-entry-page">
      <ReadingProgressBar />
      <div className="journal-entry-flow">
        <aside className="journal-entry-meta">
          <p className="journal-entry-number">{entry.entryNumber}</p>
          <h1>{entry.title}</h1>
          <dl>
            <div>
              <dt>Published</dt>
              <dd>{entry.publishedDate}</dd>
            </div>
            {metadataLines.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </aside>

        <div className="journal-entry-hero">
          <a href={entry.artworkImage} target="_blank" rel="noreferrer" aria-label={`View larger ${entry.title} artwork`}>
            <JournalArtworkImage entry={entry} priority />
          </a>
        </div>

        <div className="journal-entry-content">
          <JournalEntrySection title="Story">{entry.story}</JournalEntrySection>
          <JournalEntrySection title="Behind the Creation">{entry.behindTheCreation}</JournalEntrySection>
          <JournalEntrySection title="Creative Process">{entry.creativeProcess}</JournalEntrySection>
          <JournalEntrySection title="Symbolism">{entry.symbolism}</JournalEntrySection>
          <JournalEntrySection title="Hidden Details">{entry.hiddenDetails}</JournalEntrySection>
          <JournalEntrySection title="Collector Notes">{entry.collectorNotes}</JournalEntrySection>
          <JournalEntrySection title="Closing the Archive">{entry.closingArchive}</JournalEntrySection>

          <section className="journal-featured-artwork">
            <div>
              <h2>Featured Artwork</h2>
              <p>{entry.featuredDescription}</p>
              <a className="button journal-button" href={entry.etsyUrl || etsyShop} {...etsyLinkProps}>
                Collect This Piece <span aria-hidden="true">&rsaquo;</span>
              </a>
            </div>
            <JournalArtworkImage entry={entry} framed />
          </section>

          <RelatedEntries entry={entry} />
          <ShareArchive entry={entry} />

          <nav className="journal-entry-nav" aria-label="Journal entry navigation">
            {previousEntry ? (
              <a href={getEntryUrl(previousEntry)}>Previous Entry</a>
            ) : (
              <span aria-hidden="true">Previous Entry</span>
            )}
            <a href="/journal">Back to Journal</a>
            {nextEntry ? (
              <a href={getEntryUrl(nextEntry)}>Next Entry</a>
            ) : (
              <span aria-hidden="true">Next Entry</span>
            )}
          </nav>
        </div>
      </div>
    </article>
  );
}

function NewRelicsLoadingCards({ count }) {
  return Array.from({ length: count }, (_, index) => (
    <div
      aria-hidden="true"
      className="collection-card newest-card newest-card-placeholder"
      key={`new-relics-placeholder-${index}`}
    >
      <span className="newest-card-loading-label">Loading</span>
    </div>
  ));
}

function NewRelicsPage() {
  const listingCount = 24;
  const [listingsState, setListingsState] = useState({
    status: 'loading',
    listings: [],
  });

  useNewRelicsSeo();

  useEffect(() => {
    const controller = new AbortController();

    const loadNewestRelics = async () => {
      try {
        const response = await fetch('/api/etsy-newest?limit=24', {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('New Relics request failed');
        }

        const listings = getValidatedNewestListings(await response.json(), listingCount);
        if (!listings) {
          throw new Error('Invalid New Relics response');
        }

        if (!controller.signal.aborted) {
          setListingsState({ status: 'success', listings });
        }
      } catch {
        if (!controller.signal.aborted) {
          setListingsState({ status: 'failure', listings: [] });
        }
      }
    };

    loadNewestRelics();

    return () => controller.abort();
  }, []);

  return (
    <section className="new-relics-page">
      <div className="new-relics-page-inner">
        <header className="new-relics-header">
          <p className="info-eyebrow">Freshly Unearthed</p>
          <h1>New Relics</h1>
          <p>The latest physical Vanta Hollow releases, gathered newest to oldest from the depths of the Hollow.</p>
        </header>

        {listingsState.status === 'failure' ? (
          <div className="new-relics-failure" role="alert">
            <h2>The Relics Could Not Be Summoned.</h2>
            <p>Please try again soon, or enter the Etsy shop to explore the collection.</p>
            <a className="button" href={etsyShop} {...etsyLinkProps}>
              Visit Etsy Shop <span aria-hidden="true">&rsaquo;</span>
            </a>
          </div>
        ) : (
          <div
            className="new-relics-grid"
            aria-busy={listingsState.status === 'loading'}
            aria-label="Newest physical Vanta Hollow artwork"
          >
            {listingsState.status === 'loading'
              ? <NewRelicsLoadingCards count={listingCount} />
              : listingsState.listings.map((listing) => (
                <a className="collection-card newest-card" href={listing.href} key={listing.listingId} {...etsyLinkProps}>
                  <img src={listing.image} alt={listing.imageAlt || listing.day} />
                  <span>{listing.label}</span>
                  <strong>View Listing</strong>
                </a>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}

function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setStatus({ type: 'error', message: 'Enter your email address to join the Hollow.' });
      return;
    }

    if (!event.currentTarget.checkValidity()) {
      setStatus({ type: 'error', message: 'Enter a valid email address.' });
      return;
    }

    if (!formspreeFormId) {
      setStatus({ type: 'error', message: 'Email signup is not configured yet.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(`https://formspree.io/f/${formspreeFormId}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      if (!response.ok) {
        throw new Error('Formspree submission failed');
      }

      setEmail('');
      setStatus({
        type: 'success',
        message:
          "Welcome to the Hollow.\nYou'll be the first to hear about new releases and collector favorites.",
      });
    } catch {
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please try again in a moment.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
          required
        />
        <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          <span>Subscribe</span>
          <span aria-hidden="true">&rsaquo;</span>
        </button>
      </form>
      {status.message ? (
        <p className={`newsletter-status ${status.type}`} aria-live="polite">
          {status.message}
        </p>
      ) : null}
    </>
  );
}

function SocialIcon({ type }) {
  if (type === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="5" />
        <circle cx="12" cy="12" r="3.7" />
        <circle cx="17" cy="7" r="1" />
      </svg>
    );
  }

  if (type === 'pinterest') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M11.8 3.6c-4.1 0-7 2.8-7 6.5 0 2.3 1.2 4.1 3 4.8.3.1.5 0 .6-.4l.3-1.2c.1-.3.1-.5-.2-.8-.6-.7-.9-1.5-.9-2.5 0-2.7 2-4.8 5.1-4.8 2.8 0 4.4 1.7 4.4 4.1 0 3-1.3 5.6-3.4 5.6-1.1 0-1.9-.9-1.7-2l.8-3.2c.2-.9 0-1.7-.9-1.7-1.1 0-2 1.1-2 2.6 0 .9.3 1.6.3 1.6l-1.3 5.4c-.4 1.5-.2 3.4-.1 3.6.1.1.2.1.3 0 .1-.2 1.6-2 2.1-3.5l.6-2.4c.5.9 1.8 1.6 3.1 1.6 4 0 6.7-3.6 6.7-8.4 0-3.6-3.1-6.9-7.8-6.9z" />
      </svg>
    );
  }

  if (type === 'tiktok') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.2 3.5v10.2a4.5 4.5 0 1 1-4.5-4.5c.4 0 .8.1 1.2.2v2.9c-.3-.2-.7-.3-1.2-.3a1.7 1.7 0 1 0 1.7 1.7V3.5h2.8c.4 2.2 1.8 3.6 4 3.9v2.8c-1.6-.1-2.9-.7-4-1.7z" />
      </svg>
    );
  }

  if (type === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="facebook-icon">
      <path d="M15.1 8.1h-2.1c-.7 0-1.1.4-1.1 1.2v1.7h3l-.4 3h-2.6v6h-3.2v-6H6.3v-3h2.4V9.1c0-2.7 1.7-4.3 4.1-4.3h2.3v3.3z" />
    </svg>
  );
}

function InfoPage({ eyebrow, title, subtitle, className = '', children }) {
  return (
    <section className={`info-page ${className}`.trim()}>
      <div className="info-page-inner">
        <p className="info-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {subtitle ? <p className="info-subtitle">{subtitle}</p> : null}
        <div className="info-content">{children}</div>
      </div>
    </section>
  );
}

function FAQPage() {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems((items) => ({
      ...items,
      [index]: !items[index],
    }));
  };

  const faqs = [
    {
      question: 'What Types Of Artwork Do You Offer?',
      answer: (
        <p>Vanta Hollow specializes in dark fantasy, gothic, horror, sugar skull, dark fairytale, Creepy Clown Art, and Demon Art. Every piece is selected to bring atmosphere, mystery, and cinematic beauty into your space.</p>
      ),
    },
    {
      question: 'What Sizes Are Available?',
      answer: (
        <>
          <p>Posters are available in:</p>
          <ul>
            <li>9x11</li>
            <li>11x14</li>
            <li>12x18</li>
            <li>16x20</li>
            <li>18x24</li>
            <li>24x36</li>
          </ul>
          <p>Canvas prints are available in:</p>
          <ul>
            <li>16x24</li>
            <li>20x30</li>
            <li>24x36</li>
          </ul>
        </>
      ),
    },
    {
      question: 'Are The Prints Framed?',
      answer: <p>Frames shown in mockup images are for display purposes only. Unless otherwise specified, purchases include the artwork print only.</p>,
    },
    {
      question: 'What Quality Are The Prints?',
      answer: <p>All artwork is professionally printed using premium materials designed to deliver rich colors, sharp detail, and long-lasting quality.</p>,
    },
    {
      question: 'How Long Does Shipping Take?',
      answer: <p>Production and shipping times vary depending on the product ordered and destination. Estimated delivery times are provided during checkout.</p>,
    },
    {
      question: 'Do You Ship Internationally?',
      answer: <p>At this time, Vanta Hollow ships within the United States only.</p>,
    },
    {
      question: 'Can I Return Or Exchange My Order?',
      answer: <p>Because each item is produced specifically for your order, returns and exchanges are generally not accepted. However, if your order arrives damaged or there is an issue with your purchase, please reach out and we'll work to make it right.</p>,
    },
    {
      question: 'My Order Arrived Damaged. What Should I Do?',
      answer: <p>If your order arrives damaged, contact us as soon as possible and include photos of both the packaging and the artwork. We'll work quickly to resolve the issue.</p>,
    },
    {
      question: 'Where Can I See More Of Vanta Hollow?',
      answer: <p>You can explore the full collection, discover customer favorites, and follow along for new releases through the Vanta Hollow Etsy shop and social media channels.</p>,
    },
    {
      question: 'Still Have Questions?',
      answer: <p>Can't find what you're looking for? Step through the Contact page and send a message into the Hollow. We'll get back to you as soon as possible.</p>,
    },
  ];

  return (
    <InfoPage
      eyebrow="The Hollow Guide"
      title="Before You Enter The Hollow"
      className="faq-page"
    >
      <div className="faq-accordion">
        {faqs.map((faq, index) => {
          const isOpen = Boolean(openItems[index]);

          return (
            <article className={`faq-item ${isOpen ? 'open' : ''}`} key={faq.question}>
              <button
                type="button"
                className="faq-question"
                onClick={() => toggleItem(index)}
                aria-expanded={isOpen}
              >
                <span aria-hidden="true">+</span>
                {faq.question}
              </button>
              <div className="faq-answer" aria-hidden={!isOpen}>
                <div>{faq.answer}</div>
              </div>
            </article>
          );
        })}
      </div>
    </InfoPage>
  );
}

function AboutPage() {
  return (
    <InfoPage eyebrow="About Vanta Hollow" title="Where Dark Worlds Come To Life" className="about-page">
      <article>
        <h2>Welcome To The Hollow</h2>
        <p>Vanta Hollow was created for those drawn to darker worlds.</p>
        <p>From gothic queens and haunted kingdoms to demons, ravens, and twisted fairytales, every piece is chosen for its atmosphere, mood, and cinematic beauty.</p>
        <p>This collection is built on the idea that wall art should do more than fill empty space. It should transform a room, tell a story, and create a world of its own.</p>
        <p>Whether you're drawn to dark fantasy, horror, gothic imagery, or the strange beauty found in forgotten places, Vanta Hollow was created for those who find inspiration in the shadows.</p>
      </article>

      <article>
        <h2>Why Vanta Hollow Exists</h2>
        <p>Vanta Hollow began with a simple idea: wall art should feel like an experience.</p>
        <p>Not something that disappears into the background, but something that changes the atmosphere of a room the moment you walk in.</p>
        <p>Every piece is chosen for its ability to create mood, tell a story, and transform a space into something unforgettable.</p>
      </article>

      <article>
        <h2>The Collection</h2>
        <p>Blood moons. Ancient kingdoms. Haunted forests. Cursed queens. Ravens. Demons. Forgotten legends.</p>
        <p>Each piece is selected to capture a feeling, something immersive, striking, and impossible to ignore.</p>
        <p>These are not artworks designed to blend into the background.</p>
        <p>They are designed to become part of the room.</p>
      </article>

      <article>
        <h2>Enter The Hollow</h2>
        <p>More than decor.</p>
        <p>More than a poster.</p>
        <p>A doorway into another world.</p>
        <p>For those drawn to darker beauty, forgotten legends, and stories hidden in the shadows, Vanta Hollow is an invitation to step beyond the ordinary.</p>
        <p className="about-heart" aria-hidden="true">&#9829;</p>
      </article>
    </InfoPage>
  );
}

function ContactPage() {
  return (
    <InfoPage eyebrow="Contact Vanta Hollow" title="Send A Message Into The Hollow" className="contact-page">
      <article>
        <h2>Questions, Orders, And Dark Little Details</h2>
        <p>
          For questions about artwork, orders, shipping, or custom requests, reach out directly and
          we will get back to you as soon as possible.
        </p>
        <p>
          <a className="button info-button" href="mailto:vantahollow.art@gmail.com">
            Email Vanta Hollow <span aria-hidden="true">&rsaquo;</span>
          </a>
        </p>
      </article>
    </InfoPage>
  );
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isHome = currentPath === '/';
  const isAbout = currentPath === '/about';
  const isJournal = currentPath === '/journal';
  const journalEntry = journalEntries.find((entry) => currentPath === `/journal/${entry.slug}`);
  const isFAQ = currentPath === '/faq';
  const isContact = currentPath === '/contact';
  const isNewRelics = currentPath === '/new-relics';
  const [newestListingsState, setNewestListingsState] = useState({
    status: 'loading',
    listings: [],
  });
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (!isHome) {
      return undefined;
    }

    const controller = new AbortController();
    const showManualNewestListings = () => {
      if (!controller.signal.aborted) {
        setNewestListingsState({ status: 'failure', listings: [] });
      }
    };

    const loadNewestListings = async () => {
      try {
        const response = await fetch('/api/etsy-newest?limit=24', {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });

        if (!response.ok) {
          showManualNewestListings();
          return;
        }

        const listings = getValidatedNewestListings(await response.json(), 24);
        if (!listings) {
          showManualNewestListings();
          return;
        }

        if (!controller.signal.aborted) {
          setNewestListingsState({ status: 'success', listings: listings.slice(0, 4) });
        }
      } catch {
        showManualNewestListings();
      }
    };

    loadNewestListings();

    return () => controller.abort();
  }, [isHome]);

  const displayedNewestListings = newestListingsState.status === 'success'
    ? newestListingsState.listings
    : manualNewestListings;

  return (
    <div className="site-shell">
      <div className="announcement">
        <img src="/images/mockup/announcement-left.png" alt="" aria-hidden="true" />
        <span>GOTHIC QUEENS &#8226; HAUNTED KINGDOMS &#8226; HORROR &#8226; DARK FAIRYTALES</span>
        <img src="/images/mockup/announcement-right.png" alt="" aria-hidden="true" />
      </div>

      <header className="site-header">
        <div className="brand" aria-hidden="true" />

        <button
          className="menu-button"
          type="button"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <Menu size={28} />
        </button>

        <nav
          className={`main-nav ${isMenuOpen ? 'open' : ''}`}
          id="primary-navigation"
          aria-label="Primary navigation"
        >
          <a className={isHome ? 'active' : undefined} href="/" onClick={closeMenu}>
            Home
          </a>
          <a href={etsyShop} {...etsyLinkProps} onClick={closeMenu}>Shop All</a>
          <a href="/#collections" onClick={closeMenu}>Collections</a>
          <a className={isAbout ? 'active' : undefined} href="/about" onClick={closeMenu}>About</a>
          <a className={isJournal || journalEntry ? 'active' : undefined} href="/journal" onClick={closeMenu}>Journal</a>
          <a href={`${etsyShop}#reviews`} {...etsyLinkProps} onClick={closeMenu}>Reviews</a>
          <a className={isFAQ ? 'active' : undefined} href="/faq" onClick={closeMenu}>FAQ</a>
          <a className={isContact ? 'active' : undefined} href="/contact" onClick={closeMenu}>Contact</a>
        </nav>

      </header>

      <main>
        {isFAQ ? (
          <FAQPage />
        ) : isAbout ? (
          <AboutPage />
        ) : isJournal ? (
          <JournalLandingPage />
        ) : journalEntry ? (
          <JournalEntryPage entry={journalEntry} />
        ) : isNewRelics ? (
          <NewRelicsPage />
        ) : isContact ? (
          <ContactPage />
        ) : (
          <>
        <section className="hero" id="home">
          <div className="hero-copy">
            <h1>
              <img className="hero-comparison-logo" src="/images/generated/hero-circular-logo-test.png" alt="Vanta Hollow" />
            </h1>
            <p className="tagline">Dark Fantasy Wall Art</p>
            <p className="hero-text">
              For the souls who live in the shadows.
              <br />
              <br />
              Gothic queens. Haunted kingdoms. Forgotten legends.
              <br />
              Curated artwork for those who find beauty in the darkness.
            </p>
            <a className="button" href={etsyShop} {...etsyLinkProps}>
              Browse the Collection <span aria-hidden="true">&rsaquo;</span>
            </a>
          </div>
        </section>

        <section className="feature-strip" aria-label="Vanta Hollow benefits">
          <div className="feature-inner">
            {features.map((feature) => {
              return (
                <article key={feature.title} className="feature-item">
                  <img src={feature.icon} alt="" aria-hidden="true" />
                  <div>
                    <h2>{feature.title}</h2>
                    <p>{feature.body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="newest-listings" id="newest-listings">
          <div className="newest-copy">
            <span className="eyebrow">Freshly Unearthed</span>
            <h2>
              New Relics
              <br />
              From The Hollow
            </h2>
            <p>
              The newest pieces to leave the Hollow.
              <br />
              Fresh listings gathered in one place,
              <br />
              gathered here before they disappear into the Hollow.
            </p>
            <a className="button" href="/new-relics">
              Newest Relics <span aria-hidden="true">&rsaquo;</span>
            </a>
          </div>

          <div className="newest-grid">
            {newestListingsState.status === 'loading'
              ? Array.from({ length: 4 }, (_, index) => (
                <div
                  aria-hidden="true"
                  className="collection-card newest-card newest-card-placeholder"
                  key={`newest-placeholder-${index}`}
                >
                  <span className="newest-card-loading-label">Loading</span>
                </div>
              ))
              : displayedNewestListings.map((listing) => (
                <a className="collection-card newest-card" href={listing.href} key={listing.listingId || listing.day} {...etsyLinkProps}>
                  <img src={listing.image} alt={listing.imageAlt || listing.day} />
                  <span>{listing.label}</span>
                  <strong>View Listing</strong>
                </a>
              ))}
          </div>
        </section>

        <section className="collections" id="collections">
          <div className="section-heading">
            <div>
              <h2>Enter The Hollow</h2>
              <p>Art for Those Who Walk in Darkness</p>
            </div>
          </div>

          <div className="collection-grid">
            {categories.map((category) => (
              <a className="collection-card" href={category.href} key={category.name} {...etsyLinkProps}>
                <img src={category.image} alt={category.name} />
                <span>{category.label}</span>
                <strong>View All</strong>
              </a>
            ))}
          </div>

          <a className="button centered" href={etsyShop} {...etsyLinkProps}>
            Shop All Collections <span aria-hidden="true">&rsaquo;</span>
          </a>
        </section>

        <section className="featured" id="about">
          <div className="featured-copy">
            <span className="eyebrow">Collector Favorites</span>
            <h2>
              The Pieces They Keep
              <br />
              Coming Back For
            </h2>
            <p>
              The most loved artwork in the Hollow.
              <br />
              Chosen by collectors, displayed in homes,
              <br />
              and returned to again and again.
            </p>
            <a className="button" href={collectorFavoritesUrl} {...etsyLinkProps}>
              Shop Favorites <span aria-hidden="true">&rsaquo;</span>
            </a>
          </div>
          <div className="featured-grid">
            {collectorFavorites.map((favorite) => (
              <a className="collection-card featured-card" href={favorite.href} key={favorite.title} {...etsyLinkProps}>
                <img src={favorite.image} alt={favorite.title} />
                <span>{favorite.label}</span>
                <strong>View Listing</strong>
              </a>
            ))}
          </div>
        </section>
          </>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <section className="footer-brand">
              <Wordmark footer />
              <p>Dark fantasy wall art for the souls who live in the shadows.</p>
              <div className="socials" aria-label="Social links">
                <a href="https://www.facebook.com/people/Vanta-Hollow/61565393533552/" target="_blank" rel="noreferrer" aria-label="Facebook">
                  <SocialIcon type="facebook" />
                </a>
                <a href="https://instagram.com/vantahollow" target="_blank" rel="noreferrer" aria-label="Instagram">
                  <SocialIcon type="instagram" />
                </a>
                <a href="https://www.tiktok.com/@vantahollow" target="_blank" rel="noreferrer" aria-label="TikTok">
                  <SocialIcon type="tiktok" />
                </a>
                <a href="https://www.youtube.com/@vantahollow" target="_blank" rel="noreferrer" aria-label="YouTube">
                  <SocialIcon type="youtube" />
                </a>
                <a href="https://in.pinterest.com/VantaHollow/" target="_blank" rel="noreferrer" aria-label="Pinterest">
                  <SocialIcon type="pinterest" />
                </a>
              </div>
            </section>

            <section className="footer-links">
              <h2>Shop</h2>
              <nav aria-label="Footer shop links">
                <a href={etsyShop} {...etsyLinkProps}>Shop All</a>
                <a href="/#collections">Collections</a>
                <a href={collectorFavoritesUrl} {...etsyLinkProps}>Collector Favorites</a>
                <a href={etsyShop} {...etsyLinkProps}>Etsy Shop</a>
              </nav>
            </section>

            <section className="footer-links">
              <h2>Information</h2>
              <nav aria-label="Footer information links">
                <a href="/about">About Us</a>
                <a href="/journal">Journal</a>
                <a href={`${etsyShop}#reviews`} {...etsyLinkProps}>Reviews</a>
                <a href="/faq">FAQ</a>
                <a href="/contact">Contact</a>
                <a href={shopPoliciesUrl} {...etsyLinkProps}>Shop Policies</a>
              </nav>
            </section>

            <section className="newsletter">
              <h2>Join The Hollow</h2>
              <p>Get early access to all new art, exclusive drops and dark inspiration.</p>
              <NewsletterSignup />
            </section>
          </div>

          <div className="footer-utility">
            <p className="copyright">&copy; 2026 Vanta Hollow. All rights reserved.</p>
            <p className="etsy-attribution">
              The term ‘Etsy’ is a trademark of Etsy, Inc. This application uses the Etsy API but is not endorsed or certified by Etsy, Inc.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
