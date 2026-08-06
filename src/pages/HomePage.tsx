import { memo, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CatalogLayer } from '../features/catalog';
import { HERO_THEMES, createHeroGradient } from '../features/hero/theme';
import { ProductStorySection, PRODUCT_STORY_ITEMS, type ProductStoryItem } from '../features/story';
import { FeaturedProductsSection } from '../features/featured';
import { HomepageFooter } from '../features/footer';
import {
  websiteService,
  type WebsiteBrandVideo,
  type WebsiteHeroItem as WebsiteHeroCmsItem,
  type WebsiteProductStoryItem as WebsiteProductStoryCmsItem,
} from '../services/api/websiteService';

type HeroMediaType = 'image' | 'video';

type HeroCarouselItem = {
  mediaType: HeroMediaType;
  desktopUrl: string;
  mobileUrl: string;
  poster: string;
  blurMedia?: string;
  theme: {
    title: string;
    accentColor: string;
  };
};

type Role = 'center' | 'left' | 'right' | 'back';
type Direction = 'next' | 'prev';

const DEFAULT_WEBSITE_HERO_ITEMS: WebsiteHeroCmsItem[] = [
  {
    id: 'default-hero-1',
    mediaType: 'image',
    desktopUrl: '',
    mobileUrl: '',
    displayOrder: 1,
    active: true,
  },
  {
    id: 'default-hero-2',
    mediaType: 'image',
    desktopUrl: '',
    mobileUrl: '',
    displayOrder: 2,
    active: true,
  },
  {
    id: 'default-hero-3',
    mediaType: 'image',
    desktopUrl: '',
    mobileUrl: '',
    displayOrder: 3,
    active: true,
  },
  {
    id: 'default-hero-4',
    mediaType: 'image',
    desktopUrl: '',
    mobileUrl: '',
    displayOrder: 4,
    active: true,
  },
];

const DEFAULT_BRAND_VIDEO: WebsiteBrandVideo = {
  id: 'default-brand-video',
  videoUrl: '',
  posterUrl: '',
  active: true,
};

const DEFAULT_WEBSITE_PRODUCT_STORY_ITEMS: WebsiteProductStoryCmsItem[] = PRODUCT_STORY_ITEMS.map((item) => ({
  id: item.id,
  mediaType: item.mediaType,
  mediaUrl: item.mediaUrl,
  description: item.description,
  displayOrder: item.displayOrder ?? 0,
  active: true,
}));

const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const DURATION = 650;
const GRADIENT_FADE_DURATION = 520;
const COLLECTION_REVEAL_SCROLL_RANGE = 220;
const COLLECTION_OVERLAP = 'max(0px, -10vh)';

const GRAIN_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E";

const HERO_GRADIENTS = HERO_THEMES.map((item) => createHeroGradient(item.accentColor));

if (typeof document !== 'undefined') {
  const styleId = 'om-hero-skeleton-keyframes';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `@keyframes heroSkeletonPulse { 0% { opacity: 0.38; } 50% { opacity: 0.72; } 100% { opacity: 0.38; } }`;
    document.head.appendChild(style);
  }
}

function mapHeroItems(items: readonly WebsiteHeroCmsItem[]): HeroCarouselItem[] {
  return [...items]
    .sort((left, right) => left.displayOrder - right.displayOrder || left.id.localeCompare(right.id))
    .map((item, index) => ({
      mediaType: item.mediaType,
      desktopUrl: item.desktopUrl,
      mobileUrl: item.mobileUrl || '',
      poster: item.desktopUrl,
      theme: HERO_THEMES[index % HERO_THEMES.length],
    }));
}

function mapProductStoryItems(items: readonly WebsiteProductStoryCmsItem[]): ProductStoryItem[] {
  return [...items]
    .sort((left, right) => left.displayOrder - right.displayOrder || left.id.localeCompare(right.id))
    .map((item) => ({
      id: item.id,
      title: item.description,
      description: item.description,
      mediaType: item.mediaType,
      mediaUrl: item.mediaUrl,
      alt: item.description,
      displayOrder: item.displayOrder,
    }));
}

function resolveHeroMediaSource(item: HeroCarouselItem, isMobile: boolean): string {
  const mobileUrl = String(item.mobileUrl || '').trim();
  if (isMobile && mobileUrl) {
    return mobileUrl;
  }

  return item.desktopUrl;
}

function getHeroPoster(item: HeroCarouselItem, isMobile: boolean): string {
  return item.poster || item.blurMedia || resolveHeroMediaSource(item, isMobile);
}

