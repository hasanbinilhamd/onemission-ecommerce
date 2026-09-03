import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CatalogLayer, CollectionPageCatalog } from '../features/catalog';
import { createHeroGradient } from '../features/hero/theme';
import {
  DURATION,
  GRAIN_SVG,
  HERO_GRADIENTS,
  HeroCarouselImages,
  HeroGradientBackground,
  clamp,
  mapHeroItems,
  useHeroGesture,
  type Direction,
} from '../features/hero/carousel';
import { HomepageFooter } from '../features/footer';
import {
  type WebsiteBrandVideo,
  type WebsiteHeroItem as WebsiteHeroCmsItem,
} from '../services/api/websiteService';
import {
  getHomepageContentForInitialExperience,
  ONEMISSION_LOGO_URL,
} from '../features/homepage/initialHomepageResources';

const DEFAULT_WEBSITE_HERO_ITEMS: WebsiteHeroCmsItem[] = [
  {
    id: 'default-hero-1',
    mediaType: 'image',
    desktopUrl: '',
    mobileUrl: '',
    displayOrder: 1,
    active: true,
  },
  {
    id: 'default-hero-2',
    mediaType: 'image',
    desktopUrl: '',
    mobileUrl: '',
    displayOrder: 2,
    active: true,
  },
  {
    id: 'default-hero-3',
    mediaType: 'image',
    desktopUrl: '',
    mobileUrl: '',
    displayOrder: 3,
    active: true,
  },
  {
    id: 'default-hero-4',
    mediaType: 'image',
    desktopUrl: '',
    mobileUrl: '',
    displayOrder: 4,
    active: true,
  },
];

const DEFAULT_BRAND_VIDEO: WebsiteBrandVideo = {
  id: 'default-brand-video',
  videoUrl: '',
  posterUrl: '',
  active: true,
};


const COLLECTION_REVEAL_SCROLL_RANGE = 220;
const COLLECTION_OVERLAP = 'max(0px, -10vh)';

interface ShopPageProps {
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onProductSelect: (slug: string) => void;
  onCollectionSelect: () => void;
}

