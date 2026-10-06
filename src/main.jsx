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
    name: 'Angel & Demon Art',
    label: 'Angel & Demon Art',
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
    title: '150+ Unique Designs',
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
    category: 'Angels & Demons',
    collection: 'Angel & Demon Art',
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
    collectorNotes: `The Black Saint stands as an independent Angels & Demons story within Vanta Hollow.

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
    category: 'Angels & Demons',
    collection: 'Angel & Demon Art',
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
    category: 'Angels & Demons',
    collection: 'Angel & Demon Art',
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
    collectorNotes: `When Hell Answered belongs to the Angel & Demon Art collection. Its black and crimson palette, horned silhouette, cathedral spires, and occult circle bring the narrative into a single imposing scene.

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
  {
    entryNumber: 'Archive Entry 018',
    title: 'The Moonbound Warden',
    slug: 'the-moonbound-warden',
    artworkImage: '/images/journal/the-moonbound-warden/the-moonbound-warden.png',
    framedMockup: '/images/journal/the-moonbound-warden/the-moonbound-warden-framed.png',
    publishedDate: 'September 26, 2026',
    category: 'Dark Fantasy',
    collection: 'Dark Fantasy',
    keywords: ['moonbound warden', 'dark fantasy warrior', 'spectral wolf', 'Blackwood', 'gothic knight', 'blue fire', 'red sword', 'raven', 'full moon', 'ancient oath', 'dark forest'],
    relatedArticles: ['the-last-oath', 'the-thirteenth-saint'],
    excerpt: 'In Blackwood, a lone Warden discovers that the spectral wolf beside him carries generations of guardians who never returned. With no kingdom left to command him, he must decide whom the ancient oath still protects.',
    story: `For more than a century, the northern road ended at the edge of Blackwood. There was no gate, no wall, and no army standing watch. Travelers simply knew that when the full moon climbed above the dead branches, they were to turn back. Somewhere beyond the tree line, an unseen bell would sound once through the valley, and a tradition older than the surviving kingdoms would begin. One warrior carrying a black blade would enter the forest before midnight. By sunrise, the warrior would be gone. Only a raven ever returned.

When the last Warden was chosen, the kingdom that had created the oath no longer existed. Its castles were ruins, its bloodline forgotten, and no living ruler possessed the authority to command him into Blackwood. Still, he fastened the old armor around his body and took up the sword that had passed from Warden to Warden. Its steel was almost black, except for a thin crimson channel running through the blade. According to the oldest surviving warning, the weapon would burn red whenever something belonging to the darkness drew near.

The sword began glowing before he had traveled a mile.

He continued beneath the moon until the forest became unnaturally silent. Wind disappeared from the branches. Insects stopped moving beneath the leaves. Even his own footsteps seemed swallowed by the earth. Then blue light spread between the trees behind him, faint at first, until the darkness filled with the outline of something enormous.

A wolf stepped from the forest.

It towered above him, far larger than any living animal, its body formed from black fur, blue fire, and currents of spectral light that moved beneath its skin like lightning trapped under ice. Its eyes glowed with the same impossible blue. The Warden raised his sword, but the creature did not attack. It simply turned toward the deepest part of Blackwood and began walking.

He remembered a line from the oath his father had taught him as a child: When the wolf appears, follow.

So he followed.

The spectral beast led him past crumbling watchtowers buried in roots, stone roads that had vanished from every map, and the remnants of an ancient city the forest had consumed. A raven appeared overhead and moved with them from branch to branch. As they traveled, the Warden noticed something that troubled him more than the ruins. The wolf rarely looked toward the path ahead. Instead, it kept watching him.

Every time his sword burned brighter, the blue fire around the creature intensified.

At the heart of Blackwood they reached a weathered boundary stone standing alone beneath the moon. Hundreds of names had been carved across its surface. The Warden recognized several of them immediately—the men whose portraits still hung inside the abandoned Hall of Guardians. But there were far more names than the histories recorded. Some were so old that the letters belonged to languages no scholar living could read.

Beneath the final row of names, thick moss concealed an inscription.

The Warden scraped it away.

The oath had been remembered incorrectly.

The wolf had never been sent to guide the Wardens through Blackwood. It was made from the Wardens who had never returned.

Every guardian who crossed the boundary had surrendered something of himself to maintain the seal beneath the forest: courage, memory, rage, loyalty, fear, and eventually life itself. Generation after generation, those remnants gathered until they became powerful enough to take form. The enormous creature standing beside him was not one spirit.

It was hundreds.

The raven descended onto the boundary stone.

Only then did the Warden understand why the bird always returned when the warrior did not. It had never been carrying news of another death back to the kingdom.

It had been searching for the next name.

The ground trembled beneath his boots.

His sword erupted crimson.

Something ancient moved below Blackwood, pressing against a barrier that had weakened with every forgotten year. The forest shook as the thing beneath it pushed upward, and the spectral wolf stepped between the Warden and the darkness. Blue fire poured from its body, illuminating the faces of ruined statues and the names carved into the stone.

Nothing prevented him from leaving. The kingdom that demanded his sacrifice was dust. No king could condemn him. No witness would know whether he had honored the oath or abandoned it.

He looked again at the hundreds of names.

Then he understood what the oath had truly meant.

They had not died protecting a kingdom.

They had died protecting whoever came after it.

The Warden closed his hand around the burning sword and stepped beside the wolf.

The raven spread its wings.

Deep beneath them, the darkness stopped rising.

By sunrise, the northern road was empty again. The Warden never returned from Blackwood.

But the next time the moon was full, travelers standing beyond the tree line swore that the blue wolf looked larger than before.

And beside its enormous shadow walked the faint outline of a man carrying a red sword.`,
    behindTheCreation: `The Moonbound Warden brings a solitary warrior into the company of a history he does not yet understand. The enormous wolf appears beside him as a powerful presence, but the story changes that presence from a guide into the accumulated remnants of earlier Wardens. Their shared position becomes the image of a duty carried across generations.

The man's face remains visible beneath the moon. His choice matters because no surviving ruler can demand it; the armor and sword belong to an inherited role, while the decision to stay is his own.`,
    creativeProcess: `The warrior anchors the foreground in dark armor, with the wolf rising above his shoulder in blue spectral light. Bare trunks enclose both figures, and the full moon gives the scene a high, cold point of illumination. The difference in scale makes the wolf feel greater than a single companion.

The thin crimson channel in the lowered sword cuts through the blue palette. Its red tip draws attention toward the ground, while the raven perched to the right balances that low point with a small, sharply defined silhouette.`,
    symbolism: `The wolf embodies what generations of guardians surrendered to the seal beneath Blackwood. Its size carries the weight of many lives, and its blue fire gathers their remnants into a form the last Warden can finally recognize.

The sword's red light warns of the darkness drawing near. The raven carries a different responsibility: it searches for the next name. Together they place danger, succession, and choice around a man who comes to understand that the oath protects whoever follows, not merely the kingdom that created it.`,
    hiddenDetails: `Blue light traces the wolf's outline and passes behind the warrior's dark shoulder, keeping the two figures distinct while binding them within the same glow. The wolf's bright eyes face outward, whereas the man's turned head gives him a separate direction of attention.

The raven is small beside the immense beast, yet its isolated perch makes it easy to find. The sword's narrow red channel remains visible within otherwise dark steel. These details support the story without requiring the boundary stone or its carved names to appear in the composition.`,
    collectorNotes: `The Moonbound Warden belongs to Dark Fantasy. Its full moon, black armor, spectral wolf, and restrained crimson blade offer a scene of guardianship whose emotional center is a voluntary choice. The related entries invite comparisons in duty and sacrifice without making their characters part of Blackwood's history.

The Moonbound Warden captures the moment duty becomes something greater than obedience—a lone warrior discovering that the spectral beast beside him carries generations of guardians who made the same impossible choice beneath the same moon.`,
    closingArchive: 'The northern road is empty by sunrise, and the Warden does not return. At the next full moon, travelers see a larger blue wolf and the faint outline of a man carrying a red sword beside it. The archive closes with that enduring presence: another guardian has chosen those who will come after him.',
    featuredDescription: 'A moonlit dark fantasy artwork about a lone Warden, a spectral wolf, and an oath that survives the kingdom that created it.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4559101475',
    seo: {
      title: 'The Moonbound Warden | The Hollow Journal | Vanta Hollow',
      description: 'Explore the story and symbolism of The Moonbound Warden, a dark fantasy warrior who discovers the spectral wolf of Blackwood carries generations of fallen guardians.',
    },
  },
  {
    entryNumber: 'Archive Entry 019',
    title: 'Kraken Of The Black Tide',
    slug: 'kraken-of-the-black-tide',
    artworkImage: '/images/journal/kraken-of-the-black-tide/kraken-of-the-black-tide.png',
    framedMockup: '/images/journal/kraken-of-the-black-tide/kraken-of-the-black-tide-framed.png',
    publishedDate: 'September 26, 2026',
    category: 'Dark Fantasy',
    collection: 'Dark Fantasy',
    keywords: ['kraken', 'black tide', 'sea monster', 'dark fantasy', 'gothic ship', 'haunted voyage', 'Graven Wake', 'Alaric Veyne', 'ocean horror', 'tentacles', 'maritime legend', 'Seal of Mourning'],
    relatedArticles: ['the-drowned-bride-of-saltmere', 'the-oath-between-worlds'],
    excerpt: 'Captain Alaric Veyne sails the Graven Wake into the Black Tide and discovers that the Kraken recognizes his ship. Beneath its black paint lies the Seal of Mourning, evidence of a royal offering that never reached its destination.',
    story: `For three hundred years, sailors crossing the northern passage marked one stretch of ocean with an empty circle.

No reef was drawn inside it. No island. No depth was recorded beneath it. Older charts carried only the words Black Tide along the circle's edge, written in the careful hand of men who had survived long enough to know that some warnings became less useful the more precisely they were explained.

Every captain knew the rule.

When the sea beneath the hull turned darker than the night around it, turn south. Extinguish every lantern. Do not ring the ship's bell. Do not answer voices heard beyond the rail.

And above all, do not continue toward the moon.

Captain Alaric Veyne had spent his life becoming the sort of man who considered warnings an insult.

His galleon, the Graven Wake, had crossed frozen straits, outrun privateers, survived cannon fire, and returned from storms that had reduced neighboring vessels to timber. Its hull was black oak. Its sails carried the silver mark of a drowned crown. Its crew had followed Veyne through enough impossible voyages that superstition had slowly become something they believed happened only to other men.

So when the lookout reported that the water had turned black, Veyne ordered the ship forward.

The wind died first.

The sails remained swollen as though caught in a gale, yet no air moved across the deck. Ropes hung motionless. The sea continued to rise and fall beneath the ship, but the waves no longer made a sound against the hull.

Then every compass aboard the Graven Wake turned downward.

The helmsman abandoned his post.

Veyne called him a coward and took the wheel himself.

That was when the moon emerged.

Cold light spilled between the storm clouds, painting a silver road across the black water directly ahead of them. At the end of that road something moved beneath the surface, so enormous that the swell reached the ship several seconds before the shape itself became visible.

One of the sailors whispered a prayer.

Another whispered a name.

Kraken.

The first tentacle rose without a splash.

It unfolded beside the ship like a tower emerging from the sea, its surface black beneath the moon, rows of immense suckers opening and closing against the night. A second appeared beyond the stern. Then a third curled ahead of the bow.

Men reached for weapons.

Veyne ordered them lowered.

For one impossible moment, nothing attacked.

The tentacles simply remained there, surrounding the Graven Wake as though the ship had sailed unknowingly into the center of a closing hand.

Then the ocean behind the galleon began to rise.

At first the crew mistook it for a wave.

The wave opened an eye.

A pale blue light burned within it.

The creature lifted higher.

Water poured from a head larger than the ship's entire deck. Tentacles emerged in every direction, arching through the storm until their tips disappeared beyond the rigging. The moon shone behind the beast, and the Graven Wake became little more than a black silhouette beneath something ancient enough to make a three-masted galleon look like driftwood.

Veyne had imagined monsters before.

He had imagined teeth.

He had imagined rage.

What terrified him was the patience in the creature's eye.

The Kraken was not angry.

It recognized them.

A low vibration passed through the hull.

The sailors felt it through their boots before they heard the wood begin to groan.

Then a symbol hidden beneath generations of black paint emerged across the bow.

The pressure of the Kraken's tentacle had cracked the outer layers of lacquer, revealing an older carving beneath them: a crowned sea beast encircling a sinking vessel.

Veyne stared at it.

His father had purchased the Graven Wake thirty-seven years earlier from an estate whose previous owner had vanished at sea. The ship had been renamed, rebuilt, and stripped of every emblem connected to its former master.

Almost every emblem.

The ship's carpenter stumbled toward the bow and dropped to his knees.

He knew the mark.

The oldest maritime records called it the Seal of Mourning, burned into vessels once belonging to the kings of a drowned coastal empire. According to the stories, their fleet had not been destroyed by enemy ships.

It had been offered.

One vessel from every generation was sent north carrying gold, prisoners, and the blood of the royal family. In return, the thing beneath the Black Tide left the kingdom's shores untouched.

The offerings ended when the kingdom fell.

But the final ship had never arrived.

Veyne slowly looked up at the creature towering behind them.

The Graven Wake had not wandered into the Kraken's hunting ground.

It had finally returned to where it was supposed to die.

A tentacle tightened around the stern.

The deck tilted.

Cannons tore loose below and smashed through their restraints. Sailors clung to ropes and railings as the bow climbed above the waves. Another tentacle wrapped beneath the hull, lifting the ship until seawater poured from its timbers.

Veyne drew his sword.

There was nothing else left for a man like him to do.

He climbed onto the bow while the Kraken's enormous eye followed him.

Thirty years of victories had taught him that every enemy possessed a moment of hesitation. Every fortress had a weak wall. Every creature had a place where steel could enter.

He looked into that cold blue eye and understood, finally, that none of those lessons belonged here.

The Kraken did not hesitate because the Kraken did not fear him.

Veyne lowered the sword.

Around him, the Black Tide rose.

The creature's tentacles closed until the ship disappeared inside their enormous arcs. The moonlight narrowed to a handful of silver fractures between them. The crew stopped screaming. Perhaps they understood. Perhaps there was simply nothing left to say.

The final thing Veyne saw was the illuminated eye beyond the mast.

Not cruel.

Not triumphant.

Waiting.

Then the Kraken pulled the Graven Wake beneath the sea.

At sunrise, another vessel crossed the northern passage.

Its captain found calm water beneath an empty sky.

No wreckage drifted there. No bodies. No broken mast or torn sail.

Only a single piece of black-painted timber floated across the surface.

Beneath the peeling paint was the carving of a crowned sea beast.

The captain ordered his ship south before anyone could pull it aboard.`,
    behindTheCreation: `Kraken Of The Black Tide sets human confidence against an older patience. The elaborate galleon appears formidable until the creature behind it changes the scale of everything on the water. What Veyne reads as a challenge becomes the fulfillment of a debt he did not know his vessel carried.

The Kraken's illuminated eye gives the encounter an unsettling focus. Its attention is directed rather than chaotic, supporting the story's distinction between an enraged monster and a creature recognizing the ship it has been waiting for.`,
    creativeProcess: `Sweeping tentacles surround the ship with large, curved forms, while masts, rigging, and gothic ornament crowd the center with finer lines. The vessel remains detailed enough to command attention even as the creature dwarfs it.

Cold moonlight and pale blue highlights connect the eye, windows, and turbulent water. Almost-black sails and hull hold the ship together as a silhouette against the storm. The palette makes the scene feel submerged in the same cold darkness before the final descent occurs.`,
    symbolism: `The Black Tide is the warned-against stretch of sea; the Seal of Mourning is the mark linking the vessel to the drowned empire's offerings. Their meanings meet when cracked paint exposes the carving and the Graven Wake's journey becomes a return.

The Kraken's patience overturns Veyne's understanding of strength. His sword offers no meaningful advantage over a creature that does not fear him. The ship's altered name and rebuilt surfaces cannot cancel the obligation beneath them.`,
    hiddenDetails: `Rows of suckers remain visible along the tentacles as their curves pass around the rigging. Those repeated forms make the creature's scale legible against the ship's windows, rails, and masts.

Pale ornament appears across the dark sails, and blue lights punctuate the hull. These visible decorations should not be confused with the Seal of Mourning described beneath the bow's paint. The story establishes that specific carving and its history; the surrounding details build the vessel's gothic character.`,
    collectorNotes: `Kraken Of The Black Tide belongs to Dark Fantasy. Its maritime scale, ornate ship, and watchful sea creature appeal to collectors drawn to ocean dread and forgotten obligations. The related ocean and oath stories share themes rather than a single empire, covenant, or mythology.

Kraken Of The Black Tide captures the final instant before the Graven Wake is reclaimed—a towering sea monster, a doomed gothic vessel, and the terrible realization that the ocean has remembered a debt mankind forgot.`,
    closingArchive: 'The Kraken draws the Graven Wake beneath the sea. By sunrise, only a piece of black-painted timber remains, bearing the crowned sea beast beneath its peeling surface. The next captain turns south before it can be brought aboard, leaving Veyne\'s ending intact and the old warning newly understood.',
    featuredDescription: 'A gothic maritime fantasy artwork about an ancient Kraken reclaiming a vessel whose debt to the Black Tide was never fulfilled.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4560958945',
    seo: {
      title: 'Kraken Of The Black Tide | The Hollow Journal | Vanta Hollow',
      description: 'Explore Kraken Of The Black Tide, a dark fantasy sea monster story about a doomed galleon, a forgotten royal debt, and the ancient creature waiting beneath the sea.',
    },
  },
  {
    entryNumber: 'Archive Entry 020',
    title: 'The Oath Between Worlds',
    slug: 'the-oath-between-worlds',
    artworkImage: '/images/journal/the-oath-between-worlds/the-oath-between-worlds.png',
    framedMockup: '/images/journal/the-oath-between-worlds/the-oath-between-worlds-framed.png',
    publishedDate: 'September 26, 2026',
    category: 'Dark Fantasy',
    collection: 'Dark Fantasy',
    keywords: ['oath between worlds', 'gothic romance', 'dark romance', 'gothic couple', 'Queen Elara', 'King Avar', 'Caer Vey', 'enchanted mirror', 'northern breach', 'dark fantasy', 'royal sacrifice'],
    relatedArticles: ['the-last-oath', 'the-widows-bloom'],
    excerpt: 'Queen Elara finds King Avar holding the northern breach from beyond a mirror. When its final lock is damaged, the rulers divide the sacrifice between them, surrendering their remaining lives to protect Caer Vey and their son.',
    story: `Queen Elara buried an empty coffin beneath a sky without stars.

King Avar’s body had never returned from the northern breach. His soldiers came home frostbitten and silent, carrying only his crown inside a black wooden box. They said the king had remained behind when the dead broke through the veil, buying them enough time to close the passage.

No one could tell Elara exactly how he died.

By dawn after the funeral, every bell in Caer Vey had cracked.

The river froze beneath midsummer sunlight. Frost appeared along the palace corridors. Most troubling of all, the mirrors turned black. They no longer reflected the people standing before them. They showed empty rooms instead, as though the palace already belonged to a world without the living.

The court called it grief made manifest.

Elara knew better.

Avar had once told her what lay beyond the northern breach. It was not an afterlife meant for human souls. It was an older country—lightless, endless, and crowded with things that had spent centuries searching for a road into the living world.

His final oath had been simple.

If the gate failed, he would become the gate.

For seven years, Elara ruled without him.

Then, on the seventh anniversary of his death, the tallest mirror in the throne hall filled with blue light.

Avar stood on the other side.

His armor had lost every trace of warmth. Frost covered the crown upon his head, and the world behind him stretched beneath a colorless sky. He could hear Elara, but no voice of his own could cross the glass.

He raised one hand.

Elara placed hers against it.

For a single heartbeat, warmth passed through the mirror.

Then midnight ended, and he disappeared.

He returned the next night.

And the next.

They were given one minute each midnight.

Elara told him about the kingdom he had saved. She told him which orchard survived the killing frost, which ministers had remained loyal, and which had begun measuring the throne for themselves. She told him their son had grown tall enough to wear Avar’s first sword.

She did not tell him that the boy still left an empty chair beside the fire.

Avar answered without words.

When he pressed his hand against the mirror, visions moved through the glass: ruined cities beneath black snow, armies of the dead gathering beyond distant towers, and a dark tide pressing endlessly against a narrow wall of blue light.

Only then did Elara understand.

Her husband was not trapped beyond the mirror.

He was holding something there.

The court eventually discovered the midnight meetings.

Chancellor Morcant called the apparition a deception. He claimed some creature had stolen the dead king’s face and was using the queen’s grief to gain entry into Caer Vey.

Elara forbade anyone from touching the mirror.

Morcant returned the following night with soldiers, priests, and a hammer forged from white iron.

Avar appeared at midnight.

Elara barely had time to raise her hand before Morcant struck the frame.

The mirror cracked.

Cold exploded through the throne hall.

Every torch went out.

Through the fracture, Elara heard thousands of voices inhale at once.

Behind Avar, the dead began to move.

Morcant lifted the hammer again.

Elara drew her sword, but Avar slammed both palms against the glass.

A vision struck her.

She saw the truth he had hidden for seven years.

The mirror was the final lock on the northern breach. Avar had bound his own spirit into it when the gate failed. Break the mirror, and he would return to the living world.

For one hour.

Until sunrise, Elara could have her husband back.

Their son could hear his father’s voice.

The kingdom could kneel before its king again.

Then the breach would open completely.

And there would be no kingdom left by nightfall.

Morcant raised the hammer.

Elara lowered her sword.

She removed her crown.

Its oldest point had been shaped from the same gold used in the coronation crowns of Caer Vey’s first rulers. Elara pressed it into her palm until blood ran between her fingers.

Then she placed her hand against the fracture.

Gold spread through the broken glass.

The dead screamed.

The mirror demanded royal blood to restore the boundary, but the ancient oath had never said the sacrifice must belong to only one ruler.

Avar understood before she did.

He struck the glass from the other side, begging her to stop.

Elara kept her hand in place.

The spell divided what remained of their lives.

From that night forward, Elara would slowly fade from the living world as Avar became more solid within it. One heartbeat exchanged for another. One year surrendered for one year restored. Neither would ever fully cross.

Until the final midnight.

On that night, the last piece of Elara would enter the mirror as the last piece of Avar left it.

For one breath, they would meet at the center.

Then both would become part of the seal.

The kingdom would survive.

Their son would live.

And the road between worlds would close behind them forever.`,
    behindTheCreation: `The Oath Between Worlds makes separation visible at the point where two hands almost meet. Elara and Avar face one another across a narrow boundary, close enough for recognition but unable to turn that closeness into an ordinary reunion. Their relationship carries the scene before the larger cost of their decision is understood.

The artwork holds the moment after they have chosen to share the sacrifice. Neither has fully crossed. Their certainty concerns where they will meet at the final midnight, not a promise that they can return to life together.`,
    creativeProcess: `The tall pointed mirror divides the square into two facing portraits. Its vertical frame remains firm between the rulers while their raised hands establish a smaller center of attention within it. Repeated arches extend that structure into the surrounding architecture.

Elara retains warm skin and gold accents against the dark setting, while Avar appears within cold blue light. The brightest glow gathers around their palms, allowing an intimate gesture to carry the visual weight of the boundary between worlds.`,
    symbolism: `The mirror is the final lock on the northern breach, not a passage to a conventional afterlife. Avar's oath binds him into that lock, and breaking it would briefly restore him at the cost of the kingdom he protected.

Elara's royal blood repairs the fracture by dividing the sacrifice. The crowns therefore signify responsibility as well as marriage and rule. Their hands reach across a cost they now share: each exchange brings them toward the final breath together before both become part of the seal.`,
    hiddenDetails: `Fine blue lines spread through the mirror around the meeting point of the hands. The frame remains visible between the two figures, preserving the separation even where the light appears most intense.

The contrast between Elara's gold-trimmed armor and Avar's cold, luminous outline distinguishes their positions without making either a distant abstraction. Both crowns and both faces remain readable, keeping the scene focused on two particular people rather than an anonymous apparition.`,
    collectorNotes: `The Oath Between Worlds belongs to Dark Fantasy and explores gothic romance through a shared responsibility. Its appeal rests in the closeness of the portraits and the cost of the gesture between them. Connections to other Journal entries concern devotion and remembrance; they do not extend the history of Caer Vey into those stories.

The artwork captures the moment after their choice, when Elara and Avar raise their hands toward one another again. The glass still separates them. Their palms almost meet. Neither is reaching for rescue anymore.

They are reaching because, for the first time in seven years, they know exactly where the other will be waiting.`,
    closingArchive: 'Elara and Avar continue to reach toward one another through the glass. Their last meeting remains ahead: one breath at the center on the final midnight, followed by their place together within the seal. The archive preserves that future sacrifice, the kingdom\'s survival, and their living son without turning the ending into a reunion already completed.',
    featuredDescription: 'A gothic dark romance artwork about two rulers separated by a mirror, whose final oath protects their kingdom at the cost of their remaining lives.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4562775661',
    seo: {
      title: 'The Oath Between Worlds | The Hollow Journal | Vanta Hollow',
      description: 'Explore The Oath Between Worlds, a gothic dark romance about Queen Elara, King Avar, and the sacrifice that holds the boundary between life and death.',
    },
  },
  {
    entryNumber: 'Archive Entry 021',
    title: 'The Drowned Bride of Saltmere',
    slug: 'the-drowned-bride-of-saltmere',
    artworkImage: '/images/journal/the-drowned-bride-of-saltmere/the-drowned-bride-of-saltmere.png',
    framedMockup: '/images/journal/the-drowned-bride-of-saltmere/the-drowned-bride-of-saltmere-framed.png',
    publishedDate: 'September 26, 2026',
    category: 'Dark Fantasy',
    collection: 'Dark Fantasy',
    keywords: ['drowned bride', 'Saltmere', 'gothic mermaid', 'dark siren', 'sea queen', 'gothic romance', 'dark ocean', 'underwater cathedral', 'royal covenant', 'blackened silver', 'dark fantasy', 'Maris'],
    relatedArticles: ['kraken-of-the-black-tide', 'the-oath-between-worlds'],
    excerpt: 'Crowned beneath Saltmere\'s drowned cathedral, Maris recognizes Orsen\'s last descendant aboard a passing ship. But the vessel carries refugees, leaving her suspended between fulfilling the covenant and the threatened loss of Saltmere itself.',
    story: `Saltmere’s cathedral was built where the cliffs disappeared into the sea, and for generations its kings descended beneath the sanctuary each winter to renew an ancient covenant. The sea would spare the kingdom from famine, storm, and shipwreck so long as the royal bloodline never refused the bride it was owed.

For three hundred years, no one questioned the promise.

Then King Orsen declared the covenant a superstition invented by frightened ancestors. He sealed the flooded crypt, melted down the ceremonial crown, and ordered every record of the offering burned. Before the month ended, the fishing boats stopped returning. Merchant vessels vanished beyond the harbor lights. By winter, the granaries were nearly empty.

Only then did the king remember that the sea had never asked for gold.

It had asked for blood.

His youngest daughter, Maris, was chosen before dawn. The court dressed her in black instead of white because no one intended to pretend she was walking toward a marriage. They placed a newly forged crown upon her head and led her through the cathedral as the tide rose over the steps. Maris never begged her father to spare her. She looked at him only once, then continued into the water alone.

She awakened beneath the cathedral after the bells had gone silent.

The altar remained. The arches remained. But the city above had disappeared behind a ceiling of dark water, her bridal veil drifted endlessly around her, and where her legs had been was a long armored tail of blackened silver. The sea had not accepted Maris as a sacrifice.

It had crowned her.

From that night forward, every vessel carrying the blood of King Orsen heard her song before it reached the horizon. Some turned back. The others descended through the black water and settled among the ruins surrounding her cathedral.

A century passed before another royal ship appeared.

Maris watched it cross the surface far above her, framed in the pale light pouring through the broken roof. She could already feel the bloodline aboard it. The last descendant of the king who condemned her was finally returning to Saltmere.

But the ship was not carrying an army.

It was carrying refugees.

If Maris sang, the covenant would be fulfilled and the final heir of Orsen would join the drowned beneath her cathedral. If she remained silent, the ancient debt would be broken—and the sea had promised that Saltmere itself would be taken in payment.

For the first time in a hundred years, the Drowned Bride did not know which fate was crueler.`,
    behindTheCreation: `The Drowned Bride of Saltmere places a terrible decision inside a quiet image. Maris sits beneath the ruined arches while a ship passes high overhead, its small silhouette carrying consequences far greater than its size in the composition. Her stillness leaves room for the uncertainty the story refuses to resolve.

The crown and armored tail establish the transformation from condemned daughter to siren. The sea has crowned her, but that position has not removed the cruelty of the covenant or made the final choice simple.`,
    creativeProcess: `The cathedral arch frames a vertical relationship between the ship near the surface and Maris below. Pale shafts of light descend toward her crown, while her long tail curves across the lower part of the square. The composition connects the two levels without closing the distance between them.

Blue-green water and deep stone shadows surround the black bridal clothing. Small silver highlights describe the tail's overlapping armor, keeping its texture legible while the drifting dark strands around her soften the boundary between figure and water.`,
    symbolism: `Maris's crown marks the sea's response to the offering: she becomes its crowned presence rather than merely disappearing as a sacrifice. Her blackened-silver tail gives that changed existence a physical form beneath the cathedral.

The overhead ship carries both the last descendant of Orsen and refugees who complicate the demanded payment. Singing would fulfill the covenant; silence would break the debt and expose Saltmere to the sea's promised claim. Neither action can be presented as a decision she has already made.`,
    hiddenDetails: `The ship is visible through the light above the broken cathedral, separated from Maris by a wide column of water. Its distance makes her awareness of the bloodline a matter of the established story rather than something the viewer can read from figures aboard the vessel.

Her hands rest across the dark silver scales, and the tail's curve leads toward its broad fin below the altar. The repeating arches remain visible behind her, holding the bridal and royal imagery within the same submerged sanctuary.`,
    collectorNotes: `The Drowned Bride of Saltmere belongs to Dark Fantasy. Its crowned siren, underwater cathedral, and restrained ocean palette offer gothic beauty without resolving the moral tension at the center of the work. Its related entries make thematic comparisons in royal debts and sacrifice; their separate covenants do not become Saltmere's history.

The Drowned Bride of Saltmere captures that suspended moment beneath the sea: a crowned siren surrounded by the ruins of an old promise while the ship carrying her final choice passes overhead.`,
    closingArchive: 'The refugee ship passes above the cathedral with Orsen\'s last descendant aboard. Maris remains between song and silence, aware of what either could cost. The archive ends at that suspended choice, without saving or sinking the vessel and without declaring which fate she accepts.',
    featuredDescription: 'A gothic ocean fantasy artwork about a crowned siren confronting the final debt of the royal bloodline that condemned her.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4564068236',
    seo: {
      title: 'The Drowned Bride of Saltmere | The Hollow Journal | Vanta Hollow',
      description: 'Explore The Drowned Bride of Saltmere, a gothic dark fantasy tale of a crowned siren, a broken royal covenant, and a final choice beneath the sea.',
    },
  },
  {
    entryNumber: 'Archive Entry 022',
    title: 'The One Who Stayed',
    slug: 'the-one-who-stayed',
    artworkImage: '/images/journal/the-one-who-stayed/the-one-who-stayed.png',
    framedMockup: '/images/journal/the-one-who-stayed/the-one-who-stayed-framed.png',
    publishedDate: 'September 26, 2026',
    category: 'Creepy Clowns',
    collection: 'Creepy Clowns',
    keywords: ['one who stayed', 'creepy clown', 'abandoned carnival', 'horror clown', 'dark carnival', 'Ferris wheel', 'balloons', 'missing photographer', 'sinister clown', 'haunted circus'],
    relatedArticles: ['the-show-never-ends', 'the-guest'],
    excerpt: 'Balloons keep appearing in a carnival abandoned for years. A photographer enters to find their source and disappears, leaving a camera whose final frame shows the clown still waiting beneath the dead lights.',
    story: `The carnival had been empty for years, but the balloons kept appearing.

Nobody could explain who tied them there or why the Ferris wheel sometimes turned after midnight. The booths had collapsed, the midway had gone silent, and rainwater gathered in the broken pavement where crowds once stood shoulder to shoulder. Locals eventually stopped taking the road that passed behind the grounds. Some claimed they could still hear music drifting through the rusted gates. Others swore they had seen someone walking between the abandoned rides.

One night, a photographer slipped through the fence looking for proof.

He found the answer standing beneath the dead lights.

The costume was stained by years of neglect, the painted smile had cracked across a face that no longer seemed capable of changing expression, and above him floated a cluster of balloons that should have lost their air long ago. Behind the clown, the Ferris wheel began to move.

By morning, the photographer was gone. His camera was found lying in the mud near the entrance. The final frame showed the clown staring directly into the lens, smiling as though he had spent all those empty years waiting for someone to come back and watch the show.`,
    behindTheCreation: `The One Who Stayed finds horror in a performance continuing after its audience has gone. A male clown stands at the center of a ruined midway, with balloons overhead and the Ferris wheel behind him. The familiar signs of entertainment survive in a setting that no longer offers any welcome.

The figure's direct stare makes the viewer occupy the position of the camera. The short narrative needs no account of his origin: its force comes from someone going to look and leaving only an image behind.`,
    creativeProcess: `The narrow passage funnels attention toward the clown's full-length figure. Dark buildings form close edges on either side, while the Ferris wheel opens a larger shape behind his head and shoulders. The balloons gather above him, holding bright familiar forms within the decayed setting.

Dirty cream fabric, muted reds, and dull amber light keep the scene warmer than the Journal's moonlit fantasies. Wet-looking pavement catches that light below the figure, while shadow closes around his costume and the ruined booths.`,
    symbolism: `The balloons contradict the years of abandonment. They should have lost their air, yet their continued appearance suggests that the show has not ended for the figure beneath them. The Ferris wheel's movement after midnight deepens that contradiction without explaining its cause.

The camera becomes the story's surviving witness. Its final frame confirms the encounter while withholding the photographer's fate beyond his disappearance. The clown's smile leaves the sense of a waiting audience unresolved.`,
    hiddenDetails: `The costume's ruffled collar and red buttons remain recognizable beneath the stains and worn fabric. Cracks and dark marks interrupt the pale painted face, while the red nose holds a small, familiar point of color at its center.

Balloon strings descend into the space behind his shoulders, and the Ferris wheel's spokes remain visible beyond them. These repeated thin lines contrast with the heavy folds of the costume, tying the waiting performer to the abandoned attractions without adding an explanation for their persistence.`,
    collectorNotes: 'The One Who Stayed belongs to Creepy Clowns. Its direct portrait within an abandoned carnival appeals to collectors drawn to the uneasy survival of familiar entertainment imagery. The connection to The Show Never Ends is thematic: this story does not identify the same carnival or performer.',
    closingArchive: 'By morning the photographer is gone, and his camera lies in the mud near the entrance. The final photograph shows the clown looking into the lens. The archive leaves the disappearance unexplained, with the surviving image holding the expression of someone who has waited years for a viewer.',
    featuredDescription: 'A dark carnival horror artwork about an abandoned midway, a missing photographer, and the clown who never stopped waiting for an audience.',
    etsyUrl: 'https://vantahollow.etsy.com/listing/4565724958',
    seo: {
      title: 'The One Who Stayed | The Hollow Journal | Vanta Hollow',
      description: 'Explore The One Who Stayed, a creepy clown horror artwork about an abandoned carnival, impossible balloons, and the performer still waiting beneath the dead lights.',
    },
  },
  {
    entryNumber: 'Archive Entry 023',
    title: "The Exiled Seraph",
    slug: "the-exiled-seraph",
    artworkImage: "/images/journal/the-exiled-seraph/the-exiled-seraph.png",
    framedMockup: "/images/journal/the-exiled-seraph/the-exiled-seraph-framed.png",
    publishedDate: 'September 27, 2026',
    category: "Angels & Demons",
    collection: "Angel & Demon Art",
    keywords: ["exiled seraph","dark angel","fallen angel","black wings","blue light","gothic angel","angel warrior","celestial exile","dark fantasy"],
    relatedArticles: ["the-last-mercy","the-black-saint"],
    excerpt: "Cast out after refusing to abandon the people beyond the kingdom walls, the Seraph remains among the ruins with blackened wings and cold blue light beneath his armor.",
    story: "He was not cast from heaven in fire. He simply stopped returning.\r\n\r\nOnce, the Seraph stood at the edge of a kingdom that believed its walls were eternal. He guarded its gates through wars whose names were eventually forgotten, carrying neither crown nor banner, only an oath carved deeper than allegiance. When the final command came, he was ordered to abandon the people beyond the walls so the kingdom could save itself.\r\n\r\nHe refused.\r\n\r\nBy dawn, the gates were sealed behind him.\r\n\r\nThe battle lasted until the sky disappeared beneath smoke and the field went silent. When the surviving soldiers finally emerged, they found no army waiting for them. Only the Seraph remained, standing among the ruins with blackened wings spread across the storm and a strange blue light burning beneath his armor. The kingdom called him fallen because it was easier than admitting what he had done.\r\n\r\nHe never asked to return.\r\n\r\nNow he walks the places abandoned by kings, carrying the memory of every oath that mattered more than obedience. His wings bear no halo. His armor bears no crest. Yet somewhere beneath the blackened steel, the same cold light still burns—the last proof that exile and damnation were never the same thing.",
    behindTheCreation: "The Seraph stands alone among the battlefield ruins, his black wings spread wide around the armored figure. The blue light beneath the dark steel gives the center a restrained glow against the storm-dark scene.\n\nThe artwork holds its story at the point where his exile follows a refusal to abandon people in danger. The cold light and uncrested armor preserve his oath after the kingdom has closed its gates to him.",
    creativeProcess: "The wide wing silhouette holds the composition while the upright figure anchors its center. Keep the eye moving from the damaged armor to the blue light, then outward across the ruined landscape.\n\nThe lighting and palette reinforce this reading: The blue light beneath the dark steel gives the center a restrained glow against the storm-dark scene.",
    symbolism: "His exile follows a refusal to abandon people in danger. The cold light and uncrested armor preserve his oath after the kingdom has closed its gates to him.\n\nHe never asks to return. He keeps walking the places abandoned by kings, carrying the light and the oath that survived the sealed gates.",
    hiddenDetails: "The contrast between blackened feathers, dark armor, and the blue illumination makes the figure legible against the smoke. The wings carry the scale of the scene without turning him into a symbol of defeat.\n\nThese visual relationships support the supplied story without adding events beyond it.",
    collectorNotes: "The Exiled Seraph belongs to Angel & Demon Art. The Seraph stands alone among the battlefield ruins, his black wings spread wide around the armored figure. The blue light beneath the dark steel gives the center a restrained glow against the storm-dark scene.\n\nFor collectors drawn to dark angel, fallen angel, black wings, the work offers a focused image whose central choice or mystery remains faithful to its story.",
    closingArchive: "He never asks to return. He keeps walking the places abandoned by kings, carrying the light and the oath that survived the sealed gates.",
    featuredDescription: "Cast out after refusing to abandon the people beyond the kingdom walls, the Seraph remains among the ruins with blackened wings and cold blue light beneath his armor.",
    etsyUrl: "https://vantahollow.etsy.com/listing/4565826750",
    seo: {
      title: "The Exiled Seraph | The Hollow Journal | Vanta Hollow",
      description: "Explore The Exiled Seraph, a dark angel artwork about a guardian who refuses to abandon his people and carries an oath beyond exile.",
    },
  },
  {
    entryNumber: 'Archive Entry 024',
    title: "Blackthorn Hall",
    slug: "blackthorn-hall",
    artworkImage: "/images/journal/blackthorn-hall/blackthorn-hall.png",
    framedMockup: "/images/journal/blackthorn-hall/blackthorn-hall-framed.png",
    publishedDate: 'September 27, 2026',
    category: "Horror",
    collection: "Horror",
    keywords: ["Blackthorn Hall","haunted mansion","gothic horror","Lenora Vale","red eclipse","cursed house","amber eye","haunted estate","gothic architecture"],
    relatedArticles: ["the-guest","the-haunted-reflection"],
    excerpt: "Lenora Vale follows her family’s dreams to a vanished hall beneath a red eclipse, where an enormous eye watches from above the open gates.",
    story: "Blackthorn Hall did not appear on maps anymore, but every daughter of the Vale line dreamed of it before her twenty-fifth year. In sleep they stood before its iron gates, watched the braziers burn without fuel, and saw the great eye open above the entrance as if the house itself had awakened to study them.\r\n\r\nMost woke screaming and spent the rest of their lives pretending it meant nothing.\r\n\r\nLenora went looking for it.\r\n\r\nHer mother had vanished when she was a child, leaving behind only a black dress, a silver key, and a final warning written in the margin of a prayer book: If the house calls you, do not arrive afraid. It feeds on fear, but it obeys blood.\r\n\r\nAt dusk on the night of the red eclipse, Lenora followed the old road through dead trees and found the gates already open.\r\n\r\nBlackthorn Hall rose before her like a cathedral built for worship and punishment in equal measure. Skulls watched from the stonework. Tattered crimson banners hung from the upper towers. Statues guarded the steps with their faces bowed, as though ashamed of what they served. And above the archway, where no window should have been, an enormous amber eye stared down through threads of blood-dark shadow.\r\n\r\nIt blinked when she reached the first stair.\r\n\r\nInside the hall, hundreds of candles were already lit. No servants waited. No dust covered the floor. The house had not been abandoned at all. It had been waiting.\r\n\r\nAt the end of the central nave stood a portrait of every woman in her bloodline, each painted in the same black gown, each with one hand resting on the same silver key. Her mother’s portrait hung last. The paint was still fresh.\r\n\r\nLenora understood then that Blackthorn Hall was not a place her family owned. It was a promise they had been forced to keep.\r\n\r\nLong ago, the first Vale daughter had bound something ancient beneath the foundations — an entity that did not kill with claws or teeth, but with knowledge. It watched. It learned. It whispered the private guilt of every soul who stepped inside until they destroyed themselves under the weight of being completely seen. The eye above the entrance was not decoration. It was the lock.\r\n\r\nEvery generation, one daughter returned willingly and became the next keeper, surrendering her life to guard the threshold and keep the thing below from opening its gaze upon the world.\r\n\r\nThat was why her mother had disappeared.\r\n\r\nThat was why the house had called to Lenora now.\r\n\r\nThe steps behind her groaned shut. The candles brightened. The eye above the doorway narrowed, not with hunger, but with recognition. It had not summoned prey. It had summoned an heir.\r\n\r\nLenora climbed the final stair, took the black veil from the altar, and placed it over her hair. At once the manor fell silent, as if satisfied. The crimson moon burned overhead. The braziers steadied. Even the ravens beyond the gate went still.\r\n\r\nBy dawn, the villagers would say Blackthorn Hall had claimed another woman.\r\n\r\nThey would be wrong.\r\n\r\nShe had claimed it back.",
    behindTheCreation: "Blackthorn Hall rises like a cathedral, with skull-work, crimson banners, and an amber eye above its entrance. Lenora’s arrival places a single heir before a house shaped by generations of the Vale line.\n\nThe artwork holds its story at the point where the eye is a lock upon an ancient entity, and the Vale daughters inherit the role of keeper. Lenora’s decision is an act of chosen duty, not the house defeating her.",
    creativeProcess: "The upward pull of the towers leads toward the eye over the gate. The open entrance and the small approaching figure hold the story at the threshold, where Lenora chooses to take responsibility for the house.\n\nThe lighting and palette reinforce this reading: Lenora’s arrival places a single heir before a house shaped by generations of the Vale line.",
    symbolism: "The eye is a lock upon an ancient entity, and the Vale daughters inherit the role of keeper. Lenora’s decision is an act of chosen duty, not the house defeating her.\n\nLenora remains at Blackthorn Hall as its keeper. The ancient eye stays watchful above the entrance, and her chosen responsibility continues.",
    hiddenDetails: "The red eclipse, burning braziers, bowed statues, and watchful eye gather the family’s recurring dream into one scene. The iron gate stands open because Lenora has come to assume the vigil.\n\nThese visual relationships support the supplied story without adding events beyond it.",
    collectorNotes: "Blackthorn Hall belongs to Horror. Blackthorn Hall rises like a cathedral, with skull-work, crimson banners, and an amber eye above its entrance. Lenora’s arrival places a single heir before a house shaped by generations of the Vale line.\n\nFor collectors drawn to haunted mansion, gothic horror, Lenora Vale, the work offers a focused image whose central choice or mystery remains faithful to its story.",
    closingArchive: "Lenora remains at Blackthorn Hall as its keeper. The ancient eye stays watchful above the entrance, and her chosen responsibility continues.",
    featuredDescription: "Lenora Vale follows her family’s dreams to a vanished hall beneath a red eclipse, where an enormous eye watches from above the open gates.",
    etsyUrl: "https://vantahollow.etsy.com/listing/4569346306",
    seo: {
      title: "Blackthorn Hall | The Hollow Journal | Vanta Hollow",
      description: "Explore Blackthorn Hall, a gothic haunted mansion story about Lenora Vale, an ancestral curse, and the watchful eye guarding an ancient secret.",
    },
  },
  {
    entryNumber: 'Archive Entry 025',
    title: "The Last Mercy",
    slug: "the-last-mercy",
    artworkImage: "/images/journal/the-last-mercy/the-last-mercy.png",
    framedMockup: "/images/journal/the-last-mercy/the-last-mercy-framed.png",
    publishedDate: 'September 27, 2026',
    category: "Angels & Demons",
    collection: "Angel & Demon Art",
    keywords: ["last mercy","fallen angel","horned warden","dark angel","celestial emissary","black wings","white wings","gothic romance","mercy","sacrifice"],
    relatedArticles: ["the-exiled-seraph","the-black-covenant"],
    excerpt: "A Horned Warden refuses to surrender one condemned child, setting in motion a sacrifice that releases the souls held beyond heaven’s gates.",
    story: "He had carried thousands of the dead.\r\n\r\nShe was the first one he refused to surrender.\r\n\r\nFor centuries, the Horned Warden stood beyond the ruined gates of the celestial kingdom, gathering the souls heaven rejected. Murderers came to him. Cowards came to him. Kings who had hidden behind armies and beggars who had died unnamed came to him alike. His task was simple: receive those denied passage above and escort them into the darkness beyond the moon.\r\n\r\nThe celestial court called him a demon.\r\n\r\nThey had not always called him that.\r\n\r\nLong ago, before the horns and black wings, he had stood among them.\r\n\r\nHis fall began with a child.\r\n\r\nThe boy had died pulling his younger sister from a burning house. By the laws of the upper kingdom, the soul was condemned because the boy had taken a life years earlier while defending himself from a violent father. The court saw only the act written in its ledger.\r\n\r\nThe Warden saw everything that came after it.\r\n\r\nWhen ordered to cast the child below, he refused.\r\n\r\nHis white wings were burned black. Horns were bound to his skull as a mark of corruption, and his name was struck from every celestial record. From that day forward, he was sent beneath the gates to receive every soul heaven no longer wanted.\r\n\r\nOver the centuries, he began to notice a pattern.\r\n\r\nThe condemned were not always monsters.\r\n\r\nSome had lied to protect children. Some had broken sacred laws to save strangers. Some had killed while defending the innocent. Others had simply failed impossible tests created by beings who had never known hunger, grief, terror, or love.\r\n\r\nThe Warden stopped asking what law they had broken.\r\n\r\nHe began asking why.\r\n\r\nThat was when heaven decided he had become dangerous.\r\n\r\nA white-winged emissary was sent to destroy him.\r\n\r\nShe descended through the moon gate wearing ivory armor and carrying the judgment of the celestial court in a blade of light. Her wings had never known ash. Her hands had never touched the condemned. She believed the stories written about the creature waiting beneath the ruined arches.\r\n\r\nShe believed he stole souls.\r\n\r\nShe believed the darkness belonged to him.\r\n\r\nShe believed mercy was weakness.\r\n\r\nTheir battle lasted until the moon crossed the center of the sky.\r\n\r\nHer light shattered towers. His wings blotted out the stars. The broken kingdom trembled beneath them until, during the final strike, her blade pierced the stone floor instead of his chest.\r\n\r\nSomething beneath the ruins opened.\r\n\r\nNot a pit.\r\n\r\nAn archive.\r\n\r\nThousands of names appeared across the black stone.\r\n\r\nBeside each name was the reason heaven had rejected them.\r\n\r\nThe emissary began reading.\r\n\r\nA mother condemned for stealing medicine.\r\n\r\nA soldier condemned for abandoning his post to carry wounded civilians from a burning city.\r\n\r\nA young woman condemned for killing the man who murdered her sister.\r\n\r\nA priest condemned for questioning an order that would have sacrificed children.\r\n\r\nThe records went on for miles beneath the city.\r\n\r\nThe Warden had not been collecting an army.\r\n\r\nHe had been protecting the souls heaven was ashamed to admit it had judged without mercy.\r\n\r\nThe emissary lowered her sword.\r\n\r\nFor the first time in her existence, she looked back toward the celestial towers and wondered whether holiness and goodness had ever meant the same thing.\r\n\r\nHeaven saw her hesitation.\r\n\r\nThe judgment came immediately.\r\n\r\nThe moon gate opened above them, and a spear of white fire fell from the upper kingdom.\r\n\r\nIt was meant for the Warden.\r\n\r\nShe stepped in front of it.\r\n\r\nHer wings caught the light first.\r\n\r\nWhite feathers scattered across the ruins as she fell.\r\n\r\nHe reached her before she touched the ground.\r\n\r\nThe celestial kingdom began breaking apart around them. Towers collapsed. Stone angels lost their faces. The great moon fractured behind a ring of ruined architecture while light poured through the cracks like the last sunrise of a dying world.\r\n\r\nThe Warden held her against his chest.\r\n\r\nShe was lighter than he expected.\r\n\r\nFor someone who had spent eternity passing judgment, she suddenly seemed terribly mortal.\r\n\r\nHe told her he could take her below. The condemned would hide her. The darkness would keep heaven from finding what remained of her soul.\r\n\r\nShe shook her head.\r\n\r\nThere was one final law she intended to break.\r\n\r\nThe archive beneath them was bound by celestial blood. Only the death of an emissary who willingly rejected the judgment of heaven could release every condemned soul at once.\r\n\r\nShe had not stepped in front of the spear to save him.\r\n\r\nShe had stepped in front of it to free them.\r\n\r\nThe Warden looked across the endless names carved beneath the ruins.\r\n\r\nFor centuries, he had protected them one by one.\r\n\r\nShe had chosen to save them all.\r\n\r\nHer last request was simple.\r\n\r\nCarry me to the gate.\r\n\r\nSo he did.\r\n\r\nHe lifted the dying angel into his arms and walked across the flooded ruins while her white feathers drifted around his black wings. The celestial statues watched in silence. The moon burned above them. Behind him, thousands of names began disappearing from the stone as the souls bound beneath the kingdom rose into the light for the first time.\r\n\r\nWhen he reached the gate, the angel opened her eyes once more.\r\n\r\nShe asked whether history would remember what happened.\r\n\r\nThe Warden looked at the collapsing towers.\r\n\r\n“No,” he told her.\r\n\r\nShe smiled anyway.\r\n\r\nBy dawn, the celestial kingdom was gone.\r\n\r\nOnly the Warden remained among the ruins, kneeling beneath the moon with the angel in his arms as the final souls passed beyond the broken gate.\r\n\r\nThe stories written afterward said a demon had invaded heaven and carried away one of its angels.\r\n\r\nThey never recorded why she went willingly.\r\n\r\nThey never recorded the thousands she freed.\r\n\r\nAnd they never admitted that the last act of mercy heaven ever witnessed came from the two beings it had condemned.",
    behindTheCreation: "The Horned Warden and the celestial emissary face one another across the boundary between the ruined kingdom and the darkness beyond the moon. Opposing wings and the restrained light give the encounter its solemn focus.\n\nThe artwork holds its story at the point where the Warden’s fall begins when he refuses to condemn a child. The emissary later chooses to sacrifice herself to release the condemned souls, an act that cannot be reduced to saving him or reuniting them.",
    creativeProcess: "The two figures make a quiet counterweight within the larger celestial setting. Their different silhouettes keep the scene legible while the space between them carries the weight of the choice.\n\nThe lighting and palette reinforce this reading: Opposing wings and the restrained light give the encounter its solemn focus.",
    symbolism: "The Warden’s fall begins when he refuses to condemn a child. The emissary later chooses to sacrifice herself to release the condemned souls, an act that cannot be reduced to saving him or reuniting them.\n\nHer sacrifice releases the condemned souls. The archive leaves their separate paths intact and does not promise an ordinary reunion.",
    hiddenDetails: "The contrast between his horns and dark wings and her celestial presence expresses the divide imposed by the court. Their meeting is shaped by the souls awaiting release, not by an ordinary romance ending.\n\nThese visual relationships support the supplied story without adding events beyond it.",
    collectorNotes: "The Last Mercy belongs to Angel & Demon Art. The Horned Warden and the celestial emissary face one another across the boundary between the ruined kingdom and the darkness beyond the moon. Opposing wings and the restrained light give the encounter its solemn focus.\n\nFor collectors drawn to fallen angel, horned warden, dark angel, the work offers a focused image whose central choice or mystery remains faithful to its story.",
    closingArchive: "Her sacrifice releases the condemned souls. The archive leaves their separate paths intact and does not promise an ordinary reunion.",
    featuredDescription: "A Horned Warden refuses to surrender one condemned child, setting in motion a sacrifice that releases the souls held beyond heaven’s gates.",
    etsyUrl: "https://vantahollow.etsy.com/listing/4570443151",
    seo: {
      title: "The Last Mercy | The Hollow Journal | Vanta Hollow",
      description: "Explore The Last Mercy, a fallen angel story about a horned Warden, a celestial emissary, and the sacrifice that frees heaven’s condemned souls.",
    },
  },
  {
    entryNumber: 'Archive Entry 026',
    title: "The Soulkeeper",
    slug: "the-soulkeeper",
    artworkImage: "/images/journal/the-soulkeeper/the-soulkeeper.png",
    framedMockup: "/images/journal/the-soulkeeper/the-soulkeeper-framed.png",
    publishedDate: 'September 27, 2026',
    category: "Horror",
    collection: "Horror",
    keywords: ["soulkeeper","grim reaper","Mourning Vale","haunted tree","skeletal reaper","forgotten dead","ghost","gothic horror","supernatural","memory"],
    relatedArticles: ["the-marigold-keeper","the-ancestors-vigil"],
    excerpt: "When Mourning Vale forgets its naming ritual, the ancient tree’s first forgotten spirit reveals what the Soulkeeper has been preserving.",
    story: "For three hundred years, the people of Mourning Vale buried their dead beneath the roots of the oldest tree in the city.\r\n\r\nNo gravestones marked the place. No names were carved into stone. Families simply carried their dead beneath the branches at midnight, whispered the name of the departed into the bark, and left before the cathedral bell struck one.\r\n\r\nThe tree remembered for them.\r\n\r\nChildren were taught that every branch represented a generation and every root carried the memories of those who had passed beneath the earth. When orange light sometimes appeared between the cracks in its bark, the elders said it was nothing to fear.\r\n\r\nThe dead were only dreaming.\r\n\r\nThen the city began to grow.\r\n\r\nNew streets swallowed the old cemetery. Iron fences replaced stone walls. Houses rose where funeral processions once passed, and within two generations the ancient ritual became little more than a superstition told to frighten children.\r\n\r\nThe dead were buried elsewhere.\r\n\r\nThe tree remained.\r\n\r\nOne winter, the city council decided to remove it.\r\n\r\nIts roots had broken through the road. Its branches reached across rooftops. Merchants complained that customers avoided the street after sunset because strange figures could sometimes be seen standing beneath the tree.\r\n\r\nThe first axe struck the trunk shortly after sunrise.\r\n\r\nThe worker who swung it died before noon.\r\n\r\nThe second disappeared that night.\r\n\r\nBy morning, orange fire was burning beneath the bark.\r\n\r\nThe council ordered the tree cut down anyway.\r\n\r\nTwenty men arrived with axes, saws, ropes, and lanterns. By sunset they had removed three enormous branches. Black sap poured from every wound. The air grew cold enough to frost the windows along the street, and people inside the neighboring houses began hearing voices beneath their floors.\r\n\r\nNot words.\r\n\r\nNames.\r\n\r\nHundreds of them.\r\n\r\nAt midnight, the cathedral bell rang on its own.\r\n\r\nThe tree opened.\r\n\r\nSomething immense unfolded from within the trunk.\r\n\r\nA hooded skeletal figure rose above the rooftops, clothed in black robes that seemed woven from the dead branches themselves. Its fingers were longer than a man's arm. Skulls hung from chains around one wrist. Fire crawled through the tree behind its body, yet nothing burned away.\r\n\r\nThen its chest split open.\r\n\r\nInside was not a heart.\r\n\r\nThere was a doorway.\r\n\r\nFaces pressed against the orange light beyond it. Hands reached outward. Mouths opened in silent screams as hundreds of pale spirits began tearing themselves free.\r\n\r\nThe people of Mourning Vale believed the creature had come to claim the city.\r\n\r\nThey fled.\r\n\r\nBy dawn, the streets were empty except for the dead.\r\n\r\nGhosts moved through the fog where living families had once walked. Some drifted toward homes that no longer belonged to them. Others stood beneath windows and stared at descendants who did not know their names. Every spirit carried fragments of a life the city had chosen to forget.\r\n\r\nAnd above them sat the thing the survivors began calling the Soulkeeper.\r\n\r\nFor seven nights, no one dared return.\r\n\r\nOn the eighth, an old woman crossed the abandoned gate alone.\r\n\r\nHer name was Mara Vale, the final surviving keeper of the burial tradition. Her grandmother had taught her the ritual when she was a child, long before anyone believed it mattered.\r\n\r\nShe walked beneath the giant figure and spoke the words the city had forgotten.\r\n\r\nOne by one, she began naming the dead.\r\n\r\nThe first spirit stopped screaming.\r\n\r\nThen another.\r\n\r\nThen dozens.\r\n\r\nAs each name was spoken, a ghost turned toward the tree and vanished into the burning doorway inside the Soulkeeper's chest.\r\n\r\nMara continued until sunrise.\r\n\r\nShe returned the following night.\r\n\r\nAnd the night after that.\r\n\r\nThe city records contained only a fraction of the names she needed, so she searched abandoned churches, family Bibles, cemetery ledgers, letters, birth records, and forgotten inscriptions beneath the oldest buildings in Mourning Vale.\r\n\r\nEvery name returned another spirit to the tree.\r\n\r\nMonths passed.\r\n\r\nEventually, only one ghost remained.\r\n\r\nA young man stood beneath the branches wearing the uniform of one of the workers who had tried to cut the tree.\r\n\r\nMara searched every record.\r\n\r\nHis name appeared nowhere.\r\n\r\nShe asked the surviving workers.\r\n\r\nNone remembered him.\r\n\r\nShe searched the city census, employment rolls, and parish books.\r\n\r\nNothing.\r\n\r\nThe ghost waited beneath the Soulkeeper each night.\r\n\r\nFinally, Mara approached him.\r\n\r\n“Who are you?”\r\n\r\nThe spirit looked toward the enormous figure above them.\r\n\r\nThen he looked at her.\r\n\r\n“I was the first.”\r\n\r\nMara understood.\r\n\r\nBefore the cemetery.\r\n\r\nBefore the city.\r\n\r\nBefore anyone had begun whispering names into the bark.\r\n\r\nSomeone had died beneath this tree alone.\r\n\r\nNo family had buried him. No priest had recorded him. No stone had ever carried his name.\r\n\r\nThe tree had grown around his body.\r\n\r\nAnd because no one remembered him, he had remained.\r\n\r\nFor centuries, the Soulkeeper had not been imprisoning the dead.\r\n\r\nIt had been remembering them.\r\n\r\nEvery soul inside its chest belonged to someone whose name the tree had been given. The ritual had never been about burial.\r\n\r\nIt was a promise.\r\n\r\nAs long as one living person remembered your name, death could not erase you completely.\r\n\r\nMara asked the forgotten spirit what he had been called.\r\n\r\nHe smiled.\r\n\r\n“I don't remember either.”\r\n\r\nFor the first time, the Soulkeeper moved.\r\n\r\nOne enormous skeletal hand descended from the branches and rested beside the nameless ghost.\r\n\r\nThe fire within its chest softened.\r\n\r\nThe spirit looked up at the creature and understood something Mara could not.\r\n\r\nThen he stepped willingly into the light.\r\n\r\nThe doorway closed.\r\n\r\nThe fires beneath the bark disappeared.\r\n\r\nAnd the Soulkeeper became motionless once more.\r\n\r\nYears later, Mourning Vale rebuilt the road around the tree.\r\n\r\nNo one ever attempted to cut it again.\r\n\r\nThe burial ritual returned, but with one change.\r\n\r\nEvery child in the city was taught the names of those who came before them.\r\n\r\nBecause the people finally understood what waited inside the ancient tree.\r\n\r\nNot Death.\r\n\r\nMemory.\r\n\r\nAnd on certain nights, when the moon is full and fog gathers between the lamps, pale figures can still be seen moving along the old street beneath its branches.\r\n\r\nThe people of Mourning Vale no longer run from them.\r\n\r\nThey simply listen.",
    behindTheCreation: "The skeletal Soulkeeper stands beside the ancient tree at the center of Mourning Vale’s burial ground. Orange light between the roots connects the figure to the memories held beneath the city.\n\nThe artwork holds its story at the point where the Soulkeeper represents memory rather than a predator who imprisons souls. Restoring the naming ritual gives the forgotten dead recognition, including the first spirit who can no longer remember his own name.",
    creativeProcess: "The tree’s trunk and roots frame the keeper as part of a shared landscape. Orange light offers a warm focal point against the dark branches and stone, bringing the buried history into view.\n\nThe lighting and palette reinforce this reading: Orange light between the roots connects the figure to the memories held beneath the city.",
    symbolism: "The Soulkeeper represents memory rather than a predator who imprisons souls. Restoring the naming ritual gives the forgotten dead recognition, including the first spirit who can no longer remember his own name.\n\nMara restores the naming ritual in Mourning Vale. The first forgotten spirit remains unable to remember his own name, and the tree continues to hold the city’s memory.",
    hiddenDetails: "The light in the bark recalls the elders’ belief that the dead were dreaming. The enclosing roots and quiet figure keep the scene centered on remembrance, not pursuit.\n\nThese visual relationships support the supplied story without adding events beyond it.",
    collectorNotes: "The Soulkeeper belongs to Horror. The skeletal Soulkeeper stands beside the ancient tree at the center of Mourning Vale’s burial ground. Orange light between the roots connects the figure to the memories held beneath the city.\n\nFor collectors drawn to grim reaper, Mourning Vale, haunted tree, the work offers a focused image whose central choice or mystery remains faithful to its story.",
    closingArchive: "Mara restores the naming ritual in Mourning Vale. The first forgotten spirit remains unable to remember his own name, and the tree continues to hold the city’s memory.",
    featuredDescription: "When Mourning Vale forgets its naming ritual, the ancient tree’s first forgotten spirit reveals what the Soulkeeper has been preserving.",
    etsyUrl: "https://vantahollow.etsy.com/listing/4571436982",
    seo: {
      title: "The Soulkeeper | The Hollow Journal | Vanta Hollow",
      description: "Explore The Soulkeeper, a gothic reaper story about Mourning Vale, an ancient burial tree, and the names of the dead that must never be forgotten.",
    },
  },
  {
    entryNumber: 'Archive Entry 027',
    title: "The Ancestors' Vigil",
    slug: "the-ancestors-vigil",
    artworkImage: "/images/journal/the-ancestors'-vigil/the-ancestors'-vigil.png",
    framedMockup: "/images/journal/the-ancestors'-vigil/the-ancestors'-vigil-framed.png",
    publishedDate: 'September 27, 2026',
    category: "Sugar Skulls",
    collection: "Sugar Skulls",
    keywords: ["ancestors vigil","sugar skull woman","Day of the Dead","Catrina","marigolds","ancestor remembrance","gothic sugar skull","lake","moon","calavera"],
    relatedArticles: ["the-marigold-keeper","the-widows-bloom"],
    excerpt: "A woman returns to the lake beneath the moon, where marigold paths and the faces of her remembered ancestors gather for the yearly vigil.",
    story: "Every year, she returns to the water before moonrise.\r\n\r\nThe marigolds are already waiting, their orange petals forming glowing paths across the lake as though someone on the other side has remembered the way home. She steps between them dressed in black, wearing the painted face and crown carried through generations before her. When the moon rises behind her, the first face appears in the clouds.\r\n\r\nThen another.\r\n\r\nSoon the entire sky is watching.\r\n\r\nThey do not speak. They never have to. These are the faces whose names remain on photographs, whose stories survive in fragments, whose absence has been carried for so long that grief and love have become impossible to separate. She stands beneath them while their reflections ripple through the dark water at her feet, surrounded by hundreds of small flames burning against the night.\r\n\r\nHer vigil lasts until dawn.\r\n\r\nWhen the moon finally disappears behind the mountains, the faces fade with it. The marigold paths dim. The lake becomes ordinary water again.\r\n\r\nBut she leaves knowing what she came to remember.\r\n\r\nThe dead do not disappear while someone still carries their name.",
    behindTheCreation: "The woman stands at the water in her painted face and crown, surrounded by marigolds, small flames, and ancestral faces in the clouds. The lake reflects the vigil beneath the moon.\n\nThe artwork holds its story at the point where the gathering faces are remembered ancestors, not a threat. Their silence carries the connection between grief and love, while the annual return turns remembrance into a continuing act.",
    creativeProcess: "The still figure anchors the foreground while the marigold path draws the eye across the water and upward to the faces in the sky. The reflection ties the night scene together.\n\nThe lighting and palette reinforce this reading: The lake reflects the vigil beneath the moon.",
    symbolism: "The gathering faces are remembered ancestors, not a threat. Their silence carries the connection between grief and love, while the annual return turns remembrance into a continuing act.\n\nHer vigil lasts until dawn. The faces fade with the moon, the marigold paths dim, and the lake becomes ordinary water again.",
    hiddenDetails: "The marigolds mark a route across the lake, and the flames echo that warm color at the water’s edge. The moonlit faces remain connected to names, photographs, and stories held by the living.\n\nThese visual relationships support the supplied story without adding events beyond it.",
    collectorNotes: "The Ancestors' Vigil belongs to Sugar Skulls. The woman stands at the water in her painted face and crown, surrounded by marigolds, small flames, and ancestral faces in the clouds. The lake reflects the vigil beneath the moon.\n\nFor collectors drawn to sugar skull woman, Day of the Dead, Catrina, the work offers a focused image whose central choice or mystery remains faithful to its story.",
    closingArchive: "Her vigil lasts until dawn. The faces fade with the moon, the marigold paths dim, and the lake becomes ordinary water again.",
    featuredDescription: "A woman returns to the lake beneath the moon, where marigold paths and the faces of her remembered ancestors gather for the yearly vigil.",
    etsyUrl: "https://vantahollow.etsy.com/listing/4572264998",
    seo: {
      title: "The Ancestors' Vigil | The Hollow Journal | Vanta Hollow",
      description: "Explore The Ancestors’ Vigil, a Day of the Dead sugar skull artwork celebrating remembrance, marigolds, ancestral memory, and love beyond loss.",
    },
  },
  {
    entryNumber: 'Archive Entry 028',
    title: "The Cabin Light Slasher",
    slug: "the-cabin-light-slasher",
    artworkImage: "/images/journal/the-cabin-light-slasher/the-cabin-light-slasher.png",
    framedMockup: "/images/journal/the-cabin-light-slasher/the-cabin-light-slasher-framed.png",
    publishedDate: 'September 27, 2026',
    category: "Horror",
    collection: "Horror",
    keywords: ["cabin light slasher","horror art","killer zombie","cabin","forest chase","slasher horror","rain","gothic horror","moonlight"],
    relatedArticles: ["the-guest","the-haunted-reflection"],
    excerpt: "A woman runs through mud and rain toward a cabin lantern while a fast-moving pursuer closes in behind her; what happens at the porch remains unknown.",
    story: "She thought the cabin light meant she was safe.\r\n\r\nThat was the lie the woods told best.\r\n\r\nFrom a distance, the porch lantern looked warm enough to trust. The kind of light that makes people believe doors still matter, that one step onto the boards and one hand on the railing can somehow put distance between them and whatever followed them out of the trees. But the mud on her legs, the rain in her hair, and the terror in her throat were already telling a different story.\r\n\r\nHe was still coming.\r\n\r\nNot stumbling. Not drifting. Running.\r\n\r\nEvery old story about the place claimed the dead thing in the woods moved slowly, as if fear needed time to ripen before it was worth harvesting. That may have once been true. On this night, under a full moon and a sky heavy with rain, the monster behind her tore through the mud with the hunger of something no longer interested in patience. Rot clung to his face. Wet work clothes hung from him in shredded layers. His mouth twisted with the kind of rage that makes survival feel less like escape and more like luck that runs out eventually.\r\n\r\nThe porch was right there.\r\n\r\nThe lantern burned above her shoulder. The windows glowed gold through the storm. The cabin looked lived in, solid, ordinary — the kind of place built for shelter. And that is what makes the image cruel. Safety is no longer some distant hope across the lake or through the forest. It is inches away, bright and visible, almost close enough to touch.\r\n\r\nAlmost.\r\n\r\nThe ground has turned to sludge beneath her feet. Rain streaks down the steps. Her dress clings to her, torn and filthy from the sprint. Behind her, the killer closes the distance through mud and shadow, dragging the full weight of the nightmare right up to the light.\r\n\r\nThat is the moment The Cabin Light Slasher captures.\r\n\r\nNot the beginning. Not the body count. Not the aftermath.\r\n\r\nThe second where survival still seems possible, but only barely.",
    behindTheCreation: "The cabin’s warm porch light cuts through a rain-heavy night as the woman runs over muddy ground. Behind her, the pursuer moves quickly through the trees, making the distance to the steps feel urgent.\n\nThe artwork holds its story at the point where the familiar cabin light offers the appearance of safety without guaranteeing it. The scene holds at the approach, preserving the story’s unresolved outcome.",
    creativeProcess: "The light gives the eye a destination, but the diagonal chase keeps attention on the space closing behind her. The full moon and wet ground intensify the contrast between the welcoming porch and the dangerous woods.\n\nThe lighting and palette reinforce this reading: Behind her, the pursuer moves quickly through the trees, making the distance to the steps feel urgent.",
    symbolism: "The familiar cabin light offers the appearance of safety without guaranteeing it. The scene holds at the approach, preserving the story’s unresolved outcome.\n\nShe is nearly at the cabin, with the pursuer still running behind her. The story ends before either survival or capture is known.",
    hiddenDetails: "Rain in her hair, mud on her legs, and the pursuer’s forward motion make the escape immediate. The lantern remains only a point of light; it does not resolve what waits beyond the porch.\n\nThese visual relationships support the supplied story without adding events beyond it.",
    collectorNotes: "The Cabin Light Slasher belongs to Horror. The cabin’s warm porch light cuts through a rain-heavy night as the woman runs over muddy ground. Behind her, the pursuer moves quickly through the trees, making the distance to the steps feel urgent.\n\nFor collectors drawn to horror art, killer zombie, cabin, the work offers a focused image whose central choice or mystery remains faithful to its story.",
    closingArchive: "She is nearly at the cabin, with the pursuer still running behind her. The story ends before either survival or capture is known.",
    featuredDescription: "A woman runs through mud and rain toward a cabin lantern while a fast-moving pursuer closes in behind her; what happens at the porch remains unknown.",
    etsyUrl: "https://vantahollow.etsy.com/listing/4574223317",
    seo: {
      title: "The Cabin Light Slasher | The Hollow Journal | Vanta Hollow",
      description: "Explore The Cabin Light Slasher, a cinematic horror artwork capturing a desperate escape through rain and mud toward a cabin that may not offer safety.",
    },
  },
  {
    entryNumber: 'Archive Entry 029',
    title: "The Blood Court",
    slug: "the-blood-court",
    artworkImage: "/images/journal/the-blood-court/the-blood-court.png",
    framedMockup: "/images/journal/the-blood-court/the-blood-court-framed.png",
    publishedDate: 'September 27, 2026',
    category: "Horror",
    collection: "Horror",
    keywords: ["blood court","gothic vampire","horror art","vampire judge","gothic cathedral","crimson card","midnight summons","vampire horror","dark fantasy"],
    relatedArticles: ["the-cathedral","the-cathedral-of-teeth"],
    excerpt: "A summoned guest faces the Blood Court’s judge and must decide whether to offer another person’s name; the court’s red card marks refusal.",
    story: "Nobody entered the cathedral after midnight unless they had been summoned.\r\n\r\nThere was no congregation anymore. No choir. No priest willing to stand beneath the stained glass after sunset. Still, every few years, someone in the city would wake to find a card beneath their door.\r\n\r\nAlways the same design.\r\n\r\nA heart painted in black and crimson.\r\n\r\nThe instructions were never written because everyone already knew what the card meant.\r\n\r\nBefore the bells finished striking twelve, the chosen guest was expected to enter the cathedral alone.\r\n\r\nHe would be waiting at the end of the nave.\r\n\r\nSome called him a vampire. Others insisted he was far older than that — the last surviving judge of a court that had ruled long before the cathedral was built around it. His clothes changed with the centuries, but witnesses always described the same white eyes, the same ruined flesh, and the same mouth filled with far too many teeth.\r\n\r\nAnd always, the card.\r\n\r\nThe Blood Court did not ask whether its guests were innocent.\r\n\r\nIt asked what they were willing to sacrifice.\r\n\r\nGold bought nothing. Titles meant nothing. Prayers were never answered. The creature wanted only one thing from anyone desperate enough to bargain with it: a name.\r\n\r\nSpeak the name of another person, and the card would turn black.\r\n\r\nRefuse, and it would remain red.\r\n\r\nNo one knew what happened to those whose cards stayed red because none of them ever returned.\r\n\r\nBy morning, the cathedral doors would open again. The candles would be extinguished. The nave would be empty.\r\n\r\nExcept for one new card lying on the altar.\r\n\r\nThe Blood Court captures the instant before that choice is made — the creature waiting beneath stained glass, one clawed hand holding the sentence while the cathedral itself seems to watch.\r\n\r\nSome monsters hunt you.\r\n\r\nOthers simply wait for you to arrive.",
    behindTheCreation: "A solitary visitor faces the male judge at the far end of the cathedral nave. The crimson-and-black heart card makes the court’s summons tangible within the shadowed sanctuary.\n\nThe artwork holds its story at the point where the visitor must choose whether to offer another person’s name. A black card means a name was spoken; a red card means refusal. The fate of those who refuse remains unknown.",
    creativeProcess: "The long nave draws the visitor toward the judge, while the card gives the encounter a smaller, intimate focal point. The cathedral’s scale makes the choice feel inescapable without revealing its outcome.\n\nThe lighting and palette reinforce this reading: The crimson-and-black heart card makes the court’s summons tangible within the shadowed sanctuary.",
    symbolism: "The visitor must choose whether to offer another person’s name. A black card means a name was spoken; a red card means refusal. The fate of those who refuse remains unknown.\n\nThe visitor’s choice remains the center of the court’s judgment. The story leaves the fate of those who refuse unknown.",
    hiddenDetails: "The repeated heart design connects every summons to the same rule. Empty pews and dark stained glass leave the visitor alone with the choice, while the judge waits without explaining what refusal brings.\n\nThese visual relationships support the supplied story without adding events beyond it.",
    collectorNotes: "The Blood Court belongs to Horror. A solitary visitor faces the male judge at the far end of the cathedral nave. The crimson-and-black heart card makes the court’s summons tangible within the shadowed sanctuary.\n\nFor collectors drawn to gothic vampire, horror art, vampire judge, the work offers a focused image whose central choice or mystery remains faithful to its story.",
    closingArchive: "The visitor’s choice remains the center of the court’s judgment. The story leaves the fate of those who refuse unknown.",
    featuredDescription: "A summoned guest faces the Blood Court’s judge and must decide whether to offer another person’s name; the court’s red card marks refusal.",
    etsyUrl: "https://vantahollow.etsy.com/listing/4574326482",
    seo: {
      title: "The Blood Court | The Hollow Journal | Vanta Hollow",
      description: "Explore The Blood Court, a gothic vampire horror story about a midnight summons, a crimson card, and the price of naming another soul.",
    },
  },
  {
    entryNumber: 'Archive Entry 030',
    title: "The Black Covenant",
    slug: "the-black-covenant",
    artworkImage: "/images/journal/the-black-covenant/the-black-covenant.png",
    framedMockup: "/images/journal/the-black-covenant/the-black-covenant-framed.png",
    publishedDate: 'September 27, 2026',
    category: "Angels & Demons",
    collection: "Angel & Demon Art",
    keywords: ["black covenant","angel demon","fallen angel","gothic angel","horned demon","black wings","celestial conflict","gothic fantasy","forbidden oath"],
    relatedArticles: ["the-last-mercy","the-exiled-seraph"],
    excerpt: "An angelic emissary questions the century-old covenant between heaven and the abyss, then makes a new oath to preserve the boundary between them.",
    story: "For centuries, the cathedral had stood between two kingdoms that were never meant to touch.\r\n\r\nAbove it waited the host.\r\n\r\nBelow it waited everything they had cast out.\r\n\r\nNeither side could cross the boundary without beginning a war that would leave nothing worth ruling when it ended. So the oldest law required something neither heaven nor the abyss could tolerate easily.\r\n\r\nAgreement.\r\n\r\nOnce every hundred years, beneath the full moon, one emissary from each side met upon the cathedral steps.\r\n\r\nNo witnesses.\r\n\r\nNo weapons.\r\n\r\nNo prayers.\r\n\r\nOnly a hand offered and a covenant renewed.\r\n\r\nFor generations, the ritual passed without incident. The chosen angels descended, spoke the prescribed words, touched the hand waiting in darkness, and returned before dawn.\r\n\r\nUntil her.\r\n\r\nShe had been warned never to look into his face.\r\n\r\nShe did anyway.\r\n\r\nThe stories had described a monster — horns, black wings, ancient armor, a creature shaped by exile and hatred.\r\n\r\nThey had not mentioned the grief.\r\n\r\nHe stood above her surrounded by the ruined towers of a city both sides claimed to protect, his enormous wings swallowing the moonlight as he extended his hand.\r\n\r\nShe should have spoken the words.\r\n\r\nInstead, she asked him why the covenant existed at all.\r\n\r\nFor the first time in a thousand years, the figure on the other side answered.\r\n\r\nBecause neither heaven nor hell trusted itself with victory.\r\n\r\nThe truth changed everything.\r\n\r\nThe endless conflict had never been restrained by righteousness. It had been restrained by fear — fear of what either side would become if the other disappeared.\r\n\r\nThe covenant was not peace.\r\n\r\nIt was balance.\r\n\r\nAnd now she understood why every angel before her had been ordered never to ask questions.\r\n\r\nThe moon climbed higher.\r\n\r\nThe cathedral trembled.\r\n\r\nHis hand remained extended.\r\n\r\nWhen she finally reached for him, she did not repeat the ancient oath.\r\n\r\nShe made a new one.\r\n\r\nWhatever happened after that night, heaven would never call it holy.",
    behindTheCreation: "The angelic emissary and dark emissary meet on the cathedral steps beneath the full moon. Their opposing forms express the strain of an agreement made to keep two realms from colliding.\n\nThe artwork holds its story at the point where the covenant maintains balance between opposing realms; it is not ordinary peace. The female angelic emissary questions the ritual and makes a new oath without knowing what consequences follow.",
    creativeProcess: "The cathedral divides the vertical space between the host above and the outcast below. The emissaries hold the threshold, with moonlight bringing the meeting into focus.\n\nThe lighting and palette reinforce this reading: Their opposing forms express the strain of an agreement made to keep two realms from colliding.",
    symbolism: "The covenant maintains balance between opposing realms; it is not ordinary peace. The female angelic emissary questions the ritual and makes a new oath without knowing what consequences follow.\n\nShe makes a new oath at the boundary. Its consequences remain unknown, and the agreement’s balance is left unresolved.",
    hiddenDetails: "The two emissaries embody different sides of the boundary, while the cathedral steps give their meeting a shared ground. The repeated ceremony’s absence of witnesses emphasizes the weight of the choice.\n\nThese visual relationships support the supplied story without adding events beyond it.",
    collectorNotes: "The Black Covenant belongs to Angel & Demon Art. The angelic emissary and dark emissary meet on the cathedral steps beneath the full moon. Their opposing forms express the strain of an agreement made to keep two realms from colliding.\n\nFor collectors drawn to angel demon, fallen angel, gothic angel, the work offers a focused image whose central choice or mystery remains faithful to its story.",
    closingArchive: "She makes a new oath at the boundary. Its consequences remain unknown, and the agreement’s balance is left unresolved.",
    featuredDescription: "An angelic emissary questions the century-old covenant between heaven and the abyss, then makes a new oath to preserve the boundary between them.",
    etsyUrl: "https://vantahollow.etsy.com/listing/4576942134",
    seo: {
      title: "The Black Covenant | The Hollow Journal | Vanta Hollow",
      description: "Explore The Black Covenant, a gothic angel and demon artwork about forbidden knowledge, celestial conflict, and the balance between opposing worlds.",
    },
  },
  {
    entryNumber: 'Archive Entry 031',
    title: "The Final Coronation",
    slug: "the-final-coronation",
    artworkImage: "/images/journal/the-final-coronation/the-final-coronation.png",
    framedMockup: "/images/journal/the-final-coronation/the-final-coronation-framed.png",
    publishedDate: 'September 27, 2026',
    category: "Horror",
    collection: "Horror",
    keywords: ["final coronation","gothic death queen","skeletal queen","dark fantasy","black sun","cathedral","crown","royal ritual","gothic fantasy"],
    relatedArticles: ["the-crimson-queen","the-final-judgment"],
    excerpt: "Beneath an ancient cathedral, a living queen is drawn into a succession ceremony conducted by a skeletal sovereign beneath the black sun.",
    story: "Every ruler believed the crown belonged to them.\r\n\r\nThat was the first lie.\r\n\r\nThe second was that coronation happened only once.\r\n\r\nHidden beneath the oldest cathedral in the kingdom was a chamber no living monarch was permitted to enter. Its doors opened only when the black sun appeared above the towers, and when they did, the reigning queen was brought there barefoot, dressed in white, and blindfolded in crimson.\r\n\r\nNo guards were allowed beyond the stairs.\r\n\r\nNo priest was permitted to speak.\r\n\r\nThe dead handled the rest.\r\n\r\nThey came from the aisles first—pale figures wrapped in smoke, their hands reaching through the mist as the queen was lifted from the stone. Behind them stood the one sovereign no history ever named.\r\n\r\nHer crown had fused into her skull.\r\n\r\nBlack metal rose from it in jagged branches, spreading wider with every century she remained beneath the cathedral. Around her stood silent attendants in dark robes, each crowned with a thin halo of gold. Above them, the eclipse burned like a wound in the sky.\r\n\r\nThe living queen tried to speak.\r\n\r\nNobody answered.\r\n\r\nThen her crown was removed.\r\n\r\nIt fell down the cathedral steps and struck the water below, sinking between red petals and broken reflections.\r\n\r\nOnly then did she understand what the ceremony was.\r\n\r\nNot a sacrifice.\r\n\r\nNot an execution.\r\n\r\nA succession.\r\n\r\nEvery ruler who had ever worn the crown had eventually stood where she stood now. Every kingdom above had changed hands because something far older beneath it had allowed the change to happen.\r\n\r\nThe skeletal queen reached forward.\r\n\r\nThe dead lifted the woman higher.\r\n\r\nWhen the black sun passed, the kingdom would awaken to a new ruler.\r\n\r\nBut the woman in white would never leave the cathedral.\r\n\r\nHer final coronation had already begun.",
    behindTheCreation: "The skeletal sovereign presides over the hidden coronation chamber while the living queen is brought into the ancient rite. The crown, cathedral setting, and black sun gather the succession imagery into one scene.\n\nThe artwork holds its story at the point where the ceremony is a succession, not merely an execution. The female skeletal sovereign and the queen’s place in the ritual keep the scene’s transfer of rule at its center.",
    creativeProcess: "The sovereign’s commanding silhouette gives the chamber a central axis, while the living queen stands within the ritual space below. Cathedral architecture frames the ceremony as an inherited institution.\n\nThe lighting and palette reinforce this reading: The crown, cathedral setting, and black sun gather the succession imagery into one scene.",
    symbolism: "The ceremony is a succession, not merely an execution. The female skeletal sovereign and the queen’s place in the ritual keep the scene’s transfer of rule at its center.\n\nThe ceremony remains a succession. The story leaves the queen within the ritual and does not invent her escape.",
    hiddenDetails: "The crown signifies a claim repeated across generations, and the black sun marks the rare opening of the chamber. The ritual’s controlled setting suggests rules older than the living court.\n\nThese visual relationships support the supplied story without adding events beyond it.",
    collectorNotes: "The Final Coronation belongs to Horror. The skeletal sovereign presides over the hidden coronation chamber while the living queen is brought into the ancient rite. The crown, cathedral setting, and black sun gather the succession imagery into one scene.\n\nFor collectors drawn to gothic death queen, skeletal queen, dark fantasy, the work offers a focused image whose central choice or mystery remains faithful to its story.",
    closingArchive: "The ceremony remains a succession. The story leaves the queen within the ritual and does not invent her escape.",
    featuredDescription: "Beneath an ancient cathedral, a living queen is drawn into a succession ceremony conducted by a skeletal sovereign beneath the black sun.",
    etsyUrl: "https://vantahollow.etsy.com/listing/4577627918",
    seo: {
      title: "The Final Coronation | The Hollow Journal | Vanta Hollow",
      description: "Explore The Final Coronation, a gothic death queen artwork about a hidden royal succession ritual beneath an ancient cathedral.",
    },
  },
  {
    entryNumber: 'Archive Entry 032',
    title: "The Cathedral of Teeth",
    slug: "the-cathedral-of-teeth",
    artworkImage: "/images/journal/the-cathedral-of-teeth/the-cathedral-of-teeth.png",
    framedMockup: "/images/journal/the-cathedral-of-teeth/the-cathedral-of-teeth-framed.png",
    publishedDate: 'September 27, 2026',
    category: "Angels & Demons",
    collection: "Angel & Demon Art",
    keywords: ["cathedral of teeth","demon horror","gothic demon","cathedral","monstrous anatomy","black wings","red stained glass","occult horror","dark fantasy"],
    relatedArticles: ["when-hell-answered","the-blood-court"],
    excerpt: "When the bells stop, the cathedral’s shape reveals the horned, many-mouthed creature the building was raised to contain beneath its foundations.",
    story: "The cathedral had been standing for nearly six hundred years before anyone discovered what it had been built around.\r\n\r\nThe oldest records called the structure a sanctuary, but the foundations told another story. Beneath the altar were iron doors without hinges, chains running deep into the stone, and carvings in a language none of the priests were willing to translate aloud.\r\n\r\nEvery generation was given the same instruction.\r\n\r\nKeep the bells ringing.\r\n\r\nNo one was told why.\r\n\r\nFor centuries, they obeyed.\r\n\r\nThen, during a storm that turned the stained glass red, the bells stopped.\r\n\r\nAt first there was silence.\r\n\r\nThen something beneath the cathedral answered.\r\n\r\nThe floor split through the center aisle. Candles extinguished at once. Stone columns shook as a sound rose from below — not a roar, but hundreds of overlapping voices speaking through mouths that had waited centuries to open.\r\n\r\nWhen the creature pulled itself into the nave, the priests finally understood the architecture surrounding them.\r\n\r\nThe pointed arches.\r\n\r\nThe ribbed vaults.\r\n\r\nThe rows of blackened spires.\r\n\r\nThe cathedral had not been designed to resemble heaven.\r\n\r\nIt had been designed to resemble it.\r\n\r\nThe creature unfolded wings wide enough to shadow the stained glass. Horned faces twisted outward from its crown of flesh, each mouth lined with impossible rows of teeth. Some screamed. Some laughed. Others whispered the names of everyone standing beneath them.\r\n\r\nThe crowd surged toward the doors.\r\n\r\nThey never opened.\r\n\r\nLightning tore across the sky as fire spread through the sanctuary, illuminating the thing that had spent centuries listening to prayers spoken directly above its prison.\r\n\r\nIt raised its arms.\r\n\r\nEvery mouth opened.\r\n\r\nAnd for the first time, the cathedral had a choir.\r\n\r\nThe Cathedral of Teeth captures the moment a sacred place reveals what it was truly built to contain — a towering gothic horror scene of monstrous anatomy, burning stained glass, crimson lightning, and apocalyptic scale.\r\n\r\nThey thought they built a church over the monster.\r\n\r\nThey built a monument in its image.",
    behindTheCreation: "The cathedral’s architecture mirrors the horned creature imprisoned below it. Red light through the glass and the many faces and mouths turn the sanctuary into a reflection of what its walls conceal.\n\nThe artwork holds its story at the point where the bells maintain containment, and their silence exposes the purpose of the cathedral. The building resembles the creature it imprisons; its origin and the eventual outcome remain as given.",
    creativeProcess: "The towering facade leads the eye toward the creature’s repeated faces and mouths. Red glass interrupts the dark structure, while the architectural silhouette connects the prison to its prisoner.\n\nThe lighting and palette reinforce this reading: Red light through the glass and the many faces and mouths turn the sanctuary into a reflection of what its walls conceal.",
    symbolism: "The bells maintain containment, and their silence exposes the purpose of the cathedral. The building resembles the creature it imprisons; its origin and the eventual outcome remain as given.\n\nThe bells have stopped and the containment is in danger. The archive leaves the creature’s escape outcome unresolved.",
    hiddenDetails: "The repeated horned faces and mouths echo through stone and creature. The bells are functional parts of the containment, not incidental decoration, and their stopping marks the established turning point.\n\nThese visual relationships support the supplied story without adding events beyond it.",
    collectorNotes: "The Cathedral of Teeth belongs to Angel & Demon Art. The cathedral’s architecture mirrors the horned creature imprisoned below it. Red light through the glass and the many faces and mouths turn the sanctuary into a reflection of what its walls conceal.\n\nFor collectors drawn to demon horror, gothic demon, cathedral, the work offers a focused image whose central choice or mystery remains faithful to its story.",
    closingArchive: "The bells have stopped and the containment is in danger. The archive leaves the creature’s escape outcome unresolved.",
    featuredDescription: "When the bells stop, the cathedral’s shape reveals the horned, many-mouthed creature the building was raised to contain beneath its foundations.",
    etsyUrl: "https://vantahollow.etsy.com/listing/4579437142",
    seo: {
      title: "The Cathedral of Teeth | The Hollow Journal | Vanta Hollow",
      description: "Explore The Cathedral of Teeth, a gothic demon horror artwork about a cathedral built in the image of the ancient creature imprisoned beneath it.",
    },
  },
  {
    entryNumber: 'Archive Entry 033',
    title: "The Dawnkeeper",
    slug: "the-dawnkeeper",
    artworkImage: "/images/journal/the-dawnkeeper/the-dawnkeeper.png",
    framedMockup: "/images/journal/the-dawnkeeper/the-dawnkeeper-framed.png",
    publishedDate: 'September 27, 2026',
    category: "Angels & Demons",
    collection: "Angel & Demon Art",
    keywords: ["dawnkeeper","celestial queen","gothic angel","golden fantasy","sunrise","celestial gate","golden cathedral","dark fantasy","guardian","celestial art"],
    relatedArticles: ["the-exiled-seraph","the-last-mercy"],
    excerpt: "The Dawnkeeper opens the eastern gate just long enough for sunrise, keeping an ancient entity from following the light into the world below.",
    story: "Before the kingdoms below learned to count their years, every sunrise passed through a single gate above the clouds.\r\n\r\nThe cathedral had been built around it, its towers rising beyond the reach of ordinary men. Generations of rulers sent offerings up the great stairway, believing the golden light beyond its doors belonged to whichever kingdom had earned the favor of heaven. They returned with blessings, prophecies, and stories of a woman dressed in white who carried a staff crowned with the symbol of the sun.\r\n\r\nThey called her the Dawnkeeper.\r\n\r\nWhat they never understood was why she stood outside the gate rather than within it.\r\n\r\nLong ago, something had crossed the threshold alongside the morning. It wore the brilliance of daylight so perfectly that no one noticed its shadow until entire cities began disappearing beneath the rising sun. The cathedral was raised to seal the passage, and the keeper was appointed to open it only long enough for dawn to enter the world.\r\n\r\nShe had performed that duty for centuries.\r\n\r\nEach morning, she climbed the steps beneath the fading moon. The stone angels watched from their pedestals. The golden standards stirred above the clouds. She raised her staff, opened the eastern gate, and waited until the first light had passed through.\r\n\r\nThen she closed it before anything else could follow.\r\n\r\nBut the thing beyond the threshold had never stopped waiting.\r\n\r\nIt learned the names of the kings who prayed there. It learned the voices of those they had lost. Eventually, it learned hers.\r\n\r\nOn the morning captured in this artwork, the cathedral doors began to open before she had touched them.\r\n\r\nShe descended the steps with her staff in hand, her crown catching the first gold along the horizon. Behind her, the moon burned bright against the cathedral spires, and something on the other side of the gate spoke in a voice she had not heard for a thousand years.\r\n\r\nShe did not turn.\r\n\r\nThe kingdoms below would see another beautiful sunrise and never know how close they had come to losing everything beneath it.\r\n\r\nThe dawn was never late. She was making sure it arrived alone.",
    behindTheCreation: "The Dawnkeeper stands before a golden celestial gate, her sun-crowned staff in hand as the first light reaches the cathedral steps. Stone angels and standards surround the moonlit approach.\n\nThe artwork holds its story at the point where she opens the eastern gate to let sunrise pass while preventing the entity beyond it from following. The familiar voice remains behind her; she does not turn toward it.",
    creativeProcess: "The gate and cathedral steps lead toward the keeper, whose staff marks the controlled passage of dawn. Golden light meets the fading moon, holding the scene at the instant before the threshold opens.\n\nThe lighting and palette reinforce this reading: Stone angels and standards surround the moonlit approach.",
    symbolism: "She opens the eastern gate to let sunrise pass while preventing the entity beyond it from following. The familiar voice remains behind her; she does not turn toward it.\n\nThe kingdoms below see another sunrise. She keeps the gate from opening completely, and what waits beyond it remains there.",
    hiddenDetails: "The staff’s sun symbol, the stone angels, and the standards reinforce the ritual’s celestial setting. The gate opens only long enough for the morning to pass, keeping the threshold’s danger present.\n\nThese visual relationships support the supplied story without adding events beyond it.",
    collectorNotes: "The Dawnkeeper belongs to Angel & Demon Art. The Dawnkeeper stands before a golden celestial gate, her sun-crowned staff in hand as the first light reaches the cathedral steps. Stone angels and standards surround the moonlit approach.\n\nFor collectors drawn to celestial queen, gothic angel, golden fantasy, the work offers a focused image whose central choice or mystery remains faithful to its story.",
    closingArchive: "The kingdoms below see another sunrise. She keeps the gate from opening completely, and what waits beyond it remains there.",
    featuredDescription: "The Dawnkeeper opens the eastern gate just long enough for sunrise, keeping an ancient entity from following the light into the world below.",
    etsyUrl: "https://vantahollow.etsy.com/listing/4582240291",
    seo: {
      title: "The Dawnkeeper | The Hollow Journal | Vanta Hollow",
      description: "Explore The Dawnkeeper, a celestial gothic fantasy artwork about the guardian who opens the gate for sunrise while keeping something ancient from following.",
    },
  },
  {
    entryNumber: "Archive Entry 034",
    title: "The Aftershow",
    slug: "the-aftershow",
    artworkImage: "/images/journal/the-aftershow/the-aftershow.png",
    framedMockup: "/images/journal/the-aftershow/the-aftershow-framed.png",
    publishedDate: "October 6, 2026",
    category: "Creepy Clowns",
    collection: "Creepy Clowns",
    keywords: ["the aftershow","evil clown","creepy clown","horror clown","backstage mirror","carnival horror","clown reflection","gothic horror","missing performers"],
    relatedArticles: ["the-show-never-ends","the-one-who-stayed"],
    excerpt: "After the crowd leaves, a clown breaks the backstage rule about the final mirror. His reflection moves on its own, and the faces of missing performers gather behind it.",
    story: "Everyone thought the show ended when the lights went out.\n\nThe performers knew better.\n\nThere were rules backstage that nobody explained to new hires. Never whistle after midnight. Never answer knocking from an empty dressing room. And whatever happened, never use the last mirror after the audience had gone home.\n\nMost clowns laughed when they heard that one.\n\nHe did too.\n\nFor years, the old washroom sat behind the final dressing room, untouched except for performers too drunk, tired, or careless to remember the stories. The mirror was clouded with age. The tiles were stained beyond cleaning. Costumes from acts nobody remembered still hung from the pipes above the sink.\n\nThen one night, after the final applause had faded and the carnival grounds had fallen silent, he went inside alone.\n\nHe only wanted to remove the makeup.\n\nThe bulb above the mirror flickered as he leaned over the sink.\n\nHis reflection looked exhausted.\n\nThen it raised its head.\n\nHe had not.\n\nThe clown stared at it.\n\nThe thing in the mirror stared back.\n\nFor several seconds neither moved.\n\nThen the reflection opened its mouth.\n\nThe jaw dropped farther than bone should allow. Rows of narrow teeth unfolded from the darkness inside it while yellow eyes ignited beneath cracked white makeup. Long black fingers lifted slowly toward its face as though preparing for an audience only it could see.\n\nHe stepped backward.\n\nThe reflection moved closer.\n\nThat was when he noticed the others.\n\nFaces were beginning to appear behind it.\n\nOld performers.\n\nMissing clowns.\n\nPeople whose photographs still hung in rusted frames along the backstage corridor.\n\nSome had been gone for decades.\n\nAll of them were watching.\n\nThe door behind him slammed shut.\n\nMusic began somewhere beyond the wall.\n\nNot the carnival music from outside.\n\nSomething older.\n\nSlower.\n\nThe reflection placed both hands against the glass.\n\nThe surface bent beneath its fingers.\n\nFor the first time, he understood why the old performers had called it the aftershow.\n\nThe paying audience never saw it.\n\nThe performers were the audience.\n\nAnd eventually, every act was expected to take the stage.",
    behindTheCreation: "The Aftershow centers a male clown at the final backstage mirror, after the carnival has gone quiet. His reflection has begun to move independently, while missing performers gather behind it. The old washroom turns an ordinary act of removing makeup into the instant the forbidden rule becomes real.\n\nThe horror comes from recognition: the reflection is not alone, and the performers have become the audience for something the paying crowd never sees.",
    creativeProcess: "The mirror divides the scene between the exhausted clown and the distorted figure answering him. The figures behind the reflection extend that reveal into the corridor’s history, while the stained tiles, old bulb, and hanging costumes keep the setting grounded in a neglected backstage washroom.\n\nCracked white makeup, yellow eyes, narrow teeth, and long black fingers give the reflection its unsettling focal point. The stillness before it reaches the glass holds the image at the story’s last unresolved moment.",
    symbolism: "The final mirror represents the rule performers were warned not to break after the audience went home. Its independent reflection makes the boundary between performer and image uncertain.\n\nThe missing clowns behind it change the meaning of an audience. The paying crowd never sees the aftershow; the performers themselves are expected to watch, with what happens to this clown left unknown.",
    hiddenDetails: "The mirror is clouded with age, the washroom tiles are stained, and forgotten costumes hang from the pipes above the sink. These neglected details place the encounter in a space performers had avoided for years.\n\nBehind the reflection are the faces of missing clowns whose photographs remain in rusted corridor frames. The reflection’s yellow eyes, cracked makeup, teeth, and fingers are part of the reveal described in the story.",
    collectorNotes: "The Aftershow belongs to Creepy Clowns. Its forbidden mirror and missing performers make backstage space itself part of the horror, carrying the story from a quiet washroom into an unseen performance.\n\nThe related entries The Show Never Ends and The One Who Stayed are thematic companions only; this story is not canonically connected to either one.",
    closingArchive: "The paying audience never sees the aftershow. The performers become its audience, and every act is expected to take the stage. What happens to the clown after the glass bends remains unknown.",
    featuredDescription: "A grotesque clown horror artwork about a backstage mirror that reveals the performance waiting after the carnival lights go dark.",
    etsyUrl: "https://vantahollow.etsy.com/listing/4589473508",
    seo: {
      title: "The Aftershow | The Hollow Journal | Vanta Hollow",
      description: "Explore The Aftershow, a creepy clown horror story about a forbidden backstage mirror, missing performers, and the real show that begins after the audience goes home.",
    },
  },
  {
    entryNumber: "Archive Entry 035",
    title: "The House That Hunts",
    slug: "the-house-that-hunts",
    artworkImage: "/images/journal/the-house-that-hunts/the-house-that-hunts.png",
    framedMockup: "/images/journal/the-house-that-hunts/the-house-that-hunts-framed.png",
    publishedDate: "October 6, 2026",
    category: "Dark Fairytales",
    collection: "Dark Fairytales",
    keywords: ["house that hunts","dark fairytale","gothic wolf","haunted house","red cloak","wolf house","gothic horror","haunted woods","monstrous house","dark fantasy"],
    relatedArticles: ["the-final-rescue","blackthorn-hall"],
    excerpt: "A red-cloaked traveler reaches a woodland house with watching windows, a fanged entrance, and something horned waiting inside. She steps toward its open door, but the story stops there.",
    story: "Nobody in the village called it a house.\n\nThey called it the thing in the woods.\n\nIt had been standing beyond the dead trees for longer than anyone could remember, though no map showed a road leading to it. Hunters occasionally found footprints near the old path. Travelers sometimes reported seeing orange lights burning between the branches.\n\nBut anyone who followed them disappeared.\n\nThe stories disagreed about what lived inside.\n\nSome said a witch had built the place from the bones of wolves.\n\nOthers insisted the house itself was the creature.\n\nFrom a distance, it looked almost ordinary — crooked roofs, narrow windows, weathered timber rising against the moon.\n\nUp close, the illusion ended.\n\nThe windows watched.\n\nThe beams curved like ribs.\n\nA massive snout pushed outward from the lower walls, its mouth forming the entrance beneath rows of enormous teeth. A horned skull hung above the doorway like a warning no sane person should have needed.\n\nAnd still, people went inside.\n\nThat was the strange part.\n\nThey climbed the steps willingly.\n\nSome followed voices coming from the upper rooms. Others saw people they had lost standing behind the glowing windows. A few claimed the house promised them exactly what they wanted most.\n\nIt never promised they could leave.\n\nThe red-cloaked traveler had heard every version of the story before reaching the clearing.\n\nThen she saw the figures in the windows.\n\nToo many of them.\n\nSome stood perfectly still behind the firelight. Others pressed against the glass. One leaned from the highest window, reaching toward her with a hand far too long to belong to anything human.\n\nAlong the path, skulls hung from chains and wooden posts.\n\nA raven watched from beside the stairs.\n\nThe front door was already open.\n\nDeep inside the mouth of the house, beyond the teeth and candlelight, something horned waited at the end of the hall.\n\nShe should have turned around.\n\nInstead, she took one step forward.",
    behindTheCreation: "The House That Hunts places a red-cloaked traveler before a woodland mansion whose entrance is also a fanged mouth. Watching figures fill the windows; beyond the candlelight, something horned waits inside. The story leaves open whether the house is a creature or shelters one.\n\nThe traveler has heard the warnings and sees the figures, yet the image holds on her voluntary first step toward the open door.",
    creativeProcess: "The approach along the old path leads from dead trees and hanging skulls toward the house’s teeth-framed entrance. Narrow windows and crooked roofs first suggest a mansion, while rib-like beams and the outward-pushing snout unsettle that familiar shape.\n\nOrange light behind the windows and candlelight deeper in the hall stand out against the moonlit woods. The red cloak gives the traveler a clear presence within the dark fairytale setting.",
    symbolism: "The glowing windows make the house a lure: it can offer voices, lost loved ones, or a visitor’s deepest desire, but never promises a way out. Its watching windows and open mouth give that invitation a predatory shape.\n\nThe traveler’s single step keeps the ending suspended. The exact nature and origin of the house remain uncertain, and the story does not tell whether she enters or survives.",
    hiddenDetails: "The beams curve like ribs around the timber structure, and a massive snout pushes from its lower walls to form the toothed entrance. A horned skull hangs above the doorway.\n\nThe path holds chained skulls and wooden posts; a raven watches beside the stairs. Behind the windows, several figures watch or press against the glass, while a long-reaching figure leans from the highest window.",
    collectorNotes: "The House That Hunts belongs to Dark Fairytales. Its red-cloaked traveler, moonlit woods, and monstrous mansion bring familiar fairytale imagery to a threshold where attraction and danger remain tangled.\n\nRelated entries offer thematic echoes in haunted architecture; they do not establish a shared origin or canon for this house.",
    closingArchive: "The traveler takes one step toward the open entrance. The story does not say whether she enters, survives, or discovers what the house truly is.",
    featuredDescription: "A dark fairytale artwork about a living woodland mansion whose glowing windows, fanged entrance, and impossible promises lure travelers from the path.",
    etsyUrl: "https://vantahollow.etsy.com/listing/4587562662",
    seo: {
      title: "The House That Hunts | The Hollow Journal | Vanta Hollow",
      description: "Explore The House That Hunts, a dark fairytale horror story about a red-cloaked traveler and a monstrous woodland house that lures visitors inside.",
    },
  },
  {
    entryNumber: "Archive Entry 036",
    title: "The Wyrm's Reckoning",
    slug: "the-wyrms-reckoning",
    artworkImage: "/images/journal/the-wyrm's-reckoning/the-wyrm's-reckoning.png",
    framedMockup: "/images/journal/the-wyrm's-reckoning/the-wyrm's-reckoning-framed.png",
    publishedDate: "October 6, 2026",
    category: "Horror",
    collection: "Horror",
    keywords: ["wyrms reckoning","grim reaper","gothic dragon","horror art","dragon rider","skeletal reaper","crimson fire","ancient oath","royal debt","gothic horror"],
    relatedArticles: ["the-moonbound-warden","the-last-oath"],
    excerpt: "The royal bloodline has ended, and the reaper returns riding the wyrm he once bound. As the dragon rises in crimson fire, the kingdom’s promised debt finally comes due.",
    story: "The kingdom had been built on a promise its rulers never intended to keep.\n\nCenturies earlier, when the last great wyrm threatened to reduce the capital to ash, the royal family summoned a figure from beyond the boundary of death. He arrived wearing a black hood, carrying a blade no mortal forge could reproduce, and offered them a bargain.\n\nHe would bind the creature.\n\nThe kingdom would belong to him when the royal bloodline ended.\n\nDesperate to survive, the king agreed.\n\nThe dragon vanished into the mountains. Its fire disappeared from the skies. Its name was erased from the histories, and the kingdom grew rich beneath a peace it mistook for victory. Generations passed. The bargain became a superstition. The hooded figure who had saved them was reduced to a warning used to frighten children.\n\nBut the reaper had never forgotten.\n\nEvery oath was etched into the metal he carried. Every dead monarch became another witness to the covenant. Their skulls did not rest. They followed him through smoke and shadow, glowing red in the storm like a chorus of the condemned.\n\nWhen the final heir died, the priests tried to destroy the agreement.\n\nThey shattered the seals beneath the palace. They burned the royal records. They declared the ancient debt void.\n\nThat night, the mountains split with crimson fire.\n\nThe dragon rose first, no longer buried, no longer bound, its jaws blazing with the same infernal red that lit the storm around it. Then came the reaper astride its back, cloak billowing like a funeral banner, skeletal hands wrapped around the reins as he lowered the blade that had once imprisoned the beast.\n\nThe people believed he had returned to save them again.\n\nThen they saw the dragon carrying him.\n\nIt had never been his enemy.\n\nIt had been his prisoner, his weapon, and the living guarantee of a debt the kingdom had spent centuries pretending it no longer owed.\n\nAbove the burning cliffs, the skulls of the dead gathered in the smoke. Below, the kingdom waited for mercy that was never part of the bargain.\n\nThe reaper lifted his blade.\n\nThe dragon opened its mouth.\n\nAnd the reckoning finally began.",
    behindTheCreation: "The Wyrm's Reckoning brings the reaper back on the dragon he once bound, with crimson fire splitting the mountains and the dead monarchs’ skulls gathering in the smoke. The riding figure makes the truth of their bargain visible: the wyrm was never his enemy.\n\nThe final heir has died, the priests’ attempt to erase the covenant has failed, and the kingdom’s old promise is now being claimed.",
    creativeProcess: "The dragon and reaper form the scene’s dominant silhouette above the burning cliffs. The raised blade and skeletal hands on the reins place the moment after the return but before the debt’s outcome is known.\n\nCrimson fire lights the wyrm’s jaws and the storm, while smoke gathers the skulls of the dead monarchs overhead. The contrast between the great living creature and the hooded rider emphasizes the bargain that joined their fates.",
    symbolism: "The reaper’s blade carries the oath etched into its metal, and the monarch skulls follow as witnesses to the covenant. The royal family accepted the bargain willingly: the wyrm would be bound, and the kingdom would pass to the reaper when their bloodline ended.\n\nThe dragon is his former prisoner, weapon, and guarantee of the debt, never his enemy. The rising fire signals that the reckoning begins; what becomes of the kingdom remains unresolved.",
    hiddenDetails: "The blade links the present moment to the original bargain: it is the weapon that bound the wyrm, and the oaths were etched into the metal. The skulls in the smoke belong to dead monarchs, witnesses who have not been allowed to rest.\n\nThe dragon carries the reaper above the cliffs rather than facing him in combat. Its crimson-lit jaws and his lowered blade hold the story at the beginning of the reckoning, without showing the kingdom’s final fate.",
    collectorNotes: "The Wyrm's Reckoning belongs to Horror. Its skeletal rider, bound dragon, and crimson storm bring the old royal debt into a single dramatic image. The dragon remains the reaper’s former prisoner and the living guarantee of the covenant.\n\nFor collectors drawn to gothic dragons, reapers, and ancient oaths, the piece holds the moment the debt comes due without inventing what happens to the kingdom afterward.",
    closingArchive: "The reaper lifts his blade and the dragon opens its mouth. The reckoning has begun; the story leaves the kingdom’s destruction or survival beyond its final moment.",
    featuredDescription: "A brutal gothic horror artwork about a reaper returning atop the dragon he once bound to collect a kingdom promised centuries earlier.",
    etsyUrl: "https://vantahollow.etsy.com/listing/4584780678",
    seo: {
      title: "The Wyrm's Reckoning | The Hollow Journal | Vanta Hollow",
      description: "Explore The Wyrm's Reckoning, a gothic horror tale of a skeletal reaper, a bound dragon, and the ancient royal debt that finally comes due.",
    },
  }
];

const archiveFilters = ['All', 'Dark Fantasy', 'Horror', 'Sugar Skulls', 'Dark Fairytales', 'Creepy Clowns', 'Angels & Demons', 'Newest', 'Oldest'];

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
        <p>Vanta Hollow specializes in dark fantasy, gothic, horror, sugar skull, dark fairytale, Creepy Clown Art, and Angel &amp; Demon Art. Every piece is selected to bring atmosphere, mystery, and cinematic beauty into your space.</p>
      ),
    },
    {
      question: 'What Sizes Are Available?',
      answer: (
        <>
          <p>Posters are available in:</p>
          <ul>
            <li>8x10</li>
            <li>8x12</li>
            <li>9x11</li>
            <li>11x14</li>
            <li>12x16</li>
            <li>12x18</li>
            <li>16x20</li>
            <li>16x24</li>
            <li>18x24</li>
            <li>20x30</li>
            <li>24x32</li>
            <li>24x36</li>
            <li>30x40</li>
            <li>36x48</li>
            <li>36x54</li>
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
