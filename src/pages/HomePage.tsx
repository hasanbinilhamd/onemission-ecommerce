import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CatalogLayer } from '../features/catalog';
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

const STATIC_HERO_GRADIENT = createHeroGradient(HERO_THEMES[0].accentColor);
const GRAIN_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E";

const COLLECTION_REVEAL_SCROLL_RANGE = 220;
const COLLECTION_OVERLAP = 'max(-72px, -10vh)';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getRoleStyle(role: 'center' | 'left' | 'right', isMobile: boolean): CSSProperties {
  if (role === 'center') {
    return {
      left: '50%',
      height: isMobile ? '58%' : '92%',
      bottom: isMobile ? '17%' : 0,
      transform: `translate3d(-50%, 0, 0) scale(${isMobile ? 1.22 : 1.68})`,
      filter: 'blur(0px)',
      opacity: 1,
      zIndex: 20,
    };
  }

  if (role === 'left') {
    return {
      left: isMobile ? '21%' : '30%',
      height: isMobile ? '16%' : '28%',
      bottom: isMobile ? '31%' : '12%',
      transform: 'translate3d(-50%, 0, 0) scale(1)',
      filter: 'blur(3px)',
      opacity: 0.78,
      zIndex: 10,
    };
  }

  return {
    left: isMobile ? '79%' : '70%',
    height: isMobile ? '16%' : '28%',
    bottom: isMobile ? '31%' : '12%',
    transform: 'translate3d(-50%, 0, 0) scale(1)',
    filter: 'blur(3px)',
    opacity: 0.78,
    zIndex: 10,
  };
}

function HeroModelLayer({
  image,
  role,
  isMobile,
}: {
  image: ImageItem;
  role: 'center' | 'left' | 'right';
  isMobile: boolean;
}) {
  const style = getRoleStyle(role, isMobile);

  return (
    <div
      aria-hidden="true"
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
        transition: 'transform 620ms cubic-bezier(0.22, 1, 0.36, 1), opacity 620ms cubic-bezier(0.22, 1, 0.36, 1), filter 620ms cubic-bezier(0.22, 1, 0.36, 1), left 620ms cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform, opacity, filter, left',
      }}
    >
      <img
        src={image.src}
        alt=""
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'bottom center',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

interface HomePageProps {
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onProductSelect: (slug: string) => void;
}

