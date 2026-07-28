import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { PRODUCT_STORY_ITEMS, type ProductStoryItem } from './productStoryData';

const STORY_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const POINTER_DRAG_THRESHOLD_PX = 6;

type DragState = {
  pointerId: number;
  startX: number;
  startScrollLeft: number;
  hasDragged: boolean;
};

interface ProductStorySectionProps {
  items?: readonly ProductStoryItem[];
  backgroundImage?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function ProductStoryMedia({ item, isActive }: { item: ProductStoryItem; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return undefined;

    if (isActive) {
      const playPromise = videoElement.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => undefined);
      }
      return undefined;
    }

    videoElement.pause();
    return undefined;
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
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
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
        maxWidth: '100%',
        maxHeight: '100%',
        width: 'auto',
        height: 'auto',
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );
}

export function ProductStorySection(props: ProductStorySectionProps) {
  const { items = PRODUCT_STORY_ITEMS } = props;
  const orderedItems = useMemo(() => {
    return [...items].sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0));
  }, [items]);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const dragStateRef = useRef<DragState>({
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
    hasDragged: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(orderedItems.length > 1);
  const [isDragging, setIsDragging] = useState(false);

  const getNearestIndex = useCallback((scrollLeft: number) => {
    let nextIndex = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;

    slideRefs.current.forEach((slide, index) => {
      if (!slide) return;
      const distance = Math.abs(slide.offsetLeft - scrollLeft);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        nextIndex = index;
      }
    });

    return nextIndex;
  }, []);

  const syncCarouselState = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const maxScrollLeft = Math.max(viewport.scrollWidth - viewport.clientWidth, 0);
    const currentScrollLeft = viewport.scrollLeft;

    setSelectedIndex(getNearestIndex(currentScrollLeft));
    setCanScrollPrev(currentScrollLeft > 4);
    setCanScrollNext(currentScrollLeft < maxScrollLeft - 4);
  }, [getNearestIndex]);

  const scrollToIndex = useCallback((index: number) => {
    const viewport = viewportRef.current;
    const slide = slideRefs.current[index];
    if (!viewport || !slide) return;

    viewport.scrollTo({
      left: slide.offsetLeft,
      behavior: 'smooth',
    });
  }, []);

  const snapToNearestSlide = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const nextIndex = getNearestIndex(viewport.scrollLeft);
    scrollToIndex(nextIndex);
  }, [getNearestIndex, scrollToIndex]);

  useEffect(() => {
    slideRefs.current = slideRefs.current.slice(0, orderedItems.length);
  }, [orderedItems.length]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    let scrollTimeoutId = 0;

    const handleScroll = () => {
      syncCarouselState();
      window.clearTimeout(scrollTimeoutId);
      scrollTimeoutId = window.setTimeout(() => {
        if (!dragStateRef.current.hasDragged) {
          snapToNearestSlide();
        }
      }, 120);
    };

    handleScroll();
    viewport.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      viewport.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.clearTimeout(scrollTimeoutId);
    };
  }, [snapToNearestSlide, syncCarouselState]);

  const handlePrevious = useCallback(() => {
    scrollToIndex(clamp(selectedIndex - 1, 0, orderedItems.length - 1));
  }, [orderedItems.length, scrollToIndex, selectedIndex]);

  const handleNext = useCallback(() => {
    scrollToIndex(clamp(selectedIndex + 1, 0, orderedItems.length - 1));
  }, [orderedItems.length, scrollToIndex, selectedIndex]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollToIndex(clamp(selectedIndex - 1, 0, orderedItems.length - 1));
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollToIndex(clamp(selectedIndex + 1, 0, orderedItems.length - 1));
    }
  }, [orderedItems.length, scrollToIndex, selectedIndex]);

  const releasePointerDrag = useCallback((event: ReactPointerEvent<HTMLDivElement>, shouldSnap: boolean) => {
    const viewport = viewportRef.current;
    if (dragStateRef.current.pointerId !== event.pointerId || !viewport) return;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore browsers that already released pointer capture.
    }

    const dragged = dragStateRef.current.hasDragged;
    dragStateRef.current = {
      pointerId: -1,
      startX: 0,
      startScrollLeft: 0,
      hasDragged: false,
    };
    setIsDragging(false);

    if (shouldSnap && dragged) {
      snapToNearestSlide();
    }
  }, [snapToNearestSlide]);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: viewport.scrollLeft,
      hasDragged: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (dragStateRef.current.pointerId !== event.pointerId || !viewport) return;

    const deltaX = event.clientX - dragStateRef.current.startX;
    if (!dragStateRef.current.hasDragged && Math.abs(deltaX) >= POINTER_DRAG_THRESHOLD_PX) {
      dragStateRef.current.hasDragged = true;
    }

    viewport.scrollLeft = dragStateRef.current.startScrollLeft - deltaX;
  }, []);

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    releasePointerDrag(event, true);
  }, [releasePointerDrag]);

  const handlePointerCancel = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    releasePointerDrag(event, false);
  }, [releasePointerDrag]);

  const handleClickCapture = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.hasDragged) return;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const buttonStyle = useCallback((enabled: boolean): CSSProperties => ({
    width: '48px',
    height: '48px',
    borderRadius: '999px',
    border: '1px solid rgba(17,24,39,0.14)',
    backgroundColor: 'rgba(229,228,226,0.92)',
    color: enabled ? '#0F172A' : 'rgba(15,23,42,0.32)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 30px rgba(15,23,42,0.10)',
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
        background: '#FFFFFF',
        padding: 'clamp(72px, 10vw, 120px) 0 clamp(88px, 10vw, 128px)',
        outline: 'none',
        overflow: 'hidden',
      }}
    >
      <style>
        {`
          .product-story-viewport {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .product-story-viewport::-webkit-scrollbar {
            display: none;
            width: 0;
            height: 0;
          }
        `}
      </style>

      <div
        style={{
          width: 'min(100%, 1600px)',
          margin: '0 auto',
          padding: '0 clamp(20px, 4vw, 48px)',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: '10px',
            marginBottom: 'clamp(28px, 5vw, 44px)',
            maxWidth: '720px',
          }}
        >
          <p
            style={{
              margin: 0,
              color: 'rgba(17,24,39,0.55)',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontFamily: "'Chakra Petch', sans-serif",
            }}
          >
            Product Story
          </p>
          <h2
            style={{
              margin: 0,
              color: '#111827',
              fontFamily: "'SF-Pro-Display', sans-serif",
              fontSize: 'clamp(36px, 6vw, 72px)',
              lineHeight: 0.98,
              letterSpacing: '-0.01em',
              fontWeight: 500,
            }}
          >
            Designed with Purpose.
          </h2>
        </div>

        <div
          ref={viewportRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onClickCapture={handleClickCapture}
          className="product-story-viewport overflow-x-auto"
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            scrollBehavior: 'smooth',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            userSelect: isDragging ? 'none' : 'auto',
            overflowY: 'hidden',
            touchAction: 'auto',
          }}
        >
          <div
            className="flex"
            style={{
              marginLeft: 'calc(clamp(16px, 2vw, 28px) * -1)',
              paddingRight: 'clamp(20px, 4vw, 48px)',
            }}
          >
            {orderedItems.map((item, index) => {
              const isActive = index === selectedIndex;

              return (
                <article
                  key={item.id}
                  ref={(node) => {
                    slideRefs.current[index] = node;
                  }}
                  className="min-w-0 flex-[0_0_100%] md:flex-[0_0_58%] xl:flex-[0_0_44%]"
                  style={{
                    height: 'clamp(480px, 68vh, 720px)',
                    paddingLeft: 'clamp(16px, 2vw, 28px)',
                    scrollSnapAlign: 'start',
                    scrollSnapStop: 'always',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      // backgroundColor: '#FFFFFF',
                      // boxShadow: isActive
                      //   ? '0 18px 42px rgba(15,23,42,0.08)'
                      //   : '0 10px 28px rgba(15,23,42,0.05)',
                      // transform: isActive
                      //   ? 'translate3d(0, 0, 0) scale(1)'
                      //   : 'translate3d(0, 12px, 0) scale(0.976)',
                      // opacity: isActive ? 1 : 0.82,
                      transition: `transform 520ms ${STORY_EASE}, opacity 520ms ${STORY_EASE}, box-shadow 520ms ${STORY_EASE}`,
                      willChange: 'transform, opacity',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '65%',
                        aspectRatio: '1 / 1',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                        borderRadius: '24px',
                        backgroundColor: '#E5E4E2',
                        boxSizing: 'border-box',
                      }}
                    >
                      <ProductStoryMedia item={item} isActive={isActive} />
                    </div>

                    <div
                      style={{
                        paddingTop: 'clamp(8px, 1.8vw, 14px)',
                        display: 'grid',
                        gap: '12px',
                        minHeight: '110px',
                        alignContent: 'start',
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: 'rgba(17,24,39,0.72)',
                          fontSize: 'clamp(15px, 1.6vw, 18px)',
                          lineHeight: 1.4,
                          maxWidth: '34ch',
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
            paddingTop: '24px',
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
              event.currentTarget.style.backgroundColor = '#F0EFEC';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = 'translate3d(0, 0, 0) scale(1)';
              event.currentTarget.style.backgroundColor = 'rgba(229,228,226,0.92)';
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
              event.currentTarget.style.backgroundColor = '#F0EFEC';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = 'translate3d(0, 0, 0) scale(1)';
              event.currentTarget.style.backgroundColor = 'rgba(229,228,226,0.92)';
            }}
          >
            <ArrowRight size={20} strokeWidth={2.1} />
          </button>
        </div>
      </div>
    </section>
  );
}
