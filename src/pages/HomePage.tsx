import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
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

const GRAIN_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E";

function HeroModelLayer({
  image,
  role,
  isMobile,
}: {
  image: ImageItem;
  role: 'center' | 'left' | 'right';
  isMobile: boolean;
}) {
  const style: CSSProperties = role === 'center'
    ? {
        left: '50%',
        height: isMobile ? '58%' : '92%',
        bottom: isMobile ? '17%' : 0,
        transform: `translate3d(-50%, 0, 0) scale(${isMobile ? 1.22 : 1.68})`,
        filter: 'blur(0px)',
        opacity: 1,
        zIndex: 20,
      }
    : role === 'left'
      ? {
          left: isMobile ? '21%' : '30%',
          height: isMobile ? '16%' : '28%',
          bottom: isMobile ? '31%' : '12%',
          transform: 'translate3d(-50%, 0, 0) scale(1)',
          filter: 'blur(3px)',
          opacity: 0.78,
          zIndex: 10,
        }
      : {
          left: isMobile ? '79%' : '70%',
          height: isMobile ? '16%' : '28%',
          bottom: isMobile ? '31%' : '12%',
          transform: 'translate3d(-50%, 0, 0) scale(1)',
          filter: 'blur(3px)',
          opacity: 0.78,
          zIndex: 10,
        };

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
        willChange: 'transform, opacity, filter',
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
        }}
      />
    </div>
  );
}

const HeroSlide = memo(function HeroSlide({
  index,
  isMobile,
}: {
  index: number;
  isMobile: boolean;
}) {
  const current = IMAGES[index];
  const previous = IMAGES[(index + IMAGES.length - 1) % IMAGES.length];
  const next = IMAGES[(index + 1) % IMAGES.length];

  return (
    <div
      className="relative min-w-0 flex-[0_0_100%]"
      style={{
        position: 'relative',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          zIndex: 0,
          backgroundImage: createHeroGradient(current.theme.accentColor),
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

      <div className="absolute inset-0" style={{ zIndex: 3 }}>
        <HeroModelLayer image={previous} role="left" isMobile={isMobile} />
        <HeroModelLayer image={next} role="right" isMobile={isMobile} />
        <HeroModelLayer image={current} role="center" isMobile={isMobile} />
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
    </div>
  );
});

interface HomePageProps {
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onProductSelect: (slug: string) => void;
}

export function HomePage({ activeIndex, onActiveIndexChange, onProductSelect }: HomePageProps) {
  const initialIndexRef = useRef(activeIndex);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: false,
    align: 'start',
    skipSnaps: false,
    startIndex: initialIndexRef.current,
    duration: 30,
  });

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );

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
    if (!emblaApi) return;

    const updateSelectedIndex = () => {
      onActiveIndexChange(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', updateSelectedIndex);
    emblaApi.on('reInit', updateSelectedIndex);
    updateSelectedIndex();

    return () => {
      emblaApi.off('select', updateSelectedIndex);
      emblaApi.off('reInit', updateSelectedIndex);
    };
  }, [emblaApi, onActiveIndexChange]);

  const handlePrevious = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const handleNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

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
        <div className="overflow-hidden" ref={emblaRef} style={{ height: '100%', touchAction: 'pan-y pinch-zoom', cursor: emblaApi ? 'grab' : 'default' }}>
          <div style={{ display: 'flex', height: '100%', willChange: 'transform' }}>
            {IMAGES.map((_, index) => (
              <HeroSlide key={`${index}-${IMAGES[index].src}`} index={index} isMobile={isMobile} />
            ))}
          </div>
        </div>

        <button
          type="button"
          aria-label="Previous hero slide"
          onClick={handlePrevious}
          className="hidden md:flex"
          style={{
            position: 'absolute',
            left: '24px',
            top: '50%',
            transform: 'translate3d(0, -50%, 0)',
            zIndex: 70,
            width: '42px',
            height: '42px',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: 'rgba(255,255,255,0.45)',
            transition: 'background-color 180ms ease, color 180ms ease, border-color 180ms ease',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = 'rgba(255,255,255,0.16)';
            event.currentTarget.style.color = 'rgba(255,255,255,0.88)';
            event.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)';
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = 'rgba(255,255,255,0.10)';
            event.currentTarget.style.color = 'rgba(255,255,255,0.45)';
            event.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
          }}
        >
          <ArrowLeft size={16} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          aria-label="Next hero slide"
          onClick={handleNext}
          className="hidden md:flex"
          style={{
            position: 'absolute',
            right: '24px',
            top: '50%',
            transform: 'translate3d(0, -50%, 0)',
            zIndex: 70,
            width: '42px',
            height: '42px',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: 'rgba(255,255,255,0.45)',
            transition: 'background-color 180ms ease, color 180ms ease, border-color 180ms ease',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = 'rgba(255,255,255,0.16)';
            event.currentTarget.style.color = 'rgba(255,255,255,0.88)';
            event.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)';
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = 'rgba(255,255,255,0.10)';
            event.currentTarget.style.color = 'rgba(255,255,255,0.45)';
            event.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
          }}
        >
          <ArrowRight size={16} strokeWidth={2.2} />
        </button>
      </section>

      <section
        aria-label="Collection layer"
        style={{
          position: 'relative',
          zIndex: 20,
          marginTop: 'max(-72px, -10vh)',
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 -18px 48px rgba(0,0,0,0.16)',
          overflow: 'hidden',
        }}
      >
        <CatalogLayer onProductSelect={onProductSelect} />
      </section>
    </div>
  );
}
