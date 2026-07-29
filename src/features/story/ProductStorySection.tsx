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

function isValidAssetUrl(value: string): boolean {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return false;
  }

  try {
    const parsed = new URL(normalized);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function ProductStoryMediaPlaceholder() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        color: 'rgba(17,24,39,0.55)',
        fontSize: '14px',
        fontWeight: 500,
      }}
    >
      Media not available
    </div>
  );
}

function ProductStoryMedia({ item, isActive }: { item: ProductStoryItem; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasMediaError, setHasMediaError] = useState(false);
  const mediaType = String(item.mediaType || '').trim().toLowerCase() === 'video' ? 'video' : 'image';
  const mediaUrl = String(item.mediaUrl || '').trim();
  const posterUrl = String(item.posterUrl || '').trim();
  const mediaInstanceKey = `${item.id}:${mediaType}:${mediaUrl}`;
  const shouldRenderVideo = mediaType === 'video' && isValidAssetUrl(mediaUrl);
  const shouldRenderImage = mediaType === 'image' && isValidAssetUrl(mediaUrl);
  const sharedMediaStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center center',
    display: 'block',
  };

  useEffect(() => {
    setHasMediaError(false);
  }, [mediaInstanceKey]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !shouldRenderVideo || hasMediaError) return undefined;

    if (isActive) {
      const playPromise = videoElement.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => undefined);
      }
      return undefined;
    }

    videoElement.pause();
    return undefined;
  }, [hasMediaError, isActive, shouldRenderVideo]);

  if (hasMediaError || (!shouldRenderVideo && !shouldRenderImage)) {
    return <ProductStoryMediaPlaceholder />;
  }

  if (shouldRenderVideo) {
    return (
      <video
        key={mediaInstanceKey}
        ref={videoRef}
        src={mediaUrl}
        poster={isValidAssetUrl(posterUrl) ? posterUrl : undefined}
        muted
        loop
        playsInline
        preload={isActive ? 'auto' : 'metadata'}
        controls={false}
        disablePictureInPicture
        onError={() => setHasMediaError(true)}
        style={sharedMediaStyle}
      />
    );
  }

  return (
    <img
      key={mediaInstanceKey}
      src={mediaUrl}
      alt={item.alt || item.title}
      draggable={false}
      onError={() => setHasMediaError(true)}
      style={sharedMediaStyle}
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

    const currentScrollLeft = viewport.scrollLeft;
    setSelectedIndex(getNearestIndex(currentScrollLeft));
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

  const handleCardClick = useCallback((index: number) => {
    if (index === selectedIndex) {
      return;
    }

    scrollToIndex(clamp(index, 0, orderedItems.length - 1));
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

  return (
    <section
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Product story"
      aria-roledescription="carousel"
      style={{
        position: 'relative',
        background: '#FFFFFF',
        padding: 'clamp(72px, 10vw, 120px) 0 clamp(16px, 3vw, 40px)',
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
              letterSpacing: '-0.04em',
              fontWeight: 500,
            }}
          >
            Designed with <span style={{ fontWeight: 700 }}>Purpose</span>.
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
                  onClick={() => handleCardClick(index)}
                  className="min-w-0 flex-[0_0_78%] md:flex-[0_0_58%] xl:flex-[0_0_44%]"
                  style={{
                    height: 'clamp(480px, 68vh, 720px)',
                    paddingLeft: 'clamp(16px, 2vw, 28px)',
                    scrollSnapAlign: 'start',
                    scrollSnapStop: 'always',
                    cursor: isActive ? 'default' : 'pointer',
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

      </div>
    </section>
  );
}