export function HomePage({ activeIndex, onActiveIndexChange, onProductSelect }: HomePageProps) {
  const rafRef = useRef<number | null>(null);
  const gestureLayerRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
    isHorizontalGesture: false,
  });
  const [collectionRevealProgress, setCollectionRevealProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );
  const [isDraggingModel, setIsDraggingModel] = useState(false);

  const currentModel = IMAGES[activeIndex];
  const previousModel = IMAGES[(activeIndex + IMAGES.length - 1) % IMAGES.length];
  const nextModel = IMAGES[(activeIndex + 1) % IMAGES.length];
  const collectionRadius = Math.round(32 * (1 - collectionRevealProgress));

  useEffect(() => {
    IMAGES.forEach((imageItem) => {
      const image = new Image();
      image.src = imageItem.src;
    });
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
        rafRef.current = null;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const goToModel = useCallback((nextIndex: number) => {
    onActiveIndexChange((nextIndex + IMAGES.length) % IMAGES.length);
  }, [onActiveIndexChange]);

  const handlePrevious = useCallback(() => {
    goToModel(activeIndex - 1);
  }, [activeIndex, goToModel]);

  const handleNext = useCallback(() => {
    goToModel(activeIndex + 1);
  }, [activeIndex, goToModel]);

  const resetDragState = useCallback(() => {
    dragStateRef.current = {
      pointerId: -1,
      startX: 0,
      startY: 0,
      deltaX: 0,
      deltaY: 0,
      isHorizontalGesture: false,
    };
    setIsDraggingModel(false);
  }, []);

  const handleGestureEnd = useCallback((shouldNavigate = true) => {
    const layer = gestureLayerRef.current;
    const { deltaX, isHorizontalGesture } = dragStateRef.current;

    if (shouldNavigate && layer && isHorizontalGesture) {
      const threshold = layer.clientWidth * 0.24;
      if (Math.abs(deltaX) >= threshold) {
        if (deltaX < 0) {
          handleNext();
        } else {
          handlePrevious();
        }
      }
    }

    if (layer && dragStateRef.current.pointerId !== -1) {
      try {
        layer.releasePointerCapture(dragStateRef.current.pointerId);
      } catch {
        // Ignore release errors from browsers that already cancelled capture.
      }
    }

    resetDragState();
  }, [handleNext, handlePrevious, resetDragState]);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      deltaX: 0,
      deltaY: 0,
      isHorizontalGesture: false,
    };

    setIsDraggingModel(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragStateRef.current.startX;
    const deltaY = event.clientY - dragStateRef.current.startY;
    const isHorizontalGesture = dragStateRef.current.isHorizontalGesture
      || (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10);

    dragStateRef.current = {
      ...dragStateRef.current,
      deltaX,
      deltaY,
      isHorizontalGesture,
    };
  }, []);

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current.pointerId !== event.pointerId) return;
    handleGestureEnd(true);
  }, [handleGestureEnd]);

  const handlePointerCancel = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current.pointerId !== event.pointerId) return;
    handleGestureEnd(false);
  }, [handleGestureEnd]);

  const handleHeroKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handlePrevious();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleNext();
    }
  }, [handleNext, handlePrevious]);

  return (
    <div
      style={{
        fontFamily: 'Inter, sans-serif',
        backgroundColor: '#0A0A0A',
      }}
    >
      <section
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
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            zIndex: 0,
            backgroundImage: STATIC_HERO_GRADIENT,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            transform: 'translate3d(0,0,0)',
          }}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            zIndex: 1,
            background: 'linear-gradient(180deg, rgba(10,10,10,0.16) 0%, rgba(10,10,10,0.06) 42%, rgba(229,228,226,0.10) 100%)',
          }}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            zIndex: 50,
            backgroundImage: `url("${GRAIN_SVG}")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
            opacity: 0.32,
            pointerEvents: 'none',
          }}
        />

        <div
          className="absolute inset-x-0 flex items-center justify-center select-none pointer-events-none"
          style={{
            zIndex: 2,
            top: '18%',
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(46px, 17vw, 380px)',
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            padding: '0 10px',
          }}
        >
          VALUES MATTER
        </div>

        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          <HeroModelLayer image={previousModel} role="left" isMobile={isMobile} />
          <HeroModelLayer image={nextModel} role="right" isMobile={isMobile} />
          <HeroModelLayer image={currentModel} role="center" isMobile={isMobile} />
        </div>

        <div
          className="absolute top-6 left-4 sm:left-8"
          style={{
            zIndex: 60,
            color: '#FFFFFF',
            opacity: 0.9,
            letterSpacing: '0.18em',
          }}
        >
          <img
            src="https://ik.imagekit.io/edyl3oplm/Onemission/logos/AMAN_ONEMISSION.png?updatedAt=1782542636942"
            alt="ONEMISSION"
            className="h-8 md:h-12 w-auto"
          />
        </div>

        <div
          ref={gestureLayerRef}
          aria-hidden="true"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 45,
            overflow: 'hidden',
            touchAction: 'pan-y pinch-zoom',
            cursor: isDraggingModel ? 'grabbing' : 'grab',
          }}
        />

        <button
          type="button"
          aria-label="Previous model"
          onClick={handlePrevious}
          className="hidden md:flex"
          style={{
            position: 'absolute',
            left: '24px',
            top: '50%',
            transform: 'translate3d(0, -50%, 0)',
            zIndex: 70,
            width: '40px',
            height: '40px',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.16)',
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: 'rgba(255,255,255,0.42)',
            transition: 'background-color 180ms ease, color 180ms ease, border-color 180ms ease',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = 'rgba(255,255,255,0.16)';
            event.currentTarget.style.color = 'rgba(255,255,255,0.9)';
            event.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)';
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = 'rgba(255,255,255,0.10)';
            event.currentTarget.style.color = 'rgba(255,255,255,0.42)';
            event.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)';
          }}
        >
          <ArrowLeft size={15} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          aria-label="Next model"
          onClick={handleNext}
          className="hidden md:flex"
          style={{
            position: 'absolute',
            right: '24px',
            top: '50%',
            transform: 'translate3d(0, -50%, 0)',
            zIndex: 70,
            width: '40px',
            height: '40px',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.16)',
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: 'rgba(255,255,255,0.42)',
            transition: 'background-color 180ms ease, color 180ms ease, border-color 180ms ease',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = 'rgba(255,255,255,0.16)';
            event.currentTarget.style.color = 'rgba(255,255,255,0.9)';
            event.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)';
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = 'rgba(255,255,255,0.10)';
            event.currentTarget.style.color = 'rgba(255,255,255,0.42)';
            event.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)';
          }}
        >
          <ArrowRight size={15} strokeWidth={2.2} />
        </button>
      </section>

      <section
        aria-label="Collection layer"
        style={{
          position: 'relative',
          zIndex: 20,
          marginTop: COLLECTION_OVERLAP,
          borderTopLeftRadius: `${collectionRadius}px`,
          borderTopRightRadius: `${collectionRadius}px`,
          backgroundColor: '#FFFFFF',
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
    </div>
  );
}
