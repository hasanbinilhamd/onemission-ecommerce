import { memo, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CatalogLayer } from '../features/catalog';
import { HERO_THEMES, createHeroGradient } from '../features/hero/theme';
import { ProductStorySection } from '../features/story';
import { FeaturedProductsSection } from '../features/featured';
import { HomepageFooter } from '../features/footer';

type HeroMediaType = 'image' | 'video';

type ImageItem = {
  mediaType: HeroMediaType;
  media: string;
  poster: string;
  blurMedia?: string;
  panel: string;
  theme: {
    title: string;
    accentColor: string;
  };
};

type Role = 'center' | 'left' | 'right' | 'back';
type Direction = 'next' | 'prev';

const IMAGES: readonly ImageItem[] = [
  {
    mediaType: 'video',
    media: 'https://ik.imagekit.io/edyl3oplm/Onemission/Model/OKOWW.png?updatedAt=1782468174527',
    poster: 'https://ik.imagekit.io/edyl3oplm/Onemission/Model/OKOWW.png?updatedAt=1782468174527',
    panel: '#1F2128',
    theme: HERO_THEMES[0],
  },
  // {
  //   mediaType: 'image',
  //   media: 'https://ik.imagekit.io/edyl3oplm/Onemission/Model/OKOWW.png?updatedAt=1782468174527',
  //   poster: 'https://ik.imagekit.io/edyl3oplm/Onemission/Model/OKOWW.png?updatedAt=1782468174527',
  //   panel: '#1F2128',
  //   theme: HERO_THEMES[0],
  // },
  {
    mediaType: 'image',
    media: 'https://ik.imagekit.io/edyl3oplm/Onemission/Model/WEEE.png?updatedAt=1782468174345',
    poster: 'https://ik.imagekit.io/edyl3oplm/Onemission/Model/WEEE.png?updatedAt=1782468174345',
    panel: '#4F5D75',
    theme: HERO_THEMES[1],
  },
  {
    mediaType: 'image',
    media: 'https://ik.imagekit.io/edyl3oplm/Onemission/Model/kmkmksss.png?updatedAt=1782468173729',
    poster: 'https://ik.imagekit.io/edyl3oplm/Onemission/Model/kmkmksss.png?updatedAt=1782468173729',
    panel: '#76837A',
    theme: HERO_THEMES[2],
  },
  {
    mediaType: 'image',
    media: 'https://ik.imagekit.io/edyl3oplm/Onemission/Model/QW.png?updatedAt=1782468169304',
    poster: 'https://ik.imagekit.io/edyl3oplm/Onemission/Model/QW.png?updatedAt=1782468169304',
    panel: '#7B7487',
    theme: HERO_THEMES[3],
  },
] as const;

const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const DURATION = 650;
const GRADIENT_FADE_DURATION = 520;
const COLLECTION_REVEAL_SCROLL_RANGE = 220;
const COLLECTION_OVERLAP = 'max(0px, -10vh)';
const VIDEO_SECTION_SOURCE = 'https://ik.imagekit.io/fkoy34ckk/onemission-dev/WhatsApp%20Video%202026-07-26%20at%2016.17.17.mp4?updatedAt=1785057842262';
const VIDEO_SECTION_POSTER = 'https://ik.imagekit.io/fkoy34ckk/onemission-dev/Screenshot%202026-07-26%20163038.png?updatedAt=1785058280647';

const GRAIN_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E";

const HERO_GRADIENTS = IMAGES.map((item) => createHeroGradient(item.theme.accentColor));

function getHeroPoster(item: ImageItem): string {
  return item.poster || item.blurMedia || item.media;
}