function getHeroBlurMedia(item: HeroCarouselItem, isMobile: boolean): string {
  return item.blurMedia || getHeroPoster(item, isMobile);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getRole(index: number, activeIndex: number, totalItems: number): Role {
  if (totalItems <= 1) {
    return index === activeIndex ? 'center' : 'back';
  }

  const relativeIndex = (index - activeIndex + totalItems) % totalItems;
  if (relativeIndex === 0) return 'center';
  if (relativeIndex === 1) return 'right';
  if (relativeIndex === totalItems - 1) return 'left';
  return 'back';
}

function roleStyle(role: Role, isMobile: boolean): React.CSSProperties {
  switch (role) {
    case 'center':
      return {
        left: '50%',
        height: isMobile ? '75%' : '92%',
        bottom: isMobile ? '7.5%' : 0,
        transform: `translateX(-50%) scale(${isMobile ? 1.20 : 1.26})`,
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

const HeroGradientBackground = memo(function HeroGradientBackground({
  activeIndex,
  gradients,
}: {
  activeIndex: number;
  gradients: readonly string[];
}) {
  const fallbackGradient = gradients[0] || HERO_GRADIENTS[0];
  const [visibleLayer, setVisibleLayer] = useState<0 | 1>(0);
  const [layerGradients, setLayerGradients] = useState<[string, string]>([
    fallbackGradient,
    fallbackGradient,
  ]);
  const visibleLayerRef = useRef<0 | 1>(0);
  const layerGradientsRef = useRef<[string, string]>([fallbackGradient, fallbackGradient]);
  const transitionTokenRef = useRef(0);

  useEffect(() => {
    visibleLayerRef.current = visibleLayer;
  }, [visibleLayer]);

  useEffect(() => {
    layerGradientsRef.current = layerGradients;
  }, [layerGradients]);

  useEffect(() => {
    const nextGradient = gradients[activeIndex] || fallbackGradient;
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
  }, [activeIndex, fallbackGradient, gradients]);

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

function isValidHeroAssetUrl(value: string): boolean {
  return /^https?:\/\//i.test(String(value || '').trim());
}

const HeroCarouselImages = memo(function HeroCarouselImages({
  items,
  activeIndex,
  isMobile,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: {
  items: readonly HeroCarouselItem[];
  activeIndex: number;
  isMobile: boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
}) {
  const [failedVideoMedia, setFailedVideoMedia] = useState<Record<string, boolean>>({});
  const [loadedMedia, setLoadedMedia] = useState<Record<string, boolean>>({});
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const preloadedMediaRef = useRef<Set<string>>(new Set());

  const markMediaLoaded = useCallback((assetUrl: string) => {
    const normalizedAssetUrl = String(assetUrl || '').trim();
    if (!normalizedAssetUrl) {
      return;
    }

    setLoadedMedia((current) => (
      current[normalizedAssetUrl]
        ? current
        : {
            ...current,
            [normalizedAssetUrl]: true,
          }
    ));
  }, []);

  useEffect(() => {
    setLoadedMedia({});
    setFailedVideoMedia({});
    preloadedMediaRef.current.clear();
  }, [isMobile, items]);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const preloadIndexes = Array.from(new Set([
      activeIndex,
      (activeIndex + 1) % items.length,
    ]));

    preloadIndexes.forEach((index) => {
      const mediaItem = items[index];
      if (!mediaItem) return;

      const poster = getHeroPoster(mediaItem, isMobile);
      const blurMedia = getHeroBlurMedia(mediaItem, isMobile);
      const mediaSource = resolveHeroMediaSource(mediaItem, isMobile);

      [poster, blurMedia].forEach((assetUrl) => {
        const normalizedAssetUrl = String(assetUrl || '').trim();
        if (!isValidHeroAssetUrl(normalizedAssetUrl) || preloadedMediaRef.current.has(normalizedAssetUrl)) {
          return;
        }

        const image = new Image();
        image.onload = () => {
          markMediaLoaded(normalizedAssetUrl);
        };
        image.src = normalizedAssetUrl;
        preloadedMediaRef.current.add(normalizedAssetUrl);
      });

      if (mediaItem.mediaType === 'video' && isValidHeroAssetUrl(mediaSource) && !preloadedMediaRef.current.has(mediaSource)) {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;
        video.onloadeddata = () => {
          markMediaLoaded(mediaSource);
          if (isValidHeroAssetUrl(poster)) {
            markMediaLoaded(poster);
          }
        };
        video.src = mediaSource;
        video.load();
        preloadedMediaRef.current.add(mediaSource);
      }
    });
  }, [activeIndex, isMobile, items, markMediaLoaded]);

  useEffect(() => {
    const activeVideo = activeVideoRef.current;
    if (!activeVideo) {
      return undefined;
    }

    const playPromise = activeVideo.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => undefined);
    }

    return () => {
      activeVideo.pause();
    };
  }, [activeIndex]);

  const hasRenderableItems = useMemo(() => items.some((item) => {
    const poster = getHeroPoster(item, isMobile);
    const mediaSource = resolveHeroMediaSource(item, isMobile);
    return isValidHeroAssetUrl(poster) || isValidHeroAssetUrl(mediaSource);
  }), [isMobile, items]);

  const hasLoadedVisibleMedia = useMemo(() => items.some((item) => {
    const poster = getHeroPoster(item, isMobile);
    const blurMedia = getHeroBlurMedia(item, isMobile);
    const mediaSource = resolveHeroMediaSource(item, isMobile);
    return Boolean(loadedMedia[poster] || loadedMedia[blurMedia] || loadedMedia[mediaSource]);
  }), [isMobile, items, loadedMedia]);

  return (
    <div className="absolute inset-0" style={{ zIndex: 3 }}>
      {!hasRenderableItems || !hasLoadedVisibleMedia ? (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: isMobile ? '12%' : '4%',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: isMobile ? '56%' : '26%',
              height: isMobile ? '62%' : '88%',
              borderRadius: '999px 999px 24px 24px',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
              opacity: 0.65,
              animation: 'heroSkeletonPulse 1.6s ease-in-out infinite',
              transform: `scale(${isMobile ? 1.08 : 1.12})`,
            }}
          />
        </div>
      ) : null}

      {items.map((imageItem, index) => {
        const role = getRole(index, activeIndex, items.length);
        const style = roleStyle(role, isMobile);
        const mediaSource = resolveHeroMediaSource(imageItem, isMobile);
        const poster = getHeroPoster(imageItem, isMobile);
        const blurMedia = getHeroBlurMedia(imageItem, isMobile);
        const mediaKey = `${imageItem.desktopUrl}-${imageItem.mobileUrl}-${index}`;
        const displayImageSource = role === 'center' ? poster : blurMedia;
        const hasValidImageSource = isValidHeroAssetUrl(displayImageSource);
        const hasValidVideoSource = isValidHeroAssetUrl(mediaSource);
        const shouldRenderVideo = role === 'center'
          && imageItem.mediaType === 'video'
          && hasValidVideoSource
          && !failedVideoMedia[mediaSource];
        const isMediaReady = shouldRenderVideo
          ? Boolean(loadedMedia[mediaSource] || loadedMedia[poster])
          : Boolean(loadedMedia[displayImageSource]);

        if (!shouldRenderVideo && !hasValidImageSource) {
          return null;
        }

        return (
          <div
            key={mediaKey}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            style={{
              position: 'absolute',
              left: style.left,
              bottom: style.bottom,
              height: style.height,
              aspectRatio: '0.6 / 1',
              transform: style.transform,
              filter: style.filter,
              opacity: isMediaReady ? style.opacity : 0,
              zIndex: style.zIndex,
              transition: `transform ${DURATION}ms ${EASE}, filter ${DURATION}ms ${EASE}, opacity ${DURATION}ms ${EASE}, left ${DURATION}ms ${EASE}`,
              willChange: 'transform, filter, opacity',
              touchAction: 'pan-y',
              cursor: isMobile ? 'auto' : 'pointer',
            }}
          >
            {shouldRenderVideo ? (
              <video
                ref={role === 'center' ? activeVideoRef : null}
                src={mediaSource}
                poster={poster}
                autoPlay
                muted
                playsInline
                loop
                preload="auto"
                disablePictureInPicture
                controls={false}
                onLoadedData={() => {
                  markMediaLoaded(mediaSource);
                  if (isValidHeroAssetUrl(poster)) {
                    markMediaLoaded(poster);
                  }
                }}
                onError={() => {
                  setFailedVideoMedia((current) => ({
                    ...current,
                    [mediaSource]: true,
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
                src={displayImageSource}
                alt=""
                draggable={false}
                onLoad={(event) => {
                  markMediaLoaded(event.currentTarget.currentSrc || displayImageSource);
                }}
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
  onCollectionSelect: () => void;
}

export function HomePage({ activeIndex, onActiveIndexChange, onProductSelect, onCollectionSelect }: HomePageProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );
  const [collectionRevealProgress, setCollectionRevealProgress] = useState(0);
  const [heroCmsItems, setHeroCmsItems] = useState<WebsiteHeroCmsItem[]>(DEFAULT_WEBSITE_HERO_ITEMS);
  const [brandVideo, setBrandVideo] = useState<WebsiteBrandVideo | null>(DEFAULT_BRAND_VIDEO);
  const [productStoryCmsItems, setProductStoryCmsItems] = useState<WebsiteProductStoryCmsItem[]>(DEFAULT_WEBSITE_PRODUCT_STORY_ITEMS);
  const heroItems = useMemo(() => mapHeroItems(heroCmsItems), [heroCmsItems]);
  const productStoryItems = useMemo(() => mapProductStoryItems(productStoryCmsItems), [productStoryCmsItems]);
  const heroGradients = useMemo(() => {
    if (heroItems.length === 0) {
      return [HERO_GRADIENTS[0]];
    }

    return heroItems.map((item) => createHeroGradient(item.theme.accentColor));
  }, [heroItems]);
  const resolvedActiveIndex = heroItems.length > 0 ? activeIndex % heroItems.length : 0;
  const heroSceneRef = useRef<HTMLElement | null>(null);
  const collectionSceneRef = useRef<HTMLElement | null>(null);
  const heroPointerTargetRef = useRef<HTMLDivElement | null>(null);
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
    let isCancelled = false;

    const loadWebsiteContent = async () => {
      try {
        const response = await websiteService.getHomepageContent();
        if (isCancelled) {
          return;
        }

        setHeroCmsItems(Array.isArray(response.heroItems) ? response.heroItems : []);
        setBrandVideo(response.brandVideo ?? null);
        setProductStoryCmsItems(Array.isArray(response.productStoryItems) ? response.productStoryItems : []);
      } catch {
        // Keep the existing fallback content when the CMS request is unavailable.
      }
    };

    void loadWebsiteContent();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (heroItems.length === 0) {
      return;
    }

    if (activeIndex >= heroItems.length) {
      onActiveIndexChange(0);
    }
  }, [activeIndex, heroItems.length, onActiveIndexChange]);

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
    if (isAnimating || heroItems.length <= 1) return;

    setIsAnimating(true);
    const nextIndex = direction === 'next'
      ? (resolvedActiveIndex + 1) % heroItems.length
      : (resolvedActiveIndex + heroItems.length - 1) % heroItems.length;
    onActiveIndexChange(nextIndex);
    window.setTimeout(() => setIsAnimating(false), DURATION);
  }, [heroItems.length, isAnimating, onActiveIndexChange, resolvedActiveIndex]);

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
    const pointerTarget = heroPointerTargetRef.current;
    const gestureSurfaceWidth = heroSceneRef.current?.clientWidth || window.innerWidth || 1;
    const { deltaX, deltaY, isHorizontal, pointerId } = dragStateRef.current;

    if (shouldNavigate) {
      if (isHorizontal) {
        const threshold = gestureSurfaceWidth * 0.24;
        if (Math.abs(deltaX) >= threshold) {
          rotateHero(deltaX < 0 ? 'next' : 'prev');
        }
      } else if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) {
        onCollectionSelect();
      }
    }

    if (pointerTarget && pointerId !== -1) {
      try {
        pointerTarget.releasePointerCapture(pointerId);
      } catch {
        // Ignore browsers that already cancelled pointer capture.
      }
    }

    heroPointerTargetRef.current = null;
    resetGestureState();
  }, [onCollectionSelect, resetGestureState, rotateHero]);

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

    heroPointerTargetRef.current = event.currentTarget;
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
        fontFamily: "'SF-Pro-Display', sans-serif",
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
          <HeroGradientBackground activeIndex={resolvedActiveIndex} gradients={heroGradients} />

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
              fontSize: isMobile ? 'clamp(120px, 36vw, 170px)' : 'clamp(70px, 19vw, 380px)',
              fontWeight: 400,
              color: '#ffffff',
              opacity: 0.6,
              lineHeight: isMobile ? 0.68 : 1,
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

          <HeroCarouselImages
            items={heroItems}
            activeIndex={resolvedActiveIndex}
            isMobile={isMobile}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          />

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

      {brandVideo ? (
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
            src={brandVideo.videoUrl}
            poster={brandVideo.posterUrl}
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
      ) : null}

      <ProductStorySection items={productStoryItems} backgroundImage={heroGradients[resolvedActiveIndex]} />
      <FeaturedProductsSection onProductSelect={onProductSelect} />
      <HomepageFooter />
    </div>
  );
}
