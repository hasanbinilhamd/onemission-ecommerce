import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
type Direction = 'next' | 'prev';

const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const DURATION = 650;
const GRADIENT_FADE_DURATION = 520;

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

const GRAIN_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E";

const HERO_GRADIENTS = IMAGES.map(item => createHeroGradient(item.theme.accentColor));

const HeroGradientBackground = memo(function HeroGradientBackground({ activeIndex }: { activeIndex: number }) {
  const [frontLayerIndex, setFrontLayerIndex] = useState(0);
  const [frontGradient, setFrontGradient] = useState(HERO_GRADIENTS[0]);
  const [backGradient, setBackGradient] = useState(HERO_GRADIENTS[0]);
  const activeRequestRef = useRef(0);

  useEffect(() => {
    const nextGradient = HERO_GRADIENTS[activeIndex];
    const currentVisibleGradient = frontLayerIndex === 0 ? frontGradient : backGradient;

    if (nextGradient === currentVisibleGradient) return;

    const requestId = activeRequestRef.current + 1;
    activeRequestRef.current = requestId;

    if (frontLayerIndex === 0) {
      setBackGradient(nextGradient);
    } else {
      setFrontGradient(nextGradient);
    }

    const raf = requestAnimationFrame(() => {
      if (activeRequestRef.current === requestId) {
        setFrontLayerIndex(current => (current === 0 ? 1 : 0));
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [activeIndex, backGradient, frontGradient, frontLayerIndex]);

  const baseLayerStyle: React.CSSProperties = useMemo(() => ({
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    transition: `opacity ${GRADIENT_FADE_DURATION}ms ${EASE}`,
    willChange: 'opacity',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  }), []);

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          ...baseLayerStyle,
          zIndex: 0,
          opacity: frontLayerIndex === 0 ? 1 : 0,
          backgroundImage: frontGradient,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          ...baseLayerStyle,
          zIndex: 0,
          opacity: frontLayerIndex === 1 ? 1 : 0,
          backgroundImage: backGradient,
        }}
      />
    </>
  );
});

const HeroCarouselImages = memo(function HeroCarouselImages({ activeIndex, isMobile }: { activeIndex: number; isMobile: boolean }) {
  return (
    <div className="absolute inset-0" style={{ zIndex: 3 }}>
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
  onDiscover?: () => void;
}

export function HomePage({ onDiscover }: HomePageProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );

  useEffect(() => {
    IMAGES.forEach((img) => {
      const image = new Image();
      image.src = img.src;
    });
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const navigate = (dir: Direction) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) =>
      dir === 'next' ? (prev + 1) % IMAGES.length : (prev + IMAGES.length - 1) % IMAGES.length,
    );
    window.setTimeout(() => setIsAnimating(false), DURATION);
  };

  return (
    <div
      style={{
        fontFamily: 'Inter, sans-serif',
      }}
      className="relative w-full overflow-hidden"
    >
      <div className="relative w-full" style={{ height: '100vh', overflow: 'hidden' }}>
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
            top: '18%',
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(40px, 17vw, 380px)',
            fontWeight: 900,
            color: '#ffffff',
            opacity: 1,
            lineHeight: 1,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            padding: '0 10px',
          }}
        >
          VALUES MATTER
        </div>

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
            className="h-8 md:h-12 w-auto"
          />
        </div>

        <HeroCarouselImages activeIndex={activeIndex} isMobile={isMobile} />

        <div
          className="absolute bottom-6 left-4 sm:bottom-20 sm:left-24"
          style={{ zIndex: 60, maxWidth: '320px' }}
        >
          <p
            className="bold uppercase tracking-widest mb-2 sm:mb-3 text-base sm:text-[22px]"
            style={{
              color: '#ffffff',
              opacity: 0.95,
              letterSpacing: '0.02em',
              fontWeight: 700,
            }}
          >
            TOONHUB FIGURINES
          </p>
          <p
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
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => navigate('prev')}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'transparent',
                border: '2px solid #ffffff',
                color: '#ffffff',
                transition: 'transform 150ms ease, background-color 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <ArrowLeft size={26} strokeWidth={2.25} />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => navigate('next')}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'transparent',
                border: '2px solid #ffffff',
                color: '#ffffff',
                transition: 'transform 150ms ease, background-color 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <ArrowRight size={26} strokeWidth={2.25} />
            </button>
          </div>
        </div>

        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onDiscover?.(); }}
          className="absolute bottom-6 right-4 sm:bottom-20 sm:right-10 flex items-center"
          style={{
            zIndex: 60,
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(20px, 4vw, 56px)',
            fontWeight: 400,
            color: '#ffffff',
            opacity: 0.95,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'opacity 200ms ease',
            gap: '0.5rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.95';
          }}
        >
          DISCOVER IT
          <ArrowRight className="w-5 h-5 sm:w-8 sm:h-8" strokeWidth={2.25} />
        </a>
      </div>
    </div>
  );
}
