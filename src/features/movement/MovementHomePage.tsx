import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../app/config/routes';
import { HomepageFooter } from '../footer';
import { ArrowRight } from 'lucide-react';
import { PRODUCT_STORY_ITEMS } from '../story/productStoryData';
import { websiteService, type MovementHomeContent } from '../../services/api/websiteService';

/**
 * MovementHomePage — approved Home design, CMS-driven content.
 *
 * Content source: HQ movement Home CMS (hero + Join The Mission cards).
 * If the CMS is unavailable or empty, the approved fallback content below
 * keeps the page identical to the previously approved version.
 *
 * DESIGN + LAYOUT + INTERACTION stay in this component — the CMS only
 * supplies content (text, destinations, images).
 */

const FALLBACK_HOME = {
  headline: 'We Build. We Move. We Serve.',
  description:
    'A movement of Muslims who train their body, strengthen their faith, and build a better ummah.',
  ctaLabel: 'Join The Mission',
  ctaDestination: 'mission',
  socialProofNumber: '12K+',
  socialProofText: 'Muslims are moving together',
  desktopImage: '',
  mobileImage: '',
};

const FALLBACK_CARDS = [
  {
    id: 'fallback-1',
    title: 'Vote Now',
    description: 'What should we do next?',
    image: PRODUCT_STORY_ITEMS[1].mediaUrl,
    destination: 'mission',
    displayOrder: 1,
  },
  {
    id: 'fallback-2',
    title: 'Real Impact',
    description: "See what we're building together.",
    image: PRODUCT_STORY_ITEMS[0].mediaUrl,
    destination: 'impact',
    displayOrder: 2,
  },
  {
    id: 'fallback-3',
    title: 'Performance',
    description: 'Gear that moves with you.',
    image: PRODUCT_STORY_ITEMS[2].mediaUrl,
    destination: 'shop',
    displayOrder: 3,
  },
  {
    id: 'fallback-4',
    title: 'Donate Now',
    description: 'Help someone move forward.',
    image: PRODUCT_STORY_ITEMS[3].mediaUrl,
    destination: 'donate',
    displayOrder: 4,
  },
];

const FALLBACK_CONTENT: MovementHomeContent = {
  home: FALLBACK_HOME,
  cards: FALLBACK_CARDS,
};

/**
 * Controlled destination mapping. The CMS stores a slug; the frontend owns
 * the actual routes. Impact uses the existing /journal route (user-facing
 * "IMPACT" page).
 */
const HOME_DESTINATION_ROUTES: Record<string, string> = {
  mission: ROUTES.MISSION,
  impact: ROUTES.JOURNAL,
  shop: ROUTES.SHOP,
  donate: ROUTES.DONATE,
};

function resolveHomeDestination(destination: string | undefined): string {
  return HOME_DESTINATION_ROUTES[String(destination || 'mission')] || ROUTES.MISSION;
}

/** Splits the CMS headline into the existing three-line treatment. */
function splitHeadlineLines(headline: string): string[] {
  const parts = String(headline || '')
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length <= 1) return parts.length === 1 ? [parts[0]] : [];
  return parts.map((part) => `${part}.`);
}

function useIsMobileViewport(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches,
  );

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return isMobile;
}

export function MovementHomePage() {
  const [content, setContent] = useState<MovementHomeContent>(FALLBACK_CONTENT);
  const isMobile = useIsMobileViewport();

  useEffect(() => {
    let isActive = true;
    websiteService
      .getMovementHome()
      .then((result) => {
        if (!isActive || !result?.home) return;
        setContent({
          home: { ...FALLBACK_HOME, ...result.home },
          cards: Array.isArray(result.cards) && result.cards.length > 0 ? result.cards : FALLBACK_CARDS,
        });
      })
      .catch(() => {
        // CMS unavailable → approved fallback stays rendered.
      });
    return () => {
      isActive = false;
    };
  }, []);

  const heroImage = isMobile
    ? content.home.mobileImage || content.home.desktopImage
    : content.home.desktopImage || content.home.mobileImage;
  const headlineLines = splitHeadlineLines(content.home.headline);

  return (
    <div
      className="bg-[#0A0A0A] min-h-screen text-white flex flex-col font-['SF-Pro-Display',_sans-serif]"
    >
      <main className="flex-grow flex flex-col">
        {/* HERO SECTION */}
        <section className="relative w-full min-h-[85vh] sm:min-h-screen flex flex-col justify-end pb-24 sm:pb-32 px-6 sm:px-12 lg:px-24">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/60 via-neutral-900/80 to-[#0A0A0A] z-10" />
            {heroImage ? (
              <img
                src={heroImage}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#1A1A1A] object-cover" />
            )}
          </div>

          <div className="relative z-20 max-w-4xl">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight uppercase leading-[0.95] mb-6">
              {headlineLines.length > 0 ? (
                headlineLines.map((line, index) => (
                  <span key={index} className={`block ${index % 2 === 1 ? 'text-neutral-400' : ''}`}>
                    {line}
                  </span>
                ))
              ) : (
                <span className="block">We Build.</span>
              )}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-md mb-10 leading-relaxed">
              {content.home.description}
            </p>

            <Link
              to={resolveHomeDestination(content.home.ctaDestination)}
              className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-semibold text-sm tracking-wide uppercase transition-transform hover:scale-105"
            >
              {content.home.ctaLabel}
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>

            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] bg-neutral-800" />
                <div className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] bg-neutral-700" />
                <div className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] bg-neutral-600" />
              </div>
              <div>
                <p className="font-bold text-lg leading-none">{content.home.socialProofNumber}</p>
                <p className="text-xs text-neutral-400">{content.home.socialProofText}</p>
              </div>
            </div>
          </div>
        </section>

        {/* JOIN THE MISSION CARDS */}
        <section className="px-4 sm:px-12 lg:px-24 py-12 sm:py-24 bg-white relative z-20 text-neutral-900">
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-neutral-500 uppercase mb-2 sm:mb-3">One Mission</h2>
            <p className="text-2xl sm:text-4xl font-bold uppercase tracking-tight">Join The Mission</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {content.cards.map((card, index) => {
              const displayOrder = Number(card.displayOrder) || index + 1;
              const cardNumber = String(displayOrder).padStart(2, '0');
              return (
                <Link
                  key={card.id ?? index}
                  to={resolveHomeDestination(card.destination)}
                  className="group relative block aspect-[2/1] sm:aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${card.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 z-10" />
                  <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 text-[120px] sm:text-[180px] leading-none font-bold text-white opacity-[0.12] select-none z-10 pointer-events-none tracking-tighter">
                    {cardNumber}
                  </div>
                  <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end sm:justify-between z-20 text-white">
                    <div className="hidden sm:flex justify-between items-start">
                      <span className="text-xs font-semibold tracking-widest text-white/80">{cardNumber}</span>
                    </div>
                    <div className="flex justify-between items-end gap-4">
                      <div>
                        <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-tight mb-1 sm:mb-2 leading-tight">
                          {card.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-white/80 leading-snug">
                          {card.description}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 transition-all group-hover:bg-white group-hover:text-black">
                        <ArrowRight size={18} strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      {/* Adjust footer padding on mobile so it doesn't get hidden behind bottom nav */}
      <div className="pb-[100px] lg:pb-0 bg-white">
        <HomepageFooter />
      </div>
    </div>
  );
}
