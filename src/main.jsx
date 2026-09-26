import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
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
  {
    entryNumber: 'Archive Entry 004',
    title: 'The Black Saint',
    slug: 'the-black-saint',
    artworkImage: '/images/journal/the-black-saint/the-black-saint.png',
    framedMockup: '/images/journal/the-black-saint/the-black-saint-framed.png',
    publishedDate: 'September 1, 2026',
    category: 'Dark Fantasy',
    collection: 'Dark Fantasy',
    keywords: [
      'black saint',
      'dark fantasy',
      'warrior',
      'medieval fantasy',
      'gothic warrior',
      'dark knight',
      'gothic architecture',
    ],
    relatedArticles: ['the-cathedral', 'the-return'],
    excerpt:
      'The Black Saint stands inside a kingdom built to appear holy while carrying the secrets buried beneath it. This archive entry explores the white city, the staff of names, the sealed halo, and the moment duty becomes judgment.',
    story: `They built the city in white so no one would question what slept beneath it.

Every coronation, one warrior was chosen to wear black.

He walked behind the throne, stood beneath the bells, and carried every secret the kingdom could not survive—vanished bloodlines, buried uprisings, purchased miracles, and the names of the dead erased so the empire could keep calling itself holy.

The people called him blessed.

The rulers called him loyal.

For years, he believed the staff in his hands was a symbol of duty. Then, deep beneath the cathedral, he discovered the truth: the shaft was carved with thousands of names, each hidden inside the wood like a grave no one was meant to find. The halo behind him was no mark of sainthood.

It was a lock.

On the morning of the new king’s ascension, the city gathered in white and gold. Priests filled the stairs. Soldiers lined the sacred avenue. Black banners hung motionless between the spires as the chosen warrior took his place before the cathedral gates.

When the crown was raised, he drove the staff into the marble.

The halo opened.

Every sealed chamber beneath the city answered at once.

Golden statues bowed. Cathedral doors split wide. The dead rose as shadows across the plaza, each bearing the face of someone the kingdom had buried without a name. The spotless city finally revealed the graves built into its foundations.

Only then did the court understand why one man had been made to carry every sin.

He was never their absolution.

He was the witness kept alive until judgment had a voice.`,
    behindTheCreation: `The Black Saint began with a contradiction: a radiant kingdom guarded by the darkest figure in the scene.

The white city needed to feel immaculate. Pale stone, gold ornament, monumental towers, and ceremonial architecture create the appearance of a civilization certain of its own holiness. Against that setting, the lone warrior in black immediately becomes an interruption.

That contrast shaped the story. Rather than making him an outsider attacking the kingdom, he became part of its machinery—the one person entrusted with everything the crown could never allow the public to know.

His darkness is not evidence of corruption. It is evidence of what he has been forced to carry.

The final concept turned the image from a portrait of authority into something more unsettling: a man standing at the center of a beautiful system because he alone knows what was buried to keep it beautiful.`,
    creativeProcess: `The composition was built around hierarchy, ceremony, and restraint.

The warrior occupies the foreground as the strongest dark shape in the image while the pale architecture rises behind him in repeating vertical lines. The staff reinforces that structure, connecting the figure visually to the towers, gates, and sacred geometry of the city.

The palette became essential to the narrative. White and gold suggest purity, legitimacy, and religious authority. Black becomes the visual record of everything those colors are attempting to conceal.

The halo-like form behind the warrior was especially important. It needed to read first as part of the city's sacred imagery while still supporting the darker story attached to it. In the lore, that symbol is not proof of sainthood.

It is a lock.

The final image relies on contrast rather than spectacle: one dark witness standing inside a kingdom designed to make darkness appear impossible.`,
    symbolism: `Nearly every major element in The Black Saint is built around the difference between appearance and truth.

The white city represents manufactured innocence. Its architecture is magnificent because the kingdom needs magnificence to become evidence of its own righteousness. Gold crowns, sacred towers, ceremonies, and monuments allow power to present itself as holiness.

The warrior's black armor carries the opposite meaning. He has been assigned everything the kingdom refuses to display: erased bloodlines, suppressed uprisings, purchased miracles, unnamed dead, and generations of secrets.

The staff represents institutional memory. What appears to be a symbol of office is actually carved with the names the kingdom tried to remove from history.

The halo carries the most important inversion. It resembles sanctity, but within the story it functions as containment—a lock placed around truths that cannot remain buried forever.

When he finally opens it, judgment does not arrive from outside the kingdom.

It comes from everything already beneath its foundations.`,
    hiddenDetails: `The Black Saint rewards attention through visual relationships that reinforce the story without requiring invented hidden imagery.

The most immediate contrast is the black figure against the pale city. His silhouette separates him from the ceremonial world surrounding him even though his position makes clear that he belongs within its hierarchy.

The vertical staff visually echoes the surrounding towers and architectural lines, tying the warrior to the institution he serves. At the same time, its prominence gives weight to the object that becomes central to the lore.

The halo-like structure behind him creates another deliberate contradiction. It frames him with the visual language of sainthood while the story reveals that its purpose is far more ominous.

The white-and-gold environment matters just as much as the warrior himself. The city must look clean, sacred, and almost untouchable for the revelation beneath it to carry any meaning.

Nothing here depends on a secret object the viewer has to discover. The tension comes from learning that familiar symbols of duty and holiness mean something very different once the city's history is known.`,
    collectorNotes: `The Black Saint stands as an independent Dark Fantasy story within Vanta Hollow.

Its mythology centers on institutional secrecy, corrupted holiness, suppressed history, and the transformation of obedience into judgment. The warrior is neither a conventional hero nor a villain. For most of his life, he serves the system exactly as he was taught to serve it.

What changes is not his strength.

It is his understanding of what that service protects.

That distinction gives The Black Saint its place within the Hollow. The story is not about destroying a kingdom because darkness has invaded it. The darkness was already there, sealed beneath white stone and sacred ceremony.

The Black Saint simply becomes the person who refuses to carry it silently any longer.

For collectors drawn to dark medieval fantasy, Gothic architecture, morally complicated warriors, and imagery where beauty conceals something much darker, this work represents one of the clearest expressions of Vanta Hollow's Dark Fantasy identity.`,
    closingArchive: `The city had survived wars.

It had survived famine.

It had survived rebellion, succession, and every secret its rulers believed they had successfully buried.

What it could not survive was being remembered.

The crown rose.

The staff struck marble.

And beneath a city built in white...

the dead finally answered.

They had given one man every name they wanted forgotten.

In the end, that was their mistake.`,
    featuredDescription:
      'A dark fantasy warrior artwork about sacred authority, buried history, and the moment a kingdom\'s chosen keeper of secrets becomes its witness of judgment.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4548859289',
    seo: {
      title: 'The Black Saint | The Hollow Journal | Vanta Hollow',
      description:
        'Explore the story, symbolism, and creation of The Black Saint, a dark fantasy warrior carrying the buried secrets of a radiant kingdom.',
    },
  },
  {
    entryNumber: 'Archive Entry 005',
    title: 'The Final Judgment',
    slug: 'the-final-judgment',
    artworkImage: '/images/journal/the-final-judgement/the-final-judgement.png',
    framedMockup: '/images/journal/the-final-judgement/the-final-judgement-framed.png',
    publishedDate: 'September 1, 2026',
    category: 'Dark Fantasy',
    collection: 'Dark Fantasy',
    keywords: [
      'the final judgment',
      'final judgment',
      'knight',
      'knights',
      'dark fantasy',
      'gothic cathedral',
      'medieval battle',
      'eclipse',
      'prophecy',
    ],
    relatedArticles: ['the-black-saint', 'the-cathedral'],
    excerpt:
      'The Final Judgment captures two rival knights beneath an eclipsed sky, their divided relic blades colliding before a ruined cathedral. What appears to be a final duel becomes the revelation that both warriors are opposing keys in a prophecy-built ritual.',
    story: `Both kingdoms had been taught the same prophecy.

At the eclipse, one knight would ascend toward the cathedral. Another would descend from it. The warrior left standing would inherit everything beneath the darkened sun.

The Order of Dawn sent its brightest champion dressed in white and gold.

The Black Crown answered with a knight forged in iron, shadow, and crimson fire.

Neither had seen the other’s face.

Neither knew their swords had been forged from the same ancient relic, divided generations earlier and given to kingdoms taught to hate one another.

They met before the cathedral steps as the moon swallowed the sun.

Steel collided.

Crimson lightning tore outward from one blade. White fire erupted from the other. The impact raced through the stone beneath their feet and climbed the cathedral walls like something inside the building had finally heard its name.

But no blood fell.

Instead, both swords pulled harder toward the clash.

Ancient markings awakened across the cathedral facade. Stone saints turned their faces from the altar. Above the knights, the great staircase split along a hidden seam, exposing a sealed gate beneath the cathedral.

Then the missing final line of the prophecy appeared across the stone:

The victor will not inherit the kingdom.

The kingdom will inherit the victor.

For generations, both orders had sent their greatest warriors toward the same confrontation.

The white armor and black armor had never represented good and evil.

They were opposing keys.

Their hatred was the mechanism.

Their swords were designed to meet.

Every battle had fed the thing sealed beneath the cathedral, and every champion had been taught that victory meant destroying the warrior standing across from him.

The energy raging between the blades was not theirs.

Something below was waking.

For the first time, both knights understood what the prophecy had truly demanded.

Finish the strike, defeat the enemy, and release whatever their kingdoms had spent centuries worshipping beneath the stone.

Or break the ritual together.`,
    behindTheCreation: `The Final Judgment began with a confrontation designed to look familiar before revealing something far more dangerous.

The white-and-gold knight and the black-and-crimson rival create an immediate visual opposition. Their armor suggests competing orders and inherited loyalties, but neither warrior was intended to represent simple good or evil. The contrast needed to establish the conflict their kingdoms had taught them to believe.

The eclipse and ruined cathedral shift that conflict beyond a conventional duel. Both elements make the encounter feel ceremonial, as though the knights have arrived at a moment prepared long before either of them was born.

The central idea became revelation rather than victory. The battle matters because the collision exposes the machinery behind it: two champions shaped into opposing weapons, brought together to complete a ritual neither was ever meant to understand.`,
    creativeProcess: `The composition was built around the precise point where the two swords collide.

Both warriors drive the eye toward that center through opposing movement, armor silhouettes, and blade direction. Crimson energy and radiant white fire separate the two forces while binding them inside the same decisive impact.

The ruined cathedral steps create a ceremonial stage for the confrontation. Vertical architecture rises behind the knights while the eclipsed sky presses down over the scene, holding the battle between monumental stone and a darkened sun.

The armor language reinforces the inherited division between the two orders. White and gold carry the authority of Dawn; black metal and crimson light carry the severity of the Black Crown. The final composition suspends both warriors at the instant before action becomes consequence, when the clash can still become either completion or refusal.`,
    symbolism: `The two knights function as opposing keys rather than moral opposites.

Their armor presents the conflict in the language their kingdoms created: light against darkness, order against threat, chosen champion against sworn enemy. The story reveals that these identities were constructed to keep both warriors moving toward the same ritual.

Their inherited hatred is the mechanism. Each order preserves the prophecy, forges a champion, and teaches that victory requires the destruction of the other. Neither kingdom needs to control the final battle directly because generations of belief have already ensured it will happen.

The divided swords represent a shared origin concealed by political memory. When the blades meet, they do not simply oppose one another. They reconnect the relic and awaken the sealed power beneath the cathedral.

The prophecy is therefore not a promise of inheritance but an instrument of manipulation. Its missing line exposes the truth: the victor was never meant to rule the kingdom. The victor was meant to become the final possession of whatever waits below it.`,
    hiddenDetails: `The Final Judgment rewards attention through visible relationships that reinforce the confrontation.

The opposing armor palettes establish the divide immediately. White and gold face black and crimson, giving each knight a distinct visual language without reducing the scene to a simple image of good against evil.

The energy at the collision point carries both forces outward. Crimson lightning and radiant fire make the swords feel connected through the impact even while the warriors continue to push against one another.

The cathedral steps place both figures on the same path. One appears to ascend while the other descends, echoing the prophecy that has directed them toward this meeting.

Above them, the eclipsed sky mirrors the locked clash below. The ruined Gothic architecture surrounds the duel with the weight of previous generations, while the awakened cathedral suggests that the building is responding to the swords rather than merely serving as a backdrop.

Nothing depends on an invented concealed symbol. The tension comes from recognizing how every visible element—the armor, blades, steps, eclipse, and cathedral—converges on the same ritual moment.`,
    collectorNotes: `The Final Judgment captures a turning point rather than the conclusion of a battle.

The image holds both knights at the exact instant their understanding changes. Until this moment, each warrior believes the figure across from him is the final obstacle demanded by prophecy. The awakening cathedral reveals that both have been used by the same design.

That realization gives the confrontation its real weight. Completing the strike may satisfy centuries of inherited duty, but it will also open the gate and release the power their kingdoms have been feeding beneath the stone.

Breaking the ritual requires something more difficult than victory. Both warriors must reject the identities, hatred, and promises that shaped them.

For collectors drawn to medieval battles, rival knights, ruined Gothic architecture, and dark fantasy stories built around moral choice, The Final Judgment preserves the moment before two enemies decide whether history will repeat itself.`,
    closingArchive: `The prophecy had promised a victor.

The cathedral had prepared a gate.

Between them, two blades remained locked inside a storm that belonged to neither knight.

For the first time, each warrior saw the true enemy standing beneath the battle rather than across from it.

One final strike would complete the will buried below the cathedral.

One act of refusal could deny it.

The Final Judgment was never about which knight would fall.

It was about whether either would choose to finish the ritual.`,
    featuredDescription:
      'A dark fantasy battle artwork capturing two rival knights at the moment their clash reveals the ancient ritual hidden beneath a ruined Gothic cathedral.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4550141963',
    seo: {
      title: 'The Final Judgment | The Hollow Journal | Vanta Hollow',
      description:
        'Explore the story, symbolism, and creation of The Final Judgment, a dark fantasy battle between two rival knights whose clash reveals a ritual hidden beneath the cathedral.',
    },
  },
  {
    entryNumber: 'Archive Entry 006',
    title: 'The Thirteenth Saint',
    slug: 'the-thirteenth-saint',
    artworkImage: '/images/journal/the-thirteenth-saint/the-thirteenth-saint.png',
    framedMockup: '/images/journal/the-thirteenth-saint/the-thirteenth-saint-framed.png',
    publishedDate: 'September 8, 2026',
    category: 'Dark Fantasy',
    collection: 'Dark Fantasy',
    keywords: [
      'thirteenth saint',
      'dark fantasy',
      'gothic cathedral',
      'fallen saint',
      'raven',
      'blood moon',
      'gothic architecture',
      'supernatural',
      'cursed legend',
      'dark religious art',
    ],
    relatedArticles: ['the-cathedral', 'the-black-saint'],
    excerpt:
      'For centuries, every cathedral honored twelve saints while leaving a thirteenth alcove empty. This archive entry explores the forbidden space, the crowned figure who finally claimed it, and the moment an old faith revealed what it had spent generations refusing to name.',
    story: `Every cathedral tells the same story.

None of them mention the Thirteenth.

For centuries, kingdoms raised impossible cathedrals from black stone and filled them with twelve saints carved in marble. Pilgrims crossed mountains to kneel beneath their vaulted ceilings, believing every prayer climbed toward heaven. The bells rang without fail. The candles never burned out. Faith seemed eternal.

Yet every cathedral was built with thirteen alcoves.

One was always left empty.

The oldest priests refused to answer why.

Every surviving scripture ended one page too soon.

When the last cathedral finally fell silent, the empty alcove was no longer empty.

She stepped into the moonlight wearing a crown no saint had ever claimed. Ravens abandoned the bell towers to follow her. Candles burned crimson in her presence. Stained glass darkened as she passed, as though even the light wished to hide.

The faithful believed they were witnessing the return of a miracle.

They never understood...

The empty alcove was never waiting for a saint.

It was waiting for her.`,
    behindTheCreation: `The Thirteenth Saint began with the idea of an absence that had become part of the architecture.

The cathedral could not simply contain a mysterious woman. It needed to suggest that space had been reserved for her long before anyone living understood why. The empty thirteenth alcove became the central piece of the mythology: something physically present in every sacred structure, yet deliberately excluded from scripture and ritual.

That contradiction shaped the figure herself. She needed to feel ceremonial enough to belong within the cathedral, but wrong enough that her arrival immediately breaks the meaning of everything around her.

The crown, black stone, crimson light, ravens, and monumental scale all reinforce the same idea.

She has not invaded the cathedral.

She has returned to the place that was always hers.`,
    creativeProcess: `The composition depends on scale and vertical architecture.

Towering Gothic forms create the sense of a faith built over centuries, while the central figure provides a human focal point within something much larger and older than herself.

Crimson accents were deliberately restrained so they would function as signals rather than flood the entire image. The moon, stained glass, candlelight, and surrounding darkness carry the atmosphere while the figure remains the visual point where those elements converge.

The challenge was preserving beauty without making the scene feel safe. The final direction allows the cathedral to remain magnificent while quietly suggesting that its symmetry, ritual, and history have always contained one deliberate omission.`,
    symbolism: `The number thirteen carries the mythology of exclusion.

Twelve saints are named, carved, celebrated, and remembered. The thirteenth exists only as empty architecture.

That absence represents everything an institution chooses not to record because acknowledging it would threaten the story the institution tells about itself.

The cathedral represents faith preserved through repetition. The empty alcove represents the truth repetition cannot erase.

Her crown complicates the idea of sainthood further. She does not return seeking permission, canonization, or recognition from the people who excluded her.

She arrives already possessing an authority older than their rituals.

The ravens leaving the towers suggest allegiance shifting away from the institution and toward the figure it tried to erase.

The final revelation is not that a forgotten saint returned.

It is that the empty place was never meant for one of their saints at all.`,
    hiddenDetails: `The Thirteenth Saint rewards attention through relationships between the figure and the architecture rather than through invented concealed imagery.

The vertical cathedral forms repeatedly draw the eye upward, reinforcing the ceremonial scale of the setting while making the crowned figure feel connected to the structure instead of simply placed in front of it.

Crimson illumination breaks through an otherwise dark palette in controlled areas, giving the scene the visual language of sacred light while changing its emotional meaning.

Ravens, stained glass, black stone, and the blood-red moon all reinforce the same transition: the cathedral remains recognizable, but its symbols no longer belong entirely to the faith that built it.

The tension comes from realizing that nothing in the architecture needed to change when she arrived.

The missing place had already been built for her.`,
    collectorNotes: `The Thirteenth Saint stands independently within Vanta Hollow while sharing the brand's recurring fascination with monumental Gothic architecture, corrupted sacred imagery, and histories that refuse to remain buried.

Unlike The Cathedral, this story is not about answering an invitation into the unknown. It is about discovering that an institution has spent generations structuring itself around something it refuses to acknowledge.

The figure is neither a conventional saint nor a simple antagonist. Her arrival exposes a gap that has always existed between official history and whatever truth the empty alcove was created to contain.

For collectors drawn to Gothic cathedrals, fallen saints, ravens, dark religious imagery, supernatural mythology, and cinematic dark fantasy, The Thirteenth Saint represents one of Vanta Hollow's clearest combinations of beauty, reverence, and unease.`,
    closingArchive: `Twelve names remained in the scripture.

Twelve statues stood beneath the bells.

Twelve saints received every prayer the kingdoms knew how to offer.

The thirteenth alcove received nothing.

Until the cathedral went silent.

Until the ravens descended.

Until someone stepped into the place that had waited centuries without a name.

The faithful called it a miracle.

The cathedral knew better.`,
    featuredDescription:
      'A gothic dark fantasy artwork about an empty thirteenth alcove, a crowned figure erased from scripture, and the cathedral that had been waiting for her return.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4534332539',
    seo: {
      title: 'The Thirteenth Saint | The Hollow Journal | Vanta Hollow',
      description:
        'Explore the story, symbolism, and creation of The Thirteenth Saint, a gothic dark fantasy artwork built around a forgotten alcove, ravens, and forbidden cathedral mythology.',
    },
  },
  {
    entryNumber: 'Archive Entry 007',
    title: 'The Show Never Ends',
    slug: 'the-show-never-ends',
    artworkImage: '/images/journal/the-show-never-ends/the-show-never-ends.png',
    framedMockup: '/images/journal/the-show-never-ends/the-show-never-ends-framed.png',
    publishedDate: 'September 8, 2026',
    category: 'Creepy Clowns',
    collection: 'Creepy Clowns',
    keywords: [
      'the show never ends',
      'creepy clown',
      'horror clown',
      'dark carnival',
      'zipper face',
      'sinister clown',
      'gothic horror',
      'carnival horror',
      'amber eyes',
      'stitched face',
    ],
    relatedArticles: ['the-return', 'the-thirteenth-saint'],
    excerpt:
      'A carnival appears where no map says it should exist, and every survivor remembers the same performer waiting beyond the midway. This archive entry explores the zipper-faced clown, the missing attraction, and the question no one who returns can answer: did they ever really leave?',
    story: `Some people insist the carnival burned to the ground decades ago. Others swear they wandered through it only days before. The stories never agree on where it appears or how long it stays, but every survivor remembers the same sound: laughter drifting through the empty midway long after the rides have stopped moving.

Beyond the faded entrance stands an attraction with no ticket booth, no line, and no name on the map. Above its doorway hangs a weathered sign bearing four words:

THE SHOW NEVER ENDS.

Inside waits the performer every witness describes. Crimson hair spills from beneath a black top hat. Amber eyes burn through the darkness. Stitches divide his pale skin, while a heavy metal zipper splits one side of his face from brow to jaw, exposing something darker beneath. Some believe the zipper conceals another face. Others believe it is the only thing keeping something far worse from getting out.

The survivors remember his grin most clearly—rows of impossible teeth appearing just before the lights go dark. Everyone remembers seeing him. No one remembers leaving. By morning, they are home again with dirt on their shoes, the smell of smoke in their clothes, and the certainty that somewhere beyond the edge of town, the carnival is still waiting for its next audience.

They thought they had come to watch the show. He never did.`,
    behindTheCreation: `The Show Never Ends began with a portrait rather than a full carnival scene.

The performer needed to carry the entire mythology in his face. The black top hat, crimson hair, amber eyes, stitched skin, metal zipper, and impossible teeth create enough visual evidence for the viewer to imagine the attraction around him without requiring the carnival itself to dominate the image.

The zipper became the defining idea.

It introduces a question the artwork never answers: is something hidden behind his face, or is the zipper the only thing preventing something else from escaping?

That uncertainty gives the character more power than a straightforward monster reveal. The viewer sees enough to know something is wrong, but not enough to understand what the performer actually is.`,
    creativeProcess: `The composition was designed to make eye contact unavoidable.

Rather than placing the clown deep inside a busy environment, the portrait pushes him forward and allows the black background to swallow nearly everything that is not essential.

Amber eyes become the first point of contact. Crimson hair and aged metallic details then guide attention toward the zipper, stitches, and mouth.

The palette stays tightly controlled around black, blood red, amber, pale flesh, and tarnished bronze so the character remains theatrical without becoming colorful or playful.

The final image needed to feel like the instant a carnival attraction stops performing for a crowd and begins looking directly at one specific person.`,
    symbolism: `The carnival traditionally separates performer from audience.

The Show Never Ends removes that boundary.

The sign promises endless entertainment, but the story turns that promise into confinement. The audience believes it has entered voluntarily, watched the attraction, and eventually gone home.

The dirt on their shoes and smoke in their clothes suggest otherwise.

The zipper represents containment. Whether it hides another face or seals something deeper is deliberately unresolved.

His grin represents the moment spectacle becomes threat. A clown's smile should reassure the audience that everything is part of the performance.

Here, the smile suggests the exact opposite.

The show does not continue because the carnival keeps performing.

It continues because the audience never completely leaves.`,
    hiddenDetails: `The strongest details in The Show Never Ends are visible immediately but become more unsettling when understood together.

The amber eyes are bright enough to control the portrait without overpowering the surrounding darkness. Crimson hair frames the face and leads attention toward the stitched skin and exposed metal zipper.

The zipper divides the face vertically, creating a visual split between the recognizable performer and whatever the viewer imagines might exist beneath him.

The teeth exaggerate the smile beyond anything human while the formal top hat preserves enough traditional carnival imagery to keep the character recognizable as a performer.

Nothing here depends on a secret object concealed inside the image.

The discomfort comes from seeing every major clue clearly and still being unable to decide what kind of creature is looking back.`,
    collectorNotes: `The Show Never Ends expands the horror side of Vanta Hollow through a character-driven mythology rather than monumental architecture or medieval fantasy.

Its strength comes from proximity.

There is no army, kingdom, or distant threat between the collector and the subject. The performer occupies the image directly, forcing the confrontation to happen at portrait distance.

For collectors drawn to creepy clown art, dark carnival imagery, stitched faces, sinister performers, alternative horror decor, and unsettling character portraits, The Show Never Ends represents a more intimate form of Vanta Hollow horror.

The mythology remains deliberately incomplete.

Survivors remember the carnival.

They remember him.

What they cannot remember is how they escaped.`,
    closingArchive: `By morning, the midway is gone.

No lights remain between the trees.

No music carries across the empty road.

The survivors wake in their own beds and tell themselves they made it home.

Then they find dirt beneath their shoes.

Smoke in their clothes.

And somewhere in the silence...

laughter.

The show never ended.

The audience simply stopped remembering it.`,
    featuredDescription:
      'A creepy clown horror artwork centered on a zipper-faced carnival performer whose audience always returns home without remembering how they escaped.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4535780792',
    seo: {
      title: 'The Show Never Ends | The Hollow Journal | Vanta Hollow',
      description:
        'Explore the story and creation of The Show Never Ends, a creepy clown horror artwork about a vanished carnival and the zipper-faced performer waiting inside.',
    },
  },
  {
    entryNumber: 'Archive Entry 008',
    title: 'The Widow\'s Bloom',
    slug: 'the-widows-bloom',
    artworkImage: '/images/journal/the-widow\'s-bloom/the-widow\'s-bloom.png',
    framedMockup: '/images/journal/the-widow\'s-bloom/the-widow\'s-bloom-framed.png',
    publishedDate: 'September 8, 2026',
    category: 'Sugar Skulls',
    collection: 'Sugar Skulls',
    keywords: [
      'widow\'s bloom',
      'sugar skull',
      'sugar skull woman',
      'gothic roses',
      'burgundy roses',
      'calavera',
      'dark floral portrait',
      'gothic woman',
      'day of the dead',
      'mourning',
    ],
    relatedArticles: ['the-thirteenth-saint', 'the-black-saint'],
    excerpt:
      'A widow returned to the same grave every night carrying one burgundy rose. This archive entry explores the mourning portrait, the locked cemetery, the second grave that appeared without being dug, and a devotion that refused to remain on the living side of the gates.',
    story: `They buried him beneath the roses and told her grief would fade with time. Instead, she returned to his grave each night carrying a single burgundy bloom, painting her face in mourning patterns so the dead would recognize the woman who still remembered.

The cemetery keeper began finding fresh petals scattered along the path before sunrise, even though the iron gates remained locked from dusk until morning. Then, on the night the final rose opened, she passed through those gates and was never seen again.

By dawn, a second grave stood beside his.

No name had been carved into the stone. No earth had been disturbed. Only roses marked the place, darker than any that had grown there before. Every year, when the boundary between the living and the dead feels thinnest, those same flowers bloom across both graves.`,
    behindTheCreation: `The Widow's Bloom began with mourning rather than death.

The portrait needed to feel intimate, elegant, and deeply personal instead of threatening. Roses, flowing black hair, ornamental facial details, dark jewelry, and a restrained crimson palette create the visual language of remembrance before the story reveals where that devotion eventually leads.

The sugar skull influence became part of the mythology rather than decoration alone.

Her face is painted so the dead will recognize her.

That choice transforms the portrait from an image of grief into an act of preparation. Each night she returns to the cemetery looking a little more like someone who already belongs on the other side of its gates.`,
    creativeProcess: `The composition was built around the relationship between the face and the roses.

Deep burgundy flowers surround the portrait without overwhelming it, while black hair and dark clothing keep the palette grounded in shadow. Warm skin tones and pale ornamental markings prevent the face from disappearing into the surrounding darkness.

The goal was to preserve elegance while allowing the macabre details to remain unmistakable.

Rather than using aggressive horror imagery, the final direction relies on symmetry, floral framing, jewelry, facial ornamentation, and controlled contrast.

The result needed to feel less like a warning and more like a memorial.`,
    symbolism: `The roses represent memory made physical.

She carries one bloom to the grave each night because grief requires repetition. The ritual continues long after everyone around her expects mourning to fade.

Her painted face represents recognition across the boundary between life and death. The patterns are not a disguise. They are a promise that when she finally crosses that boundary, the person she lost will know who has come looking for him.

The locked cemetery gates represent the division the living believe cannot be crossed.

The untouched second grave proves otherwise.

Most important is the final bloom. Its opening marks the moment remembrance stops being something she carries into the cemetery and becomes something the cemetery carries for both of them.`,
    hiddenDetails: `The Widow's Bloom rewards attention through ornamental repetition and controlled color.

Burgundy roses frame the portrait and echo the darker red accents within the facial decoration and jewelry, binding the floral and human elements into a single visual rhythm.

Black hair creates a continuous shadow around the face, making the pale ornamental details appear almost illuminated without requiring artificial glow.

The portrait balances traditional calavera-inspired visual language with Gothic mourning imagery, allowing neither influence to overpower the other.

Nothing in the artwork requires an invented hidden symbol or concealed figure.

The story deepens details already visible: the flowers become offerings, the face becomes preparation, and the elegance of the portrait becomes part of a ritual of remembrance.`,
    collectorNotes: `The Widow's Bloom brings the Sugar Skulls category into The Hollow Journal through a quieter kind of supernatural story.

Where many Vanta Hollow works center on kingdoms, cathedrals, warriors, or overt horror, this artwork remains close to one woman and one act of remembrance.

Its darkness comes from devotion rather than violence.

For collectors drawn to sugar skull women, burgundy roses, Gothic floral portraits, calavera-inspired details, dark feminine artwork, Victorian mourning aesthetics, and elegant macabre decor, The Widow's Bloom offers a more romantic and intimate expression of the Hollow.

The second grave is never explained.

The story does not need to decide whether she died, crossed willingly, or was simply claimed by the place she visited every night.

The roses are the only answer left behind.`,
    closingArchive: `The cemetery keeper replaced the lock.

The gates still opened for no one after dusk.

Every morning, he walked the path and found the same two graves beneath the roses.

One carried a name.

The other never did.

Years passed.

The flowers never stopped returning.

And when the final bloom opens each autumn...

the petals fall across both stones.`,
    featuredDescription:
      'A gothic sugar skull portrait about mourning, burgundy roses, and a widow whose devotion carried her beyond the locked gates of the cemetery.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4536021326',
    seo: {
      title: 'The Widow\'s Bloom | The Hollow Journal | Vanta Hollow',
      description:
        'Explore the story and symbolism of The Widow\'s Bloom, a gothic sugar skull portrait about burgundy roses, mourning, memory, and devotion beyond death.',
    },
  },
  {
    entryNumber: 'Archive Entry 009',
    title: 'When Hell Answered',
    slug: 'when-hell-answered',
    artworkImage: '/images/journal/when-hell-answered/when-hell-answered.png',
    framedMockup: '/images/journal/when-hell-answered/when-hell-answered-framed.png',
    publishedDate: 'September 20, 2026',
    category: 'Demons',
    collection: 'Demons',
    keywords: ['when hell answered', 'demon', 'hell', 'horned demon', 'winged demon', 'eclipse', 'red eclipse', 'ritual', 'occult', 'cathedral', 'gothic', 'dark fantasy', 'sigil', 'summoning'],
    relatedArticles: ['the-thirteenth-saint', 'the-final-judgment'],
    excerpt: 'Beneath a red eclipse, the faithful mistake a horned demon\'s bowed head for acceptance. The ritual reveals that the creature is only a doorway, and the circle marks the place where Hell will open.',
    story: `The bells beneath the cathedral had been silent for three hundred years. On the night the eclipse burned red, they rang without a hand touching them.

The hooded faithful descended among the ruined spires and took their places beyond the circle. At the first bell, the sigil carved into the stone ignited. At the second, the chains hanging in the darkness pulled taut. At the third, two figures rose soundlessly into the crimson sky—and the horned giant appeared inside the circle with his hands open and his head bowed.

For generations, the order had believed the ritual would summon a ruler they could kneel before. When the demon lowered himself beneath the eclipse, they mistook the gesture for acceptance.

Then the crimson line descended from the blackened sun, passed through the creature's chest, and struck the sigil at their feet. The demon slowly lifted his face, but no voice came from his mouth. The answer came from somewhere beneath the stone, vast enough to make the cathedral towers tremble.

Only then did the faithful understand what their ancestors had hidden from them. The circle had never been drawn to summon Hell into their world.

It had been drawn to mark the place where Hell would open.

They had spent generations asking whether Hell could hear them. When Hell answered, the demon was only the doorway.`,
    behindTheCreation: `When Hell Answered draws its tension from the difference between what the faithful expect and what the ritual reveals. The monumental demon gives their expectation a visible shape, while the cathedral and the eclipse place that figure within a scene too vast for the gathered witnesses to understand.

The bowed head and open hands allow the image to hold a moment of apparent acceptance. Read alongside the story, those gestures become unsettling because the creature is not the ruler the order believed it was summoning.`,
    creativeProcess: `The composition connects the eclipse, the demon, and the ritual circle through the story's descending crimson line. That vertical relationship guides attention from the sky toward the stone, making the location of the opening as significant as the figure standing above it.

Black establishes the depth of the scene, while crimson concentrates attention on the eclipse and the ritual. The spires and hooded faithful provide a sense of scale around the horned, winged figure.`,
    symbolism: `The circle represents the order's mistaken understanding of its own ritual. Its purpose is to mark where Hell will open, and the revelation changes the meaning of every act performed around it.

The demon's monumental presence suggests power, but the story makes that presence a threshold. The eclipse and the descending line connect the visible ceremony to an answer beneath the stone, turning the faithful's certainty into dread.`,
    hiddenDetails: `The contrast between the giant's open hands and the chains pulling taut gives the scene an uneasy balance of stillness and tension. The hooded figures remain small against the cathedral and the demon, reinforcing how little control they have over the answer they requested.

The crucial detail is the line passing through the creature's chest before reaching the sigil. Following that sequence keeps the revelation clear: the demon is only the doorway.`,
    collectorNotes: `When Hell Answered belongs to the Demons collection. Its black and crimson palette, horned silhouette, cathedral spires, and occult circle bring the narrative into a single imposing scene.

For collectors drawn to gothic architecture and dark fantasy ritual imagery, the work offers a discovery that changes how the central figure is read. The terror rests in the purpose of the ceremony becoming clear only after the answer arrives.`,
    closingArchive: 'The archive closes on the distinction the faithful understood too late. Their ancestors\' circle marked an opening, and the figure they expected to rule over them was only the doorway. The final revelation leaves their generations of asking answered by something beneath the stone.',
    featuredDescription: 'A monumental horned, winged demon beneath a crimson eclipse, where a cathedral ritual reveals the doorway through which Hell will open.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4536526179',
    seo: {
      title: 'When Hell Answered | The Hollow Journal | Vanta Hollow',
      description: 'Explore the story, symbolism, and creation of When Hell Answered, a gothic demon artwork where a forbidden ritual reveals that the summoned creature was only the doorway.',
    },
  },
  {
    entryNumber: 'Archive Entry 010',
    title: 'The Crimson Queen',
    slug: 'the-crimson-queen',
    artworkImage: '/images/journal/the-crimson-queen/the-crimson-queen.png',
    framedMockup: '/images/journal/the-crimson-queen/the-crimson-queen-framed.png',
    publishedDate: 'September 20, 2026',
    category: 'Dark Fairytales',
    collection: 'Dark Fairytales',
    keywords: ['the crimson queen', 'crimson queen', 'queen of hearts', 'playing card', 'gothic queen', 'dark fairytale', 'dark fantasy', 'card', 'roses', 'crown', 'royal portrait', 'gothic'],
    relatedArticles: ['a-cup-before-dying', 'the-widows-bloom'],
    excerpt: 'A Queen of Hearts steps through the card that imprisoned her while a nearly identical queen remains inside. Crown, roses, and a fractured border frame a return whose second face remains unexplained.',
    story: `They sealed her inside the card because no kingdom could survive her reign.

For centuries, she watched from behind painted eyes while lesser rulers wore her crown. The roses grew wild around the forgotten deck. The castle emptied. Her name became a warning whispered before every final hand.

Then someone drew the Queen of Hearts.

The border cracked.

The storm returned.

And the woman who stepped through was not the prisoner they remembered.

Behind her, another queen remains trapped inside the card—silent, watchful, and nearly identical. Proof that only one of them was ever meant to escape.

The Crimson Queen captures the moment the game ends, the card releases what it was created to contain, and the true ruler returns to reclaim her throne.

The final card has already been drawn. Add The Crimson Queen to your collection and let her reign over the room.`,
    behindTheCreation: `The Crimson Queen brings the intimacy of a playing card into contact with the scale of a royal return. The card is both a familiar image and the prison described in the story, so its border carries narrative weight before it cracks.

The mirrored royal portrait keeps the second queen central to the work's unease. The escaping ruler and the silent figure left behind remain nearly identical, preserving a question the story deliberately leaves open.`,
    creativeProcess: `The playing-card composition gives the portrait an ordered frame. The ornate crown, corset, lace, and gothic jewelry build visual density within that structure, while roses soften its edges without removing the sense of confinement.

Black and crimson connect the image to the Queen of Hearts, and aged parchment gives the card a material presence. The relationship between the royal portrait and its enclosing border makes the act of stepping through feel like a disruption of the image's own rules of composition.`,
    symbolism: `The card represents containment within the supplied story, and its cracked border marks the end of that containment for one queen. The crown carries the claim to rule, while the roses connect the portrait to the forgotten deck around which they grew.

The second queen makes escape an incomplete answer. Her presence invites attention to likeness and separation, but it does not establish which queen is the original or why only one was meant to leave.`,
    hiddenDetails: `The mirrored portrait rewards looking between the queen who steps through and the figure that remains inside. Similarity is the source of the tension; the image does not need a named double or an explanation of the second figure to sustain it.

Lace, jewelry, and the ornate crown add smaller points of attention around the face. Against aged parchment, the crimson accents keep the playing-card identity legible throughout the gothic detail.`,
    collectorNotes: `The Crimson Queen belongs to Dark Fairytales. Its Queen of Hearts composition joins royal portraiture, roses, and gothic ornament with a story about an imprisonment ending.

Collectors drawn to playing-card art and dark fantasy queens can read the work as both an imposing portrait and a moment of release. The nearly identical queen still inside the card ensures the story retains its mystery after that moment has passed.`,
    closingArchive: 'The final card has been drawn, and one queen has stepped through. The other remains silent and watchful inside the border. The archive leaves them there, preserving the story\'s certainty that only one was meant to escape without assigning an identity to either.',
    featuredDescription: 'A gothic Queen of Hearts portrait in black, crimson, and aged parchment, with one ruler escaping the card while a nearly identical queen remains within.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4539189363',
    seo: {
      title: 'The Crimson Queen | The Hollow Journal | Vanta Hollow',
      description: 'Explore the story, symbolism, and creation of The Crimson Queen, a dark fairytale Queen of Hearts artwork about a ruler escaping the card that imprisoned her.',
    },
  },
  {
    entryNumber: 'Archive Entry 011',
    title: 'The Haunted Reflection',
    slug: 'the-haunted-reflection',
    artworkImage: '/images/journal/the-haunted-reflection/the-haunted-reflection.png',
    framedMockup: '/images/journal/the-haunted-reflection/the-haunted-reflection-framed.png',
    publishedDate: 'September 20, 2026',
    category: 'Horror',
    collection: 'Horror',
    keywords: ['the haunted reflection', 'haunted reflection', 'haunted mirror', 'mirror', 'reflection', 'faceless figure', 'supernatural', 'horror', 'gothic horror', 'dark fantasy', 'ghost', 'haunting'],
    relatedArticles: ['the-show-never-ends', 'the-cathedral'],
    excerpt: 'A woman faces a mirror that no longer copies her movements. The motionless, faceless figure within watches patiently, leaving her uncertain which side of the glass she truly occupies.',
    story: `She remembered washing the mirror clean.

She remembered turning off the light.

What she did not remember was leaving someone behind in the glass.

The woman in the room has already survived whatever happened there. The figure in the mirror is something else entirely—motionless, faceless, and patiently watching. It does not copy her movements. It does not disappear when she turns away. And the longer she stares, the less certain she becomes that she is the one standing outside.

The Haunted Reflection captures the moment an ordinary room becomes impossible—and the mirror stops showing the truth.

Not every reflection belongs to you. Add The Haunted Reflection to your collection and let your walls keep one secret after dark.`,
    behindTheCreation: `The Haunted Reflection places its horror in a familiar relationship becoming unreliable. A mirror should repeat the room and the person before it; the supplied story removes that reassurance while leaving the setting ordinary enough to recognize.

The woman outside the glass and the faceless figure inside establish the visual tension. Neither an identity for the watcher nor a settled answer about who is outside is needed for the scene to become impossible.`,
    creativeProcess: `The composition asks the eye to compare the woman with the figure held in the mirror. Their relationship carries the scene, making attention and stillness more important than overt action.

Deep black and cold gray sustain the subdued atmosphere, while restrained crimson adds a controlled accent. This limited palette supports cinematic visual storytelling by keeping the viewer focused on the room's unsettling division.`,
    symbolism: `The mirror becomes a symbol of failed certainty. It still offers an image, but that image no longer behaves as evidence of what stands before it.

The faceless figure withholds the recognition a reflection normally provides. Its stillness and refusal to copy the woman's movements turn looking into an encounter with something unexplained, while her growing uncertainty prevents the glass from establishing a secure boundary.`,
    hiddenDetails: `The figure's lack of movement matters as much as its lack of a face. In the story it neither follows the woman nor disappears when she turns away, so its presence cannot be made reassuring by treating it as an ordinary reflection.

The restrained color supports that patient unease. Looking between the woman and the glass allows the contradiction to remain central without requiring a concealed identity or an additional supernatural explanation.`,
    collectorNotes: `The Haunted Reflection belongs to Horror. The haunted mirror scene combines a quiet interior, a faceless watcher, and a cold palette for collectors drawn to psychological unease and gothic supernatural imagery.

Its narrative remains deliberately unresolved. The figure is not identified, and the woman's uncertainty about being outside the mirror is part of the experience the artwork preserves.`,
    closingArchive: 'She remembers cleaning the mirror and turning off the light. Those ordinary memories cannot account for the presence left in the glass. The archive closes with the watcher still unexplained and the distinction between inside and outside still uncertain.',
    featuredDescription: 'A gothic horror mirror scene in deep black, cold gray, and restrained crimson, where a faceless watcher makes an ordinary room impossible.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4539207975',
    seo: {
      title: 'The Haunted Reflection | The Hollow Journal | Vanta Hollow',
      description: 'Explore the story, symbolism, and creation of The Haunted Reflection, a gothic horror artwork where a mirror stops reflecting and begins watching.',
    },
  },
  {
    entryNumber: 'Archive Entry 012',
    title: 'A Cup Before Dying',
    slug: 'a-cup-before-dying',
    artworkImage: '/images/journal/a-cup-before-dying/a-cup-before-dying.png',
    framedMockup: '/images/journal/a-cup-before-dying/a-cup-before-dying-framed.png',
    publishedDate: 'September 20, 2026',
    category: 'Dark Fairytales',
    collection: 'Dark Fairytales',
    keywords: ['a cup before dying', 'sinister hatter', 'hatter', 'top hat', 'teacup', 'tea', 'gothic horror', 'dark fairytale', 'amber eyes', 'copper hair', 'horror portrait', 'invitation'],
    relatedArticles: ['the-crimson-queen', 'the-show-never-ends'],
    excerpt: 'An invitation sealed in black wax leads to a sinister hatter and a steaming cup. Roses give way to iron, faces gather in the steam, and by dawn another name is stitched into his hat.',
    story: `The invitation arrived without a sender.

Sealed in black wax, it carried only two words:

Come thirsty.

At midnight, the doors locked behind the final guest. At the head of the table sat a stranger in a battered top hat, smiling over a cup that never stopped steaming.

He asked how they wished to be remembered.

Then he poured without waiting for an answer.

The first sip tasted of roses.

The second tasted of iron.

By the third, faces began forming in the steam—every soul that had once occupied that chair.

When the guest tried to stand, the room had no doors.

The hatter raised his cup and smiled wider.

By dawn, the table was empty. Another name had been stitched into the lining of his hat.

A Cup Before Dying captures the moment curiosity becomes a sentence—when the invitation has been accepted, the final drink has been poured, and the smiling host already knows how the evening will end.

The cup is still warm, and the chair across from him is empty. Add A Cup Before Dying to your collection before the final seat is taken.`,
    behindTheCreation: `A Cup Before Dying builds its unease around hospitality that has already become a sentence. The invitation's two words, Come thirsty, lead directly to a host whose smile gives no reassurance and a drink poured before the guest can answer him.

The sinister hatter portrait concentrates that story in the relationship between his gaze, his grin, and the cup. The encounter feels personal because the host's attention is as prominent as the object he offers.`,
    creativeProcess: `The amber-eyed stare and wild copper hair bring warmth into a palette of black, aged bronze, smoky gray, and rust red. Those warm tones gather attention around the face without making the expression welcoming.

The battered top hat establishes the silhouette, while the steaming, blood-stained teacup anchors the invitation in a visible object. Together, the face and the cup hold the portrait's tension between an offered drink and its known outcome.`,
    symbolism: `The invitation represents curiosity becoming commitment. Its meaning remains direct: the guest is summoned to drink, and the story offers no escape after accepting.

The cup turns a familiar gesture of welcome into the means of the guest's disappearance. Faces forming in the steam connect the occupied chair to earlier souls without identifying them, while the name stitched into the hat's lining makes the ending specific and personal.`,
    hiddenDetails: `The contrast between the intense amber eyes and the unnerving grin keeps the host's expression difficult to receive as friendly. Copper hair and rust-red accents give the portrait a recurring warmth against its smoky shadows.

The story gives the hat's lining particular significance: another name is stitched there by dawn. That textual detail deepens the battered hat's role without claiming that a readable name or hidden inscription is visible in the artwork.`,
    collectorNotes: `A Cup Before Dying belongs to Dark Fairytales. Its sinister hatter, steaming teacup, and warm metallic tones suit collectors drawn to gothic portraits and familiar storybook imagery made threatening.

The work's narrative turns on an accepted invitation and an outcome the smiling host already knows. The final stitched name preserves the consequence without adding identities for those who occupied the chair before.`,
    closingArchive: 'By dawn, the table is empty and another name has been stitched into the lining of the hat. The archive ends with that supplied consequence: the accepted invitation has run its course, and the warm cup and empty chair retain their invitation to the viewer.',
    featuredDescription: 'A sinister hatter with amber eyes, wild copper hair, and a steaming blood-stained teacup, portrayed in black, aged bronze, smoky gray, and rust red.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4540286660',
    seo: {
      title: 'A Cup Before Dying | The Hollow Journal | Vanta Hollow',
      description: 'Explore the story, symbolism, and creation of A Cup Before Dying, a dark fairytale horror portrait of a sinister hatter whose final invitation comes with no way out.',
    },
  },
  {
    entryNumber: 'Archive Entry 013',
    title: 'The Iron Revenant',
    slug: 'the-iron-revenant',
    artworkImage: '/images/journal/the-iron-revenant/the-iron-revenant.png',
    framedMockup: '/images/journal/the-iron-revenant/the-iron-revenant-framed.png',
    publishedDate: 'September 25, 2026',
    category: 'Horror',
    collection: 'Horror',
    keywords: ['iron revenant', 'gothic horror', 'horror art', 'dark resurrection', 'revenant', 'iron throne', 'cursed machinery', 'chained creature', 'vengeance', 'kingdom guilt'],
    relatedArticles: ['the-haunted-reflection', 'when-hell-answered'],
    excerpt: 'A kingdom buried its guilt in a living soul and powered its machinery with his suffering. When the engines fall silent and the chains loosen, the body made to carry other people\'s crimes leaves its throne empty.',
    behindTheCreation: `The Iron Revenant gives institutional cruelty a single, intimate face. The stitched skin and embedded iron make the kingdom's violence tangible, while the story insists that the names driven into him never belonged to him. His monstrous appearance records what was done to him rather than proving the accusations true.

The close view denies the comfortable distance of a distant dungeon scene. Pale eyes, torn seams, and crowded teeth confront the viewer before the narrative reveals the machinery that depended on his pain.`,
    creativeProcess: `The head fills most of the square, its three-quarter angle giving the face weight and depth. Chains curve around the scalp and shoulder, while nails interrupt the outline with uneven points. These repeated iron shapes hold the eye close to the figure.

A red circular glow burns behind the pale skin and dark clothing. That contrast separates the face from the mechanical background and connects the portrait to the chamber's red machinery without needing to show the entire kingdom above.`,
    symbolism: `The nails turn accusations into physical burdens. Each carries a condemned name that is not his, making the body an archive of guilt displaced by those with the power to condemn. The stitched surface extends that idea: even the flesh enclosing the living soul has been assembled for punishment.

The chains loosen rather than break. That precise change matters because the reversal begins with the instruments of confinement releasing their hold. The guilty vanish, but the names remain inside the revenant as he walks home.`,
    hiddenDetails: `The stitches vary in direction and scale across the forehead and cheek, so the pale surface reads as joined pieces rather than an unmarked mask. Larger iron fastenings along the side of the head repeat that construction at a harsher scale.

The chain crossing the scalp echoes the curved red structure behind it. Small highlights on the links and nails keep individual pieces of metal visible against the darkness. Their narrative significance comes from the accusations; the portrait does not need legible names carved into every nail.`,
    collectorNotes: `The Iron Revenant belongs to Horror. Its close portrait, iron textures, and red backlight give it a direct presence for collectors drawn to gothic body horror and stories in which the apparent monster carries someone else's wrongdoing.

The Iron Revenant captures the moment punishment becomes resurrection—when pain stops being a prison and becomes the weapon that returns for those who forged it.

They forced him to carry their sins. Now he has come to return them.`,
    closingArchive: 'The engines have stopped, the chains have loosened, and the throne is empty. By sunrise the guilty have vanished. The story leaves the revenant walking home with the names still inside him, preserving the difference between escaping punishment and being freed of its weight.',
    story: `Every nail had a name.

Murderer.

Traitor.

Heretic.

Monster.

None of them belonged to him.

The kingdom had discovered a way to bury its guilt inside a single body. They stitched condemned flesh around a living soul, chained it beneath the city, and drove every sentence through bone until the screaming finally stopped.

For years, the red machinery behind the chamber walls fed on his suffering and powered the kingdom above.

Then, without warning, the engines went silent.

The chains did not break.

They loosened.

When the executioners entered the chamber, the iron throne was empty. Across the city, every nail used to build the revenant began pulling itself from stone.

By sunrise, the guilty had vanished.

The creature they created was walking home with every name still buried inside him.`,
    featuredDescription: 'A gothic horror artwork about punishment turned resurrection, where a kingdom\'s buried guilt rises through iron, bone, and vengeance.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4542338329',
    seo: {
      title: 'The Iron Revenant | The Hollow Journal | Vanta Hollow',
      description: 'Explore the story, symbolism, and creation of The Iron Revenant, a gothic horror artwork about punishment, guilt, resurrection, and vengeance returning to claim the guilty.',
    },
  },
  {
    entryNumber: 'Archive Entry 014',
    title: 'The Guest',
    slug: 'the-guest',
    artworkImage: '/images/journal/the-guest/the-guest.png',
    framedMockup: '/images/journal/the-guest/the-guest-framed.png',
    publishedDate: 'September 25, 2026',
    category: 'Horror',
    collection: 'Horror',
    keywords: ['the guest', 'haunted room', 'gothic horror', 'ceiling creature', 'haunted wall decor', 'black handprints', 'old house', 'supernatural horror', 'bedroom horror', 'lurking presence'],
    relatedArticles: ['the-haunted-reflection', 'the-show-never-ends'],
    excerpt: 'A woman dismisses the footsteps above her bed until the candle lights itself and a hand unfolds from the ceiling. The black marks she scrubbed from the wall belong to those who slept there before her.',
    behindTheCreation: `The Guest begins with the erosion of an ordinary reassurance: a bedroom should offer shelter. The woman sits among blankets beneath an ornate headboard, but the wall behind her is covered in handprints and the threat enters from directly overhead. Familiar objects make the intrusion more immediate.

Her upward gaze gives the viewer a direction to follow. The enormous hand emerging from the cracked ceiling makes the room feel occupied long before the creature's identity could be understood. The story leaves that identity unanswered.`,
    creativeProcess: `The composition stacks the woman beneath the reaching hand, using the room's height to build pressure. Long fingers and black trails draw the eye down the wall, while the woman's face turns attention back toward the ceiling. That exchange keeps the encounter within the narrow space above the bed.

Cold window light on the right meets the small warmth of the candle on the left. Neither light reaches enough of the room to make it safe; instead, they reveal fragments of damaged plaster, dark bedding, and the waiting presence.`,
    symbolism: `The handprints reverse the woman's explanation of her surroundings. What she dismisses as damp becomes evidence of previous occupants, changing the wall from a surface she can clean into a record she cannot erase by scrubbing.

The self-lit candle marks the end of denial rather than a rescue from darkness. The creature's relief at finding her awake makes its arrival especially unsettling, but the story does not explain that expression or provide a route of escape.`,
    hiddenDetails: `Black handprints appear at different heights behind the bed, with long streaks trailing below them. Their repetition makes them part of the room's visual structure before their connection to previous sleepers is revealed.

The creature's elongated fingers hang above the woman's upward-looking face, while the cracked ceiling frames the opening around them. The ornate headboard remains recognizably domestic beneath that damage, keeping the horror rooted in a place meant for rest.`,
    collectorNotes: `The Guest belongs to Horror. Its confined bedroom, cold shadows, and single candle suit collectors drawn to haunted interiors and slow supernatural dread. The scene depends on proximity: the presence has been inside the house throughout the woman's attempts to explain it away.

The Guest captures the moment a familiar space becomes a trap—when the ceiling opens, the doorway feels impossibly far away, and the thing that has watched from above finally decides to come down.

Some guests knock before entering. This one has been waiting inside the house.`,
    closingArchive: 'The footsteps have stopped above her bed, and the ceiling has opened. The face that appears looks relieved to find her awake. The archive leaves that relief unexplained and the handprints connected to the people who slept there before her, with no promised escape from the room.',
    story: `For weeks, she heard something moving above the ceiling.

A slow scrape across the floorboards.

Three steps.

A pause.

Then three steps back.

Each morning, another black handprint appeared on the wall. She scrubbed them away, blamed the damp, and convinced herself that old houses always made strange sounds.

Until the night the candle lit itself.

The footsteps stopped directly above her bed.

Plaster cracked. Dust fell across the blankets. From the darkness overhead, a hand unfolded into the room—its fingers impossibly long, its nails dragging slowly across the ceiling as it searched for something to hold.

Then its face appeared.

It did not look surprised to find her awake.

It looked relieved.

The handprints were never stains.

They were left by everyone who had slept in that room before her.`,
    featuredDescription: 'A gothic horror artwork about a room that stops feeling safe when the thing hiding above the ceiling finally decides to come down.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4544703587',
    seo: {
      title: 'The Guest | The Hollow Journal | Vanta Hollow',
      description: 'Explore the story, symbolism, and creation of The Guest, a gothic horror artwork about a haunted room, black handprints, and the thing waiting above the ceiling.',
    },
  },
  {
    entryNumber: 'Archive Entry 015',
    title: 'The Marigold Keeper',
    slug: 'the-marigold-keeper',
    artworkImage: '/images/journal/the-marigold-keeper/the-marigold-keeper.png',
    framedMockup: '/images/journal/the-marigold-keeper/the-marigold-keeper-framed.png',
    publishedDate: 'September 25, 2026',
    category: 'Sugar Skulls',
    collection: 'Sugar Skulls',
    keywords: ['marigold keeper', 'sugar skull woman', 'day of the dead', 'sugar skull art', 'cemetery path', 'marigolds', 'remembrance', 'calavera', 'gothic sugar skull', 'forgotten souls'],
    relatedArticles: ['the-widows-bloom', 'the-thirteenth-saint'],
    excerpt: 'Marigolds bloom for souls whose names are fading from memory. A keeper in black lace gathers the flowers, turning their light into paths that guide the forgotten home before she returns to the shadows.',
    behindTheCreation: `The Marigold Keeper approaches death through care and remembrance. The portrait meets the viewer with a steady human gaze beneath painted skull ornament, allowing the figure to feel present and attentive rather than predatory. Her role is to guide those whose names are being forgotten.

Orange marigolds surround the dark clothing and hair with warmth. The flowers give the story's promise of a path home a visible presence, balancing the solemnity of the skull painting with living color.`,
    creativeProcess: `The broad black hat frames the face, and the turned shoulder brings the portrait into an intimate three-quarter view. Lace, flowing hair, and floral decoration create layers of texture without obscuring the eyes.

Warm orange flowers stand against a muted blue-green background. Burgundy details in the hat and face paint bridge those warm and cool areas, while the pale painted skin keeps the expression readable within the dark framing.`,
    symbolism: `The marigolds stand for remembrance made into guidance. Each blooms for a soul whose name has begun to fade, then becomes a light and a path. Their beauty belongs to an act of care rather than a lure.

The painted bones hold life and loss together in one face. The keeper's yearly return gives remembrance a recurring rhythm: after guiding the forgotten home, she withdraws to the shadows until another year has passed.`,
    hiddenDetails: `Fine floral curves and burgundy accents surround the dark eye sockets, with smaller painted petals near the chin. The marks crossing the lips form part of the skull decoration while leaving the woman's expression human and composed.

An ornamental medallion and hanging chains rest against the hat beside dark red flowers. Below them, the lace on the shoulder repeats the portrait's delicate patterning. The orange marigolds remain distinct from those darker ornaments, carrying the story's light through the surrounding shadows.`,
    collectorNotes: `The Marigold Keeper belongs to Sugar Skulls. Its calavera-inspired portrait, black lace, and warm marigolds offer a gentle supernatural presence for collectors drawn to remembrance and the beauty of a life still held in memory.

The related entries offer thematic comparisons in mourning and remembrance. They do not establish a shared history or connect the keeper to another story's characters.

The Marigold Keeper captures the beauty between remembrance and loss—where painted bones celebrate life, darkness gives way to color, and no soul is left without a path home.

Some keepers guard the dead. She guides them home.`,
    closingArchive: 'By sunrise the flowers have vanished and the cemetery gates are closed. The keeper returns to the shadows until the following year. Her departure completes an act of guidance: the forgotten have been given a path toward the memories and offerings calling them home.',
    story: `The marigolds always bloomed before she arrived.

Every year, as midnight approached, their orange petals opened along the oldest path through the cemetery—one flower for every soul whose name had begun to fade from memory.

Dressed in black lace, the keeper walked between the graves gathering each blossom by hand. Beneath her painted smile, she carried the stories of those who no longer had anyone waiting for them.

Each marigold became a light.

Each light became a path.

When the veil between worlds finally opened, the forgotten followed her through the darkness toward the voices, memories, and offerings that still called them home.

By sunrise, the cemetery stood empty once more. The flowers had vanished, the gates were closed, and the keeper returned to the shadows until another year had passed.`,
    featuredDescription: 'A sugar skull artwork about remembrance and guidance, where marigold light opens a path home for the forgotten dead.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4544706005',
    seo: {
      title: 'The Marigold Keeper | The Hollow Journal | Vanta Hollow',
      description: 'Explore the story, symbolism, and creation of The Marigold Keeper, a sugar skull artwork about remembrance, marigolds, forgotten souls, and guiding the dead home.',
    },
  },
  {
    entryNumber: 'Archive Entry 016',
    title: 'The Final Rescue',
    slug: 'the-final-rescue',
    artworkImage: '/images/journal/the-final-rescue/the-final-rescue.png',
    framedMockup: '/images/journal/the-final-rescue/the-final-rescue-framed.png',
    publishedDate: 'September 25, 2026',
    category: 'Dark Fairytales',
    collection: 'Dark Fairytales',
    keywords: ['final rescue', 'twisted rapunzel', 'dark fairytale', 'gothic fairytale', 'haunted tower', 'evil princess', 'cursed braid', 'black roses', 'knight trap', 'fairytale horror'],
    relatedArticles: ['the-crimson-queen', 'the-last-oath'],
    excerpt: 'The promise of a rescued princess draws knights toward a braid woven with roses, chains, and crowns. Each rescuer becomes part of the path awaiting the next offering, while the princess watches from above.',
    behindTheCreation: `The Final Rescue turns the familiar Rapunzel promise into the mechanism of a trap. The princess stands high within the tower, while her enormous black braid travels down through the composition toward the armored figure below. What appears to offer access is already holding the consequences of earlier attempts.

Her elevated position gives her command of the scene. The story makes that relationship explicit: she is not the prisoner, and the knights answering the promise are offerings rather than rescuers who might succeed.`,
    creativeProcess: `The braid provides the composition's main route, carrying the eye from the princess across the stone steps and into the foreground. Its loops spread beyond a single vertical strand, filling the tower with a dense network of hair, roses, and metal ornaments.

Cold moonlight defines the arches and dark stone. Deep red flowers and clothing, together with gold crowns and chains, introduce smaller warm accents. Those details make the braid enticing enough to inspect even as its weight and reach become threatening.`,
    symbolism: `The braid turns the expected instrument of rescue into the means of capture. Its growing thickness carries the story's central reversal: the rescuers become part of the path prepared for whoever follows.

Crowns and roses transform apparent decoration into evidence of offerings. The tower's height supports the promise that a hero must climb, but the princess's freedom means that reaching her was never the same as saving her.`,
    hiddenDetails: `Crowns sit among the dark coils rather than on the heads of victorious rescuers. Gold chains and rose stems follow the braid's curves, making the ornaments and the means of restraint visually difficult to separate.

An armored figure lies beneath the hair in the foreground while the princess remains above. That difference in position makes the story's power relationship visible without requiring another event or an explanation that excuses her role in the trap.`,
    collectorNotes: `The Final Rescue belongs to Dark Fairytales. Its moonlit tower, elaborate black braid, roses, and fallen knight appeal to collectors drawn to gothic storybook imagery whose familiar promise has turned hostile.

The Final Rescue captures the moment chivalry becomes bait—when the princess is not the prisoner, the tower is not the cage, and the path to saving her is the trap itself.

Not every princess is waiting to be saved. Some are waiting for the next hero to climb.`,
    closingArchive: 'By dawn another crown has joined the roses, and the princess is waiting for the next kingdom to hear her song. The archive closes on the repeated offering, with the braid holding those who climbed before and preparing the path for the next arrival.',
    story: `Every kingdom knew the promise:

Climb the tower.
Free the princess.
Win her hand.

At moonrise, she appeared beneath the highest arch and lowered a braid black as mourning cloth. Roses, gold chains, and tiny crowns had been woven between its strands.

The first knight climbed for glory.

The second climbed for love.

The third came searching for the first two.

No one questioned why the braid grew thicker each year.

Each rescuer took hold, believing the weight beneath him was hair swaying against the tower. It was not.

Her braid remembered every hand that touched it.

It tightened around gauntlets, slipped beneath armor, bound sword arms, and dragged each knight against the stone until the tower fell silent again. Their crowns became ornaments. Their weapons disappeared beneath the coils. Their bodies became part of the path prepared for whoever answered next.

She had never called for rescue.

She had called for another offering.

By dawn, a new crown had been woven among the roses, and the princess was already waiting for the next kingdom to hear her song.`,
    featuredDescription: 'A dark fairytale artwork about a princess who was never waiting to be saved, where rescue becomes ritual and the tower becomes a trap.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4546024128',
    seo: {
      title: 'The Final Rescue | The Hollow Journal | Vanta Hollow',
      description: 'Explore the story, symbolism, and creation of The Final Rescue, a twisted dark fairytale artwork where Rapunzel\'s braid becomes the trap and rescue becomes sacrifice.',
    },
  },
  {
    entryNumber: 'Archive Entry 017',
    title: 'The Last Oath',
    slug: 'the-last-oath',
    artworkImage: '/images/journal/the-last-oath/the-last-oath.png',
    framedMockup: '/images/journal/the-last-oath/the-last-oath-framed.png',
    publishedDate: 'September 25, 2026',
    category: 'Dark Fantasy',
    collection: 'Dark Fantasy',
    keywords: ['last oath', 'dark fantasy knight', 'gothic knight', 'ruined cathedral', 'blue fire', 'fallen kingdom', 'oath', 'remembrance', 'judgment', 'crimson banners'],
    relatedArticles: ['the-final-judgment', 'the-black-saint'],
    excerpt: 'A lone knight kneels in a ruined cathedral to speak the names his kingdom tried to erase. Blue fire answers as an oath is remembered, binding his loyalty to the fallen rather than the crown.',
    behindTheCreation: `The Last Oath centers on a posture that can be misread. The knight's bowed head and hands gathered over the sword suggest stillness, but the story identifies his kneeling as judgment. He has returned to bear witness to those abandoned by the crown.

The cathedral gives that private act a public scale. Crimson banners hang beside the armored figure, keeping the symbols of royal loyalty in view while the blue fire answers a different allegiance: remembrance of the dead.`,
    creativeProcess: `The sword establishes a firm vertical axis through the center of the image. The knight's hands, helmet, and kneeling body gather around it, while the cathedral's repeated arches reinforce the composition's solemn balance.

Blue light travels along the blade and through the dark armor, reaching the stone at his feet. Red banners and low red light at the sides set a warmer boundary around that central glow. The contrast makes the remembered oath the visual focus without turning it into an unexplained display of power.`,
    symbolism: `The kneeling records judgment rather than prayer or surrender. Speaking the dead by name answers the kingdom's attempt to erase them, and the sword he once swore never to raise against the throne becomes the center of that witness.

The blue fire is an oath being remembered. Its movement through stone, blade, and armor connects the knight to the names he speaks. When the dead answer him, loyalty has already shifted from the failed crown to the people it betrayed.`,
    hiddenDetails: `Blue veins of light remain visible between the dark plates across the shoulders and around the planted blade. They draw attention through the armor toward the floor, reflecting the story's sequence of fire rising through the cracks and entering the knight.

The crimson banners frame rather than cover the central figure. Their ornamental designs remain part of the fallen kingdom's setting; no new ruler or separate heraldic history is needed to explain their presence. The bowed helmet conceals his expression while his posture carries the judgment.`,
    collectorNotes: `The Last Oath belongs to Dark Fantasy. Its armored knight, ruined cathedral, crimson banners, and concentrated blue light suit collectors drawn to solemn martial imagery and loyalty tested by a kingdom's failure.

The scene holds the moment before an outcome is known. The invaders mistake the lone knight for a defeated remnant, but the narrative ends with the dead answering him rather than describing a new battle or declaring its result.

The Last Oath captures the moment loyalty is severed from a crown and bound instead to the fallen—when devotion becomes vengeance, and remembrance becomes the last power left standing when kingdoms fail.

Some oaths die with kings. His survived the kingdom.`,
    closingArchive: 'He lifts his head, the light beneath the blade burns brighter, and the dead answer behind him. The archive ends with the oath remembered and the broken promises returned in steel. What follows is left beyond the story\'s final moment.',
    story: `They mistook the kneeling for prayer.

It was judgment.

The cathedral had outlived the kingdom that betrayed it. Its throne stood empty. Its bells had fallen silent. Only the crimson banners remained, hanging above the place where kings once demanded loyalty and called it honor.

On the night the crown abandoned its people, one knight returned alone.

He carried the sword he had sworn never to raise against the throne. At the center of the ruined hall, he drove its tip into the stone and bowed his head—not in surrender, but in witness. One by one, he spoke the names of the dead the kingdom had spent years trying to erase.

With each name, blue fire answered.

It rose through the cracks in the floor. It climbed the blade. It entered the armor. What looked like lightning was not power being summoned.

It was an oath being remembered.

When invaders finally crossed the cathedral gates, they found only a lone knight kneeling before his sword. They laughed, believing they had discovered the last defender of a fallen kingdom.

Then he lifted his head.

The light beneath the blade burned brighter. The dead answered behind him. And every oath broken by the living came back sharpened in steel.`,
    featuredDescription: 'A dark fantasy knight artwork about a lone vow that survives a fallen kingdom, where remembrance answers in blue fire and broken loyalty becomes judgment.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4547257612',
    seo: {
      title: 'The Last Oath | The Hollow Journal | Vanta Hollow',
      description: 'Explore the story, symbolism, and creation of The Last Oath, a dark fantasy knight artwork about loyalty, remembrance, blue fire, and judgment after a kingdom\'s fall.',
    },
  },
];

const archiveFilters = ['All', 'Dark Fantasy', 'Horror', 'Sugar Skulls', 'Dark Fairytales', 'Creepy Clowns', 'Demons', 'Newest', 'Oldest'];

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
    <Analytics />
  </React.StrictMode>,
);
