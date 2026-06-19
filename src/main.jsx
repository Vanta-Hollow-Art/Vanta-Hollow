import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Menu,
} from 'lucide-react';
import './styles.css';

const etsyShop = 'https://vantahollow.etsy.com';
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
    name: 'Premium Canvases',
    label: 'Premium Canvases',
    image: '/images/categories/premium-canvases.jpg',
    href: 'https://www.etsy.com/shop/vantahollow/?etsrc=sdt&section_id=57721612',
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

function Wordmark({ footer = false }) {
  return (
    <img
      className={footer ? 'wordmark-img footer-wordmark' : 'wordmark-img'}
      src="/images/mockup/logo-header.png"
      alt="Vanta Hollow"
    />
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
        <p>Vanta Hollow specializes in dark fantasy, gothic, horror, sugar skull, and dark fairytale artwork. Every piece is selected to bring atmosphere, mystery, and cinematic beauty into your space.</p>
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
  const isFAQ = currentPath === '/faq';
  const isContact = currentPath === '/contact';
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="site-shell">
      <div className="announcement">
        <img src="/images/mockup/announcement-left.png" alt="" aria-hidden="true" />
        <span>GOTHIC QUEENS &#8226; HAUNTED KINGDOMS &#8226; HORROR &#8226; DARK FAIRYTALES</span>
        <img src="/images/mockup/announcement-right.png" alt="" aria-hidden="true" />
      </div>

      <header className="site-header">
        <div className="brand" aria-label="Vanta Hollow">
          <Wordmark />
        </div>

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
        ) : isContact ? (
          <ContactPage />
        ) : (
          <>
        <section className="hero" id="home">
          <div className="hero-copy">
            <img className="welcome-art" src="/images/mockup/ornament-short.png" alt="Welcome To" />
            <h1>
              <img src="/images/generated/hero-wordmark-mockup-transparent.png" alt="Vanta Hollow" />
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

        <section className="collections" id="collections">
          <div className="section-heading">
            <img src="/images/mockup/ornament-heading-left.png" alt="" aria-hidden="true" />
            <div>
              <h2>Enter The Hollow</h2>
              <p>Art for Those Who Walk in Darkness</p>
            </div>
            <img src="/images/mockup/ornament-heading-right.png" alt="" aria-hidden="true" />
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
            <a className="button" href="https://www.etsy.com/shop/vantahollow/?etsrc=sdt&section_id=56626705" {...etsyLinkProps}>
              Shop Favorites <span aria-hidden="true">&rsaquo;</span>
            </a>
          </div>
          <img src="/images/mockup/featured-bg-responsive.png" alt="Framed Vanta Hollow artwork on a dark wall" />
        </section>
          </>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <section>
            <Wordmark footer />
            <p>
              Dark fantasy wall art for the souls
              <br />
              who live in the shadows.
            </p>
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
              <a href="https://in.pinterest.com/VantaHollow/" target="_blank" rel="noreferrer" aria-label="Pinterest">
                <SocialIcon type="pinterest" />
              </a>
            </div>
          </section>

          <section className="newsletter">
            <h2>Join The Hollow</h2>
            <p>Get early access to all new art, exclusive drops and dark inspiration.</p>
            <NewsletterSignup />
          </section>

          <section className="quick-links">
            <h2>Quick Links</h2>
            <div>
              <a href={etsyShop} {...etsyLinkProps}>Shop All</a>
              <a href="/#collections">Collections</a>
              <a href="/about">About Us</a>
              <a href={`${etsyShop}#reviews`} {...etsyLinkProps}>Reviews</a>
              <a href="/faq">FAQ</a>
              <a href="/contact">Contact</a>
              <a href={shopPoliciesUrl} {...etsyLinkProps}>Shop Policies</a>
              <a href={etsyShop} {...etsyLinkProps}>Etsy Shop</a>
            </div>
          </section>

          <p className="copyright">
            &copy; 2026 Vanta Hollow. All rights reserved.
          </p>
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
