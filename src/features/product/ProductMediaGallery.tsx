import { Play } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IMAGE_PLACEHOLDER } from '../../app/constants';
import { useMediaQuery } from '../../hooks';
import type { Product, ProductGalleryItem } from '../../types';

function buildGalleryItems(product: Product): ProductGalleryItem[] {
  if (Array.isArray(product.galleryItems) && product.galleryItems.length > 0) {
    return [...product.galleryItems]
      .sort((left, right) => left.sortOrder - right.sortOrder || left.id.localeCompare(right.id))
      .map((item, index) => ({
        id: item.id || `${product.id}-gallery-${index + 1}`,
        mediaType: (item.mediaType === 'video' ? 'video' : 'image') as 'image' | 'video',
        mediaUrl: String(item.mediaUrl || '').trim(),
        sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index + 1,
      }))
      .filter((item) => Boolean(item.mediaUrl));
  }

  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images
      .map((mediaUrl, index) => ({
        id: `${product.id}-image-${index + 1}`,
        mediaType: 'image' as const,
        mediaUrl,
        sortOrder: index + 1,
      }))
      .filter((item) => Boolean(item.mediaUrl));
  }

  const fallbackUrl = String(product.imageUrl || '').trim() || IMAGE_PLACEHOLDER;
  return [{
    id: `${product.id}-fallback-thumbnail`,
    mediaType: 'image',
    mediaUrl: fallbackUrl,
    sortOrder: 1,
  }];
}

function VideoBadge() {
  return (
    <div
      style={{
        position: 'absolute',
        right: '10px',
        bottom: '10px',
        width: '34px',
        height: '34px',
        borderRadius: '9999px',
        backgroundColor: 'rgba(17,24,39,0.76)',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 20px rgba(17,24,39,0.18)',
      }}
    >
      <Play size={14} fill="currentColor" />
    </div>
  );
}

function ProductMediaSurface({ item, alt, eager = false }: { item: ProductGalleryItem; alt: string; eager?: boolean }) {
  if (item.mediaType === 'video') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <video
          src={item.mediaUrl}
          controls
          playsInline
          preload={eager ? 'metadata' : 'none'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            backgroundColor: '#000000',
          }}
        />
        <VideoBadge />
      </div>
    );
  }

  return (
    <img
      src={item.mediaUrl || IMAGE_PLACEHOLDER}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        objectPosition: 'center',
        display: 'block',
      }}
      onError={(event) => {
        event.currentTarget.src = IMAGE_PLACEHOLDER;
      }}
    />
  );
}

export function ProductMediaGallery({ product }: { product: Product }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const galleryItems = useMemo(() => buildGalleryItems(product), [product]);
  const [activeIndex, setActiveIndex] = useState(0);
  const mobileScrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveIndex(0);
    if (mobileScrollerRef.current) {
      mobileScrollerRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [product.id, galleryItems.length]);

  const activeItem = galleryItems[activeIndex] ?? galleryItems[0];

  useEffect(() => {
    if (isDesktop || !mobileScrollerRef.current) {
      return undefined;
    }

    const scroller = mobileScrollerRef.current;
    const handleScroll = () => {
      const slideWidth = scroller.clientWidth || 1;
      const nextIndex = Math.round(scroller.scrollLeft / slideWidth);
      setActiveIndex((currentIndex) => {
        if (currentIndex === nextIndex) {
          return currentIndex;
        }
        return Math.max(0, Math.min(nextIndex, galleryItems.length - 1));
      });
    };

    scroller.addEventListener('scroll', handleScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', handleScroll);
  }, [galleryItems.length, isDesktop]);

  const scrollToMobileSlide = (index: number) => {
    if (!mobileScrollerRef.current) {
      return;
    }

    const slideWidth = mobileScrollerRef.current.clientWidth || 1;
    mobileScrollerRef.current.scrollTo({
      left: slideWidth * index,
      behavior: 'smooth',
    });
  };

  if (!activeItem) {
    return null;
  }

  return (
    <div style={{ width: '100%' }}>
      {isDesktop ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: galleryItems.length > 1 ? '96px minmax(0, 1fr)' : 'minmax(0, 1fr)',
            gap: '16px',
            alignItems: 'start',
          }}
        >
          {galleryItems.length > 1 ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              {galleryItems.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`View media ${index + 1}`}
                    style={{
                      position: 'relative',
                      width: '96px',
                      height: '120px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      padding: 0,
                      border: isActive ? '2px solid #111827' : '1px solid #E5E7EB',
                      backgroundColor: '#F7F7F5',
                      cursor: 'pointer',
                      transition: 'border-color 200ms ease, transform 200ms ease',
                    }}
                  >
                    <ProductMediaSurface item={item} alt={`${product.name} media ${index + 1}`} />
                  </button>
                );
              })}
            </div>
          ) : null}

          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '620px',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#F7F7F5',
              border: '1px solid #F3F4F6',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, padding: '24px' }}>
              <ProductMediaSurface
                key={`${activeItem.id}:${activeItem.mediaType}:${activeItem.mediaUrl}`}
                item={activeItem}
                alt={product.name}
                eager
              />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '14px' }}>
          <div
            ref={mobileScrollerRef}
            style={{
              display: 'flex',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              borderRadius: '12px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            className="product-media-mobile-scroller"
          >
            {galleryItems.map((item, index) => (
              <div
                key={item.id}
                style={{
                  position: 'relative',
                  flex: '0 0 100%',
                  minWidth: '100%',
                  scrollSnapAlign: 'start',
                  scrollSnapStop: 'always',
                  backgroundColor: '#F7F7F5',
                  border: '1px solid #F3F4F6',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <div style={{ width: '100%', aspectRatio: '4 / 5', padding: '16px' }}>
                  <ProductMediaSurface
                    item={item}
                    alt={`${product.name} media ${index + 1}`}
                    eager={index === activeIndex}
                  />
                </div>
              </div>
            ))}
          </div>

          {galleryItems.length > 1 ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {galleryItems.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={`${item.id}-dot`}
                    type="button"
                    aria-label={`Go to media ${index + 1}`}
                    onClick={() => {
                      setActiveIndex(index);
                      scrollToMobileSlide(index);
                    }}
                    style={{
                      width: isActive ? '22px' : '8px',
                      height: '8px',
                      borderRadius: '9999px',
                      border: 'none',
                      backgroundColor: isActive ? '#111827' : '#D1D5DB',
                      transition: 'width 220ms ease, background-color 220ms ease',
                      padding: 0,
                    }}
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