function getHeroBlurMedia(item: ImageItem): string {
  return item.blurMedia || getHeroPoster(item);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getRole(index: number, activeIndex: number): Role {
  if (index === activeIndex) return 'center';
  if (index === (activeIndex + 3) % 4) return 'left';
  if (index === (activeIndex + 1) % 4) return 'right';
  return 'back';
}

function roleStyle(role: Role, isMobile: boolean): React.CSSProperties {
  switch (role) {
    case 'center':
      return {
        left: '50%',
        height: isMobile ? '60%' : '92%',
        bottom: isMobile ? '22%' : 0,
        transform: `translateX(-50%) scale(${isMobile ? 1.25 : 1.68})`,
        filter: 'blur(0px)',
        opacity: 1,
        zIndex: 20,
      };
    case 'left':
      return {
        left: isMobile ? '20%' : '30%',
        height: isMobile ? '16%' : '28%',
        bottom: isMobile ? '32%' : '12%',
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(2px)',
        opacity: 0.85,
        zIndex: 10,
      };
    case 'right':
      return {
        left: isMobile ? '80%' : '70%',
        height: isMobile ? '16%' : '28%',
        bottom: isMobile ? '32%' : '12%',
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(2px)',
        opacity: 0.85,
        zIndex: 10,
      };
    case 'back':
      return {
        left: '50%',
        height: isMobile ? '13%' : '22%',
        bottom: isMobile ? '32%' : '12%',
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(4px)',
        opacity: 1,
        zIndex: 5,
      };
  }
}

const HeroGradientBackground = memo(function HeroGradientBackground({ activeIndex }: { activeIndex: number }) {
  const [visibleLayer, setVisibleLayer] = useState<0 | 1>(0);
  const [layerGradients, setLayerGradients] = useState<[string, string]>([
    HERO_GRADIENTS[0],
    HERO_GRADIENTS[0],
  ]);
  const visibleLayerRef = useRef<0 | 1>(0);
  const layerGradientsRef = useRef<[string, string]>([HERO_GRADIENTS[0], HERO_GRADIENTS[0]]);
  const transitionTokenRef = useRef(0);

  useEffect(() => {
    visibleLayerRef.current = visibleLayer;
  }, [visibleLayer]);

  useEffect(() => {
    layerGradientsRef.current = layerGradients;
  }, [layerGradients]);

  useEffect(() => {
    const nextGradient = HERO_GRADIENTS[activeIndex];
    const currentVisibleLayer = visibleLayerRef.current;
    const currentVisibleGradient = layerGradientsRef.current[currentVisibleLayer];

    if (nextGradient === currentVisibleGradient) return;

    const hiddenLayer = currentVisibleLayer === 0 ? 1 : 0;
    const token = transitionTokenRef.current + 1;
    transitionTokenRef.current = token;

    setLayerGradients((current) => {
      if (current[hiddenLayer] === nextGradient) return current;
      const next: [string, string] = [...current] as [string, string];
      next[hiddenLayer] = nextGradient;
      layerGradientsRef.current = next;
      return next;
    });

    const raf = requestAnimationFrame(() => {
      if (transitionTokenRef.current !== token) return;
      setVisibleLayer(hiddenLayer);
      visibleLayerRef.current = hiddenLayer;
    });

    return () => cancelAnimationFrame(raf);
  }, [activeIndex]);

  const baseLayerStyle: React.CSSProperties = useMemo(() => ({
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    transition: `opacity ${GRADIENT_FADE_DURATION}ms ${EASE}`,
    willChange: 'opacity',
    transform: 'translate3d(0,0,0)',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  }), []);

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          ...baseLayerStyle,
          zIndex: 0,
          opacity: visibleLayer === 0 ? 1 : 0,
          backgroundImage: layerGradients[0],
        }}
      />
      <div
        aria-hidden="true"
        style={{
          ...baseLayerStyle,
          zIndex: 0,
          opacity: visibleLayer === 1 ? 1 : 0,
          backgroundImage: layerGradients[1],
        }}
      />
    </>
  );
});

