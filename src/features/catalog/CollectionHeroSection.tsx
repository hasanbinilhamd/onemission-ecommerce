import { useEffect, useMemo, useState } from 'react';
import type { WebsiteCollectionHero, WebsiteCollectionHeroMediaItem } from '../../services/api/websiteService';

interface CollectionHeroSectionProps {
  hero: WebsiteCollectionHero | null;
  isLoading?: boolean;
}

const HERO_HEIGHT = 'clamp(360px, 64vh, 680px)';

function resolveMediaUrl(item: WebsiteCollectionHeroMediaItem | null, isMobile: boolean): string {
  if (!item) return '';
  return isMobile && item.mobileUrl ? item.mobileUrl : item.desktopUrl;
}

function CollectionHeroSkeleton() {
  return (
    <section
      aria-label="Loading collection hero"
      aria-busy="true"
      style={{
        position: 'relative',
        width: '100%',
        height: HERO_HEIGHT,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #111827 0%, #1F2937 48%, #111827 100%)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 64% 36%, rgba(255,255,255,0.10), transparent 34rem)',
        }}
      />
    </section>
  );
}

export function CollectionHeroSection({ hero, isLoading = false }: CollectionHeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const activeItems = useMemo(() => (
    hero?.mediaItems?.filter((item) => item.active && item.desktopUrl).sort((left, right) => left.displayOrder - right.displayOrder) ?? []
  ), [hero?.mediaItems]);

  useEffect(() => {
    const update = () => setIsMobile(window.matchMedia('(max-width: 767px)').matches);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (hero?.heroType !== 'slideshow' || activeItems.length <= 1) {
      setActiveIndex(0);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % activeItems.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [activeItems.length, hero?.heroType]);

  if (isLoading) {
    return <CollectionHeroSkeleton />;
  }

  if (!hero?.active || activeItems.length === 0) {
    return null;
  }

  const visibleIndex = activeIndex % activeItems.length;
  const currentItem = activeItems[visibleIndex] ?? activeItems[0];
  const overlayOpacity = Math.min(Math.max(Number(hero.overlayOpacity ?? 35), 0), 100) / 100;

  return (
    <section
      aria-label="Collection hero"
      style={{
        position: 'relative',
        width: '100%',
        height: HERO_HEIGHT,
        overflow: 'hidden',
        backgroundColor: '#111827',
      }}
    >
      {hero.heroType === 'video' ? (
        <video
          src={resolveMediaUrl(currentItem, isMobile)}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        activeItems.map((item, index) => (
          <img
            key={item.id}
            src={resolveMediaUrl(item, isMobile)}
            alt=""
            loading={index === 0 ? 'eager' : 'lazy'}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: index === visibleIndex ? 1 : 0,
              transition: 'opacity 700ms ease',
            }}
          />
        ))
      )}

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, rgba(0,0,0,${Math.min(overlayOpacity + 0.18, 0.82)}) 0%, rgba(0,0,0,${overlayOpacity}) 46%, rgba(0,0,0,${Math.max(overlayOpacity - 0.1, 0.08)}) 100%)`,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: HERO_HEIGHT,
          display: 'flex',
          alignItems: 'flex-end',
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '120px 20px 72px',
          boxSizing: 'border-box',
        }}
        className="sm:px-8"
      >
        <div style={{ maxWidth: '720px' }}>
          <p
            style={{
              margin: '0 0 12px',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.72)',
            }}
          >
            Collection
          </p>
          {hero.title ? (
            <h1
              style={{
                margin: 0,
                fontFamily: "'SF-Pro-Display', sans-serif",
                fontSize: 'clamp(42px, 6vw, 88px)',
                lineHeight: 0.94,
                letterSpacing: '-0.055em',
                fontWeight: 500,
                color: '#FFFFFF',
              }}
            >
              {hero.title}
            </h1>
          ) : null}
          {hero.description ? (
            <p
              style={{
                margin: '18px 0 0',
                maxWidth: '560px',
                fontSize: '16px',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.74)',
              }}
            >
              {hero.description}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