export function ShopPage({ activeIndex, onActiveIndexChange, onProductSelect, onCollectionSelect }: ShopPageProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );
  const [collectionRevealProgress, setCollectionRevealProgress] = useState(0);
  const [heroCmsItems, setHeroCmsItems] = useState<WebsiteHeroCmsItem[]>(DEFAULT_WEBSITE_HERO_ITEMS);
  const [brandVideo, setBrandVideo] = useState<WebsiteBrandVideo | null>(DEFAULT_BRAND_VIDEO);
  // Keep CMS brand video state loaded for future section reactivation without rendering it in the current Homepage flow.
  void brandVideo;
  const heroItems = useMemo(() => mapHeroItems(heroCmsItems), [heroCmsItems]);
  const heroGradients = useMemo(() => {
    if (heroItems.length === 0) {
      return [HERO_GRADIENTS[0]];
    }

    return heroItems.map((item) => createHeroGradient(item.theme.accentColor));
  }, [heroItems]);
  const resolvedActiveIndex = heroItems.length > 0 ? activeIndex % heroItems.length : 0;
  const heroSceneRef = useRef<HTMLElement | null>(null);
  const collectionSceneRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadWebsiteContent = async () => {
      try {
        const response = await getHomepageContentForInitialExperience();
        if (isCancelled) {
          return;
        }

        setHeroCmsItems(Array.isArray(response.heroItems) ? response.heroItems : []);
        setBrandVideo(response.brandVideo ?? null);
      } catch {
        // Keep the existing fallback content when the CMS request is unavailable.
      }
    };

    void loadWebsiteContent();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (heroItems.length === 0) {
      return;
    }

    if (activeIndex >= heroItems.length) {
      onActiveIndexChange(0);
    }
  }, [activeIndex, heroItems.length, onActiveIndexChange]);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current !== null) return;

      rafRef.current = window.requestAnimationFrame(() => {
        const nextProgress = clamp(window.scrollY / COLLECTION_REVEAL_SCROLL_RANGE, 0, 1);
        setCollectionRevealProgress((currentProgress) => {
          if (Math.abs(currentProgress - nextProgress) < 0.01) {
            return currentProgress;
          }
          return nextProgress;
        });

        const viewportHeight = window.innerHeight || 1;
        const collectionSceneTop = collectionSceneRef.current?.getBoundingClientRect().top ?? viewportHeight;
        const synchronizedHeroShift = clamp(collectionSceneTop, -viewportHeight, 0);

        if (heroSceneRef.current) {
          heroSceneRef.current.style.setProperty('--scene-shift-y', `${synchronizedHeroShift}px`);
        }

        rafRef.current = null;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const rotateHero = useCallback((direction: Direction) => {
    if (isAnimating || heroItems.length <= 1) return;

    setIsAnimating(true);
    const nextIndex = direction === 'next'
      ? (resolvedActiveIndex + 1) % heroItems.length
      : (resolvedActiveIndex + heroItems.length - 1) % heroItems.length;
    onActiveIndexChange(nextIndex);
    window.setTimeout(() => setIsAnimating(false), DURATION);
  }, [heroItems.length, isAnimating, onActiveIndexChange, resolvedActiveIndex]);

  const heroGesture = useHeroGesture({
    surfaceRef: heroSceneRef,
    rotateHero,
    onTap: onCollectionSelect,
  });


  return (
    <div
      style={{
        fontFamily: "'SF-Pro-Display', sans-serif",
        backgroundColor: '#0A0A0A',
      }}
    >
      <section
        ref={heroSceneRef}
        tabIndex={0}
        aria-label="Featured editorial hero carousel"
        aria-roledescription="carousel"
        aria-live="off"
        onKeyDown={heroGesture.onKeyDown}
        className="relative w-full overflow-hidden outline-none"
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          transform: 'translate3d(0, var(--scene-shift-y, 0px), 0)',
          willChange: 'transform',
        }}
      >
        <div className="relative w-full h-full" style={{ overflow: 'hidden' }}>
          <HeroGradientBackground activeIndex={resolvedActiveIndex} gradients={heroGradients} />

          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 1,
              background: 'linear-gradient(180deg, rgba(10,10,10,0.12) 0%, rgba(10,10,10,0.04) 44%, rgba(229,228,226,0.08) 100%)',
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 50,
              backgroundImage: `url("${GRAIN_SVG}")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '200px 200px',
              opacity: 0.4,
            }}
          />

          <div
            className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none"
            style={{
              zIndex: 2,
              top: isMobile ? '10%' : '18%',
              fontFamily: "'SF-Pro-Display', sans-serif",
              fontSize: isMobile ? 'clamp(120px, 36vw, 170px)' : 'clamp(70px, 19vw, 380px)',
              fontWeight: 400,
              color: '#ffffff',
              opacity: 0.6,
              lineHeight: isMobile ? 0.68 : 1,
              textTransform: 'lowercase',
              letterSpacing: '-0.08em',
              whiteSpace: 'nowrap',
              padding: '0 10px',
            }}
          >
            {isMobile ? (
              <>
                values
                <br />
                matter
              </>
            ) : (
              'VALUES MATTER'
            )}
          </div>

          <HeroCarouselImages
            items={heroItems}
            activeIndex={resolvedActiveIndex}
            isMobile={isMobile}
            onPointerDown={heroGesture.onPointerDown}
            onPointerMove={heroGesture.onPointerMove}
            onPointerUp={heroGesture.onPointerUp}
            onPointerCancel={heroGesture.onPointerCancel}
          />

          <div
            className="absolute top-3 left-4 sm:left-8"
            style={{
              zIndex: 60,
              color: '#ffffff',
              opacity: 0.9,
              letterSpacing: '0.18em',
            }}
          >
            <img
              src={ONEMISSION_LOGO_URL}
              alt="ONEMISSION"
              className="h-8 md:h-14 w-auto"
            />
          </div>


          <div
            className="hidden sm:block absolute sm:bottom-1/3 sm:left-0 w-screen"
            style={{ zIndex: 60 }}
          >
            {/* <p
              className="bold uppercase tracking-widest mb-2 sm:mb-3 text-base sm:text-[22px]"
              style={{
                color: '#ffffff',
                opacity: 0.95,
                letterSpacing: '0.02em',
                fontWeight: 700,
              }}
            >
              TOONHUB FIGURINES
            </p> */}
            {/* <p
              className="hidden sm:block text-xs sm:text-sm mb-4 sm:mb-5"
              style={{
                color: '#ffffff',
                opacity: 0.85,
                lineHeight: 1.6,
              }}
            >
              The artwork is stunning, shipped fully prepared. The finish is a
              vision, the 3D craft is flawless. Many thanks! Wishing you the win.
              Order now.
            </p> */}
            <div className="flex justify-between px-10 items-center">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => rotateHero('prev')}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: 'transparent',
                  // border: '2px solid #ffffff',
                  color: '#ffffff',
                  transition: 'transform 150ms ease, background-color 150ms ease',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform = 'scale(1.08)';
                  event.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = 'scale(1)';
                  event.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <ArrowLeft size={26} strokeWidth={2.25} />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => rotateHero('next')}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: 'transparent',
                  // border: '2px solid #ffffff',
                  color: '#ffffff',
                  transition: 'transform 150ms ease, background-color 150ms ease',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform = 'scale(1.08)';
                  event.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = 'scale(1)';
                  event.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <ArrowRight size={26} strokeWidth={2.25} />
              </button>
            </div>
          </div>

          {/* <a
            href="#"
            onClick={handleDiscoverClick}
            className="absolute bottom-6 right-4 sm:bottom-20 sm:right-10 flex items-center"
            style={{
              zIndex: 60,
              fontFamily: "'Chakra Petch', sans-serif",
              fontSize: 'clamp(24px, 3vw, 40px)',
              fontWeight: 500,
              color: '#ffffff',
              opacity: 0.95,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'opacity 200ms ease',
              border: '2px solid #ffffff',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              gap: '0.5rem',

              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'none',
              WebkitBackdropFilter: 'none',

              borderTop: '2px solid rgba(255,255,255,0.5)',
              borderBottom: '2px solid rgba(255,255,255,0.5)',
              borderLeft: '0',
              borderRight: '0',

              boxShadow:
                '0 10px 15px -3px rgba(0,0,0,0.2), 0 4px 6px -4px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.opacity = '0.95';
            }}
          >
            SHOP NOW
            <ArrowRight className="w-5 h-5 sm:w-8 sm:h-8" strokeWidth={2.25} />
          </a> */}
        </div>
      </section>

      <section
        ref={collectionSceneRef}
        aria-label="Brand quote"
        style={{
          position: 'relative',
          zIndex: 60,
          marginTop: COLLECTION_OVERLAP,
          backgroundColor: 'transparent',
          boxShadow: '0 -18px 48px rgba(0,0,0,0.16)',
          overflow: 'hidden',
          transform: 'translate3d(0,0,0)',
          willChange: 'border-radius',
        }}
      >
        <CatalogLayer
          revealProgress={collectionRevealProgress}
          onProductSelect={onProductSelect}
        />
      </section>

      <div id="collection">
        <CollectionPageCatalog onProductSelect={onProductSelect} mode="homepage" />
      </div>

      {/* {brandVideo ? (
        <section
          aria-label="Brand video section"
          style={{
            position: 'relative',
            minHeight: isMobile ? 'auto' : '100vh',
            width: '100%',
            overflow: 'hidden',
            backgroundColor: '#000000',
          }}
        >
          <video
            src={brandVideo.videoUrl}
            poster={brandVideo.posterUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            controls={false}
            style={{
              width: '100%',
              height: isMobile ? 'auto' : '100vh',
              objectFit: isMobile ? 'contain' : 'cover',
              display: 'block',
            }}
          />
        </section>
      ) : null} */}

      {/* Product Story and Collection CTA are intentionally hidden on Homepage for the Hero → Quote → Collection flow. */}

      {/* <ShopeeMarketplaceSection /> */}
      <HomepageFooter />
    </div>
  );
}