const HeroCarouselImages = memo(function HeroCarouselImages({ activeIndex, isMobile }: { activeIndex: number; isMobile: boolean }) {
  const [failedVideoMedia, setFailedVideoMedia] = useState<Record<string, boolean>>({});
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const preloadedMediaRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const preloadIndexes = [
      activeIndex,
      (activeIndex + 1) % IMAGES.length,
    ];

    preloadIndexes.forEach((index) => {
      const mediaItem = IMAGES[index];
      const poster = getHeroPoster(mediaItem);

      if (poster && !preloadedMediaRef.current.has(poster)) {
        const image = new Image();
        image.src = poster;
        preloadedMediaRef.current.add(poster);
      }

      if (mediaItem.mediaType === 'video' && !preloadedMediaRef.current.has(mediaItem.media)) {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;
        video.src = mediaItem.media;
        video.load();
        preloadedMediaRef.current.add(mediaItem.media);
      }
    });
  }, [activeIndex]);

  useEffect(() => {
    const activeVideo = activeVideoRef.current;
    if (!activeVideo) {
      return undefined;
    }

    activeVideo.currentTime = activeVideo.currentTime;
    const playPromise = activeVideo.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => undefined);
    }

    return () => {
      activeVideo.pause();
    };
  }, [activeIndex]);

  return (
    <div className="absolute inset-0" style={{ zIndex: 3 }}>
      {IMAGES.map((imageItem, index) => {
        const role = getRole(index, activeIndex);
        const style = roleStyle(role, isMobile);
        const poster = getHeroPoster(imageItem);
        const mediaKey = `${imageItem.media}-${index}`;
        const shouldRenderVideo = role === 'center'
          && imageItem.mediaType === 'video'
          && !failedVideoMedia[imageItem.media];

        return (
          <div
            key={mediaKey}
            style={{
              position: 'absolute',
              left: style.left,
              bottom: style.bottom,
              height: style.height,
              aspectRatio: '0.6 / 1',
              transform: style.transform,
              filter: style.filter,
              opacity: style.opacity,
              zIndex: style.zIndex,
              transition: `transform ${DURATION}ms ${EASE}, filter ${DURATION}ms ${EASE}, opacity ${DURATION}ms ${EASE}, left ${DURATION}ms ${EASE}`,
              willChange: 'transform, filter, opacity',
            }}
          >
            {shouldRenderVideo ? (
              <video
                ref={role === 'center' ? activeVideoRef : null}
                src={imageItem.media}
                poster={poster}
                autoPlay
                muted
                playsInline
                loop
                preload="auto"
                disablePictureInPicture
                controls={false}
                onError={() => {
                  setFailedVideoMedia((current) => ({
                    ...current,
                    [imageItem.media]: true,
                  }));
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'bottom center',
                  backgroundColor: 'transparent',
                }}
              />
            ) : (
              <img
                src={role === 'center' ? poster : getHeroBlurMedia(imageItem)}
                alt=""
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'bottom center',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});

interface HomePageProps {
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onProductSelect: (slug: string) => void;
}

export function HomePage({ activeIndex, onActiveIndexChange, onProductSelect }: HomePageProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );
  const [collectionRevealProgress, setCollectionRevealProgress] = useState(0);
  const heroSceneRef = useRef<HTMLElement | null>(null);
  const collectionSceneRef = useRef<HTMLElement | null>(null);
  const heroGestureRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const dragStateRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
    hasResolvedDirection: false,
    isHorizontal: false,
  });

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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
    if (isAnimating) return;

    setIsAnimating(true);
    const nextIndex = direction === 'next'
      ? (activeIndex + 1) % IMAGES.length
      : (activeIndex + IMAGES.length - 1) % IMAGES.length;
    onActiveIndexChange(nextIndex);
    window.setTimeout(() => setIsAnimating(false), DURATION);
  }, [activeIndex, isAnimating, onActiveIndexChange]);

  const resetGestureState = useCallback(() => {
    dragStateRef.current = {
      pointerId: -1,
      startX: 0,
      startY: 0,
      deltaX: 0,
      deltaY: 0,
      hasResolvedDirection: false,
      isHorizontal: false,
    };
  }, []);

  const resolveGestureNavigation = useCallback((shouldNavigate: boolean) => {
    const layer = heroGestureRef.current;
    const { deltaX, isHorizontal, pointerId } = dragStateRef.current;

    if (shouldNavigate && layer && isHorizontal) {
      const threshold = layer.clientWidth * 0.24;
      if (Math.abs(deltaX) >= threshold) {
        rotateHero(deltaX < 0 ? 'next' : 'prev');
      }
    }

    if (layer && pointerId !== -1) {
      try {
        layer.releasePointerCapture(pointerId);
      } catch {
        // Ignore browsers that already cancelled pointer capture.
      }
    }

    resetGestureState();
  }, [resetGestureState, rotateHero]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      deltaX: 0,
      deltaY: 0,
      hasResolvedDirection: false,
      isHorizontal: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragStateRef.current.startX;
    const deltaY = event.clientY - dragStateRef.current.startY;

    if (!dragStateRef.current.hasResolvedDirection) {
      const totalDistance = Math.max(Math.abs(deltaX), Math.abs(deltaY));
      if (totalDistance < 8) {
        dragStateRef.current = {
          ...dragStateRef.current,
          deltaX,
          deltaY,
        };
        return;
      }

      dragStateRef.current = {
        ...dragStateRef.current,
        deltaX,
        deltaY,
        hasResolvedDirection: true,
        isHorizontal: Math.abs(deltaX) > Math.abs(deltaY),
      };
      return;
    }

    dragStateRef.current = {
      ...dragStateRef.current,
      deltaX,
      deltaY,
    };
  }, []);

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current.pointerId !== event.pointerId) return;
    resolveGestureNavigation(true);
  }, [resolveGestureNavigation]);

  const handlePointerCancel = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current.pointerId !== event.pointerId) return;
    resolveGestureNavigation(false);
  }, [resolveGestureNavigation]);

  const handleHeroKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      rotateHero('prev');
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      rotateHero('next');
    }
  }, [rotateHero]);

  return (
    <div
      style={{
        fontFamily: 'Inter, sans-serif',
        backgroundColor: '#0A0A0A',
      }}
    >
      <section
        ref={heroSceneRef}
        tabIndex={0}
        aria-label="Featured editorial hero carousel"
        aria-roledescription="carousel"
        aria-live="off"
        onKeyDown={handleHeroKeyDown}
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
          <HeroGradientBackground activeIndex={activeIndex} />

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
              fontSize: isMobile ? 'clamp(120px, 37vw, 170px)' : 'clamp(70px, 19vw, 380px)',
              fontWeight: 400,
              color: '#ffffff',
              opacity: 0.5,
              lineHeight: isMobile ? 0.8 : 1,
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

          <HeroCarouselImages activeIndex={activeIndex} isMobile={isMobile} />

          <div
            className="absolute top-6 left-4 sm:left-8"
            style={{
              zIndex: 60,
              color: '#ffffff',
              opacity: 0.9,
              letterSpacing: '0.18em',
            }}
          >
            <img
              src="https://ik.imagekit.io/edyl3oplm/Onemission/logos/AMAN_ONEMISSION.png?updatedAt=1782542636942"
              alt="ONEMISSION"
              className="h-8 md:h-14 w-auto"
            />
          </div>

          <div
            ref={heroGestureRef}
            aria-hidden="true"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 45,
              touchAction: 'pan-y',
              cursor: 'grab',
            }}
          />

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
        aria-label="Collection layer"
        style={{
          position: 'relative',
          zIndex: 60,
          marginTop: COLLECTION_OVERLAP,
          // borderTopLeftRadius: `${collectionRadius}px`,
          // borderTopRightRadius: `${collectionRadius}px`,
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
          src={VIDEO_SECTION_SOURCE}
          poster={VIDEO_SECTION_POSTER}
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

      <ProductStorySection backgroundImage={HERO_GRADIENTS[activeIndex]} />
      <FeaturedProductsSection onProductSelect={onProductSelect} />
      <HomepageFooter />
    </div>
  );
}
