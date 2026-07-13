import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { HERO_THEMES, createHeroGradient } from '../features/hero/theme';

type ImageItem = {
  src: string;
  panel: string;
  theme: {
    title: string;
    accentColor: string;
  };
};

const IMAGES: readonly ImageItem[] = [
  {
    src: 'https://ik.imagekit.io/edyl3oplm/Onemission/Model/OKOWW.png?updatedAt=1782468174527',
    panel: '#1F2128',
    theme: HERO_THEMES[0],
  },
  {
    src: 'https://ik.imagekit.io/edyl3oplm/Onemission/Model/WEEE.png?updatedAt=1782468174345',
    panel: '#4F5D75',
    theme: HERO_THEMES[1],
  },
  {
    src: 'https://ik.imagekit.io/edyl3oplm/Onemission/Model/kmkmksss.png?updatedAt=1782468173729',
    panel: '#76837A',
    theme: HERO_THEMES[2],
  },
  {
    src: 'https://ik.imagekit.io/edyl3oplm/Onemission/Model/QW.png?updatedAt=1782468169304',
    panel: '#7B7487',
    theme: HERO_THEMES[3],
  },
] as const;

type Role = 'center' | 'left' | 'right' | 'back';

const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const DURATION = 650;
const GRADIENT_FADE_DURATION = 520;
const COLLECTION_REVEAL_SCROLL_THRESHOLD = 96;
const HERO_SCROLL_RANGE = 240;

function getRole(index: number, activeIndex: number): Role {
  if (index === activeIndex) return 'center';
  if (index === (activeIndex + IMAGES.length - 1) % IMAGES.length) return 'left';
  if (index === (activeIndex + 1) % IMAGES.length) return 'right';
  return 'back';
}

function roleStyle(role: Role, isMobile: boolean): CSSProperties {
  switch (role) {
    case 'center':
      return {
        left: '50%',
        height: isMobile ? '58%' : '92%',
        bottom: isMobile ? '17%' : 0,
        transform: `translate3d(-50%, 0, 0) scale(${isMobile ? 1.22 : 1.68})`,
        filter: 'blur(0px)',
        opacity: 1,
        zIndex: 20,
      };
    case 'left':
      return {
        left: isMobile ? '21%' : '30%',
        height: isMobile ? '16%' : '28%',
        bottom: isMobile ? '31%' : '12%',
        transform: 'translate3d(-50%, 0, 0) scale(1)',
        filter: 'blur(3px)',
        opacity: 0.78,
        zIndex: 10,
      };
    case 'right':
      return {
        left: isMobile ? '79%' : '70%',
        height: isMobile ? '16%' : '28%',
        bottom: isMobile ? '31%' : '12%',
        transform: 'translate3d(-50%, 0, 0) scale(1)',
        filter: 'blur(3px)',
        opacity: 0.78,
        zIndex: 10,
      };
    case 'back':
      return {
        left: '50%',
        height: isMobile ? '13%' : '22%',
        bottom: isMobile ? '31%' : '12%',
        transform: 'translate3d(-50%, 0, 0) scale(1)',
        filter: 'blur(5px)',
        opacity: 0.5,
        zIndex: 5,
      };
  }
}

const GRAIN_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E";

const HERO_GRADIENTS = IMAGES.map((item) => createHeroGradient(item.theme.accentColor));

