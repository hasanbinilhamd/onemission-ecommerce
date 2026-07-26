import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { PRODUCT_STORY_ITEMS, type ProductStoryItem } from './productStoryData';

const STORY_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

interface ProductStorySectionProps {
  items?: readonly ProductStoryItem[];
}

function ProductStoryMedia({ item, isActive }: { item: ProductStoryItem; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isActive) {
      const playPromise = videoElement.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => undefined);
      }
      return;
    }

    videoElement.pause();
  }, [isActive]);

  if (item.mediaType === 'video') {
    return (
      <video
        ref={videoRef}
        src={item.mediaUrl}
        poster={item.posterUrl}
        muted
        loop
        playsInline
        preload={isActive ? 'auto' : 'metadata'}
        controls={false}
        disablePictureInPicture
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    );
  }

  return (
    <img
      src={item.mediaUrl}
      alt={item.alt || item.title}
      draggable={false}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      }}
    />
  );
}

export function ProductStorySection({ items = PRODUCT_STORY_ITEMS }: ProductStorySectionProps) {
  const orderedItems = useMemo(() => {
    return [...items].sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0));
  }, [items]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    loop: false,
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(orderedItems.length > 1);

  const updateControls = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    updateControls();
    emblaApi.on('reInit', updateControls);
    emblaApi.on('select', updateControls);

    return () => {
      emblaApi.off('reInit', updateControls);
      emblaApi.off('select', updateControls);
    };
  }, [emblaApi, updateControls]);

  const handlePrevious = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const handleNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      emblaApi?.scrollPrev();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      emblaApi?.scrollNext();
    }
  }, [emblaApi]);

  const buttonStyle = useCallback((enabled: boolean): CSSProperties => ({
    width: '48px',
    height: '48px',
    borderRadius: '999px',
    border: '1px solid rgba(15,23,42,0.08)',
    backgroundColor: 'rgba(255,255,255,0.88)',
    color: enabled ? '#0F172A' : 'rgba(15,23,42,0.32)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 30px rgba(15,23,42,0.08)',
    cursor: enabled ? 'pointer' : 'not-allowed',
    transition: `transform 220ms ${STORY_EASE}, opacity 220ms ${STORY_EASE}, background-color 220ms ${STORY_EASE}`,
    opacity: enabled ? 1 : 0.7,
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
  }), []);

  return (
    <section
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Product story"
      aria-roledescription="carousel"
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #F4F4F6 0%, #FFFFFF 100%)',
        padding: 'clamp(72px, 10vw, 120px) 0 clamp(88px, 10vw, 128px)',
        outline: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: 'min(100%, 1600px)',
          margin: '0 auto',
          padding: '0 clamp(20px, 4vw, 48px)',
          boxSizing: 'border-box',
        }}
      >
        <div
          ref={emblaRef}
          style={{
            overflow: 'hidden',
          }}
        >
          <div
            className="flex touch-pan-y"
            style={{
              marginLeft: 'calc(clamp(16px, 2vw, 28px) * -1)',
            }}
          >
            {orderedItems.map((item, index) => {
              const isActive = index === selectedIndex;

              return (
                <article
                  key={item.id}
                  className="min-w-0 flex-[0_0_100%] md:flex-[0_0_58%] xl:flex-[0_0_44%]"
                  style={{
                    paddingLeft: 'clamp(16px, 2vw, 28px)',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      borderRadius: '32px',
                      backgroundColor: '#FFFFFF',
                      padding: 'clamp(18px, 2vw, 24px)',
                      boxShadow: isActive
                        ? '0 28px 80px rgba(15,23,42,0.12)'
                        : '0 18px 48px rgba(15,23,42,0.08)',
                      transform: isActive
                        ? 'translate3d(0, 0, 0) scale(1)'
                        : 'translate3d(0, 12px, 0) scale(0.976)',
                      opacity: isActive ? 1 : 0.78,
                      transition: `transform 520ms ${STORY_EASE}, opacity 520ms ${STORY_EASE}, box-shadow 520ms ${STORY_EASE}`,
                      willChange: 'transform, opacity',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '4 / 5',
                        borderRadius: '28px',
                        overflow: 'hidden',
                        backgroundColor: '#E5E7EB',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)',
                      }}
                    >
                      <ProductStoryMedia item={item} isActive={isActive} />
                    </div>

                    <div
                      style={{
                        paddingTop: 'clamp(18px, 2.5vw, 24px)',
                        display: 'grid',
                        gap: '12px',
                        minHeight: '160px',
                        alignContent: 'start',
                      }}
                    >
                      <h2
                        style={{
                          margin: 0,
                          color: '#0F172A',
                          fontSize: 'clamp(28px, 4vw, 42px)',
                          lineHeight: 1.04,
                          letterSpacing: '-0.04em',
                          fontWeight: 600,
                        }}
                      >
                        {item.title}
                      </h2>
                      <p
                        style={{
                          margin: 0,
                          color: 'rgba(15,23,42,0.76)',
                          fontSize: 'clamp(15px, 1.6vw, 18px)',
                          lineHeight: 1.7,
                          maxWidth: '32ch',
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: 'clamp(24px, 3vw, 32px)',
          }}
        >
          <button
            type="button"
            aria-label="Previous story"
            onClick={handlePrevious}
            disabled={!canScrollPrev}
            style={buttonStyle(canScrollPrev)}
            onMouseEnter={(event) => {
              if (!canScrollPrev) return;
              event.currentTarget.style.transform = 'translate3d(0, -2px, 0) scale(1.02)';
              event.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = 'translate3d(0, 0, 0) scale(1)';
              event.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.88)';
            }}
          >
            <ArrowLeft size={20} strokeWidth={2.1} />
          </button>
          <button
            type="button"
            aria-label="Next story"
            onClick={handleNext}
            disabled={!canScrollNext}
            style={buttonStyle(canScrollNext)}
            onMouseEnter={(event) => {
              if (!canScrollNext) return;
              event.currentTarget.style.transform = 'translate3d(0, -2px, 0) scale(1.02)';
              event.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = 'translate3d(0, 0, 0) scale(1)';
              event.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.88)';
            }}
          >
            <ArrowRight size={20} strokeWidth={2.1} />
          </button>
        </div>
      </div>
    </section>
  );
}