function getScrollProgress(scrollY: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(Math.max(scrollY / max, 0), 1);
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

  const baseLayerStyle: CSSProperties = useMemo(() => ({
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

const HeroCarouselImages = memo(function HeroCarouselImages({
  activeIndex,
  isMobile,
  scrollProgress,
}: {
  activeIndex: number;
  isMobile: boolean;
  scrollProgress: number;
}) {
  return (
    <div
      className="absolute inset-0"
      style={{
        zIndex: 3,
        transform: `translate3d(0, ${scrollProgress * 20}px, 0) scale(${1 - scrollProgress * 0.025})`,
        transition: 'transform 80ms linear',
        willChange: 'transform',
      }}
    >
      {IMAGES.map((img, index) => {
        const style = roleStyle(getRole(index, activeIndex), isMobile);
        return (
          <div
            key={img.src}
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
            <img
              src={img.src}
              alt=""
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'bottom center',
              }}
            />
          </div>
        );
      })}
    </div>
  );
});

interface HomePageProps {
  activeIndex: number;
  catalogOpen?: boolean;
  onDiscover?: () => void;
  onAutoplayPauseChange?: (paused: boolean) => void;
}

export function HomePage({
  activeIndex,
  catalogOpen = false,
  onDiscover,
  onAutoplayPauseChange,
}: HomePageProps) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );
  const [scrollY, setScrollY] = useState(
    typeof window !== 'undefined' ? window.scrollY : 0,
  );
  const heroRef = useRef<HTMLDivElement | null>(null);
  const autoRevealTriggeredRef = useRef(false);

  useEffect(() => {
    IMAGES.forEach((imageItem) => {
      const image = new Image();
      image.src = imageItem.src;
    });
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      setScrollY(nextScrollY);

      if (catalogOpen) return;

      if (nextScrollY <= 12) {
        autoRevealTriggeredRef.current = false;
        return;
      }

      if (!autoRevealTriggeredRef.current && nextScrollY >= COLLECTION_REVEAL_SCROLL_THRESHOLD) {
        autoRevealTriggeredRef.current = true;
        onDiscover?.();
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [catalogOpen, onDiscover]);

  const setPaused = (paused: boolean) => {
    onAutoplayPauseChange?.(paused);
  };

  const handleBlurCapture = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!heroRef.current?.contains(event.relatedTarget as Node | null)) {
      setPaused(false);
    }
  };

  const scrollProgress = getScrollProgress(scrollY, HERO_SCROLL_RANGE);

  return (
    <div
      style={{
        fontFamily: 'Inter, sans-serif',
        minHeight: 'calc(100vh + 32vh)',
        backgroundColor: '#0A0A0A',
      }}
    >
      <div
        ref={heroRef}
        tabIndex={0}
        aria-label="Featured editorial hero carousel"
        aria-roledescription="carousel"
        aria-live="off"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={handleBlurCapture}
        className="relative w-full overflow-hidden outline-none"
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <HeroGradientBackground activeIndex={activeIndex} />

        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background: 'linear-gradient(180deg, rgba(10,10,10,0.16) 0%, rgba(10,10,10,0.06) 42%, rgba(229,228,226,0.10) 100%)',
          }}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 50,
            backgroundImage: `url("${GRAIN_SVG}")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
            opacity: 0.32,
          }}
        />

        <div
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none"
          style={{
            zIndex: 2,
            top: '18%',
            transform: `translate3d(0, ${scrollProgress * -18}px, 0) scale(${1 - scrollProgress * 0.02})`,
            transition: 'transform 80ms linear',
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(46px, 17vw, 380px)',
            fontWeight: 900,
            color: '#ffffff',
            opacity: 1 - scrollProgress * 0.1,
            lineHeight: 1,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            padding: '0 10px',
            willChange: 'transform, opacity',
          }}
        >
          VALUES MATTER
        </div>

        <HeroCarouselImages
          activeIndex={activeIndex}
          isMobile={isMobile}
          scrollProgress={scrollProgress}
        />

        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            zIndex: 4,
            height: '28vh',
            background: 'linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.14) 40%, rgba(10,10,10,0.38) 100%)',
            transform: `translate3d(0, ${scrollProgress * 10}px, 0)`,
          }}
        />

        <div
          className="sr-only"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          Homepage hero carousel. Scroll down to reveal the collection.
        </div>
      </div>

      <div aria-hidden="true" style={{ height: '32vh' }} />
    </div>
  );
}
