import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { HERO_THEMES, createHeroGradient } from "./theme";
import type { WebsiteHeroItem } from "../../services/api/websiteService";
import { getPreloadedHeroAssetMap } from "../homepage/initialHomepageResources";

/**
 * Shared hero carousel system — extracted verbatim from the approved Shop
 * hero implementation so the Entry Gateway uses the EXACT same visual
 * language and behavior: gradient background, model-position composition
 * (center/left/right/back roles), media resolution rules, skeleton preload,
 * transitions, and gesture thresholds.
 *
 * NOTE: keep this module in sync with the Shop page — it IS the Shop hero
 * system, now shared.
 */

export type HeroMediaType = "image" | "video";

export type HeroCarouselItem = {
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

export type Role = "center" | "left" | "right" | "back";
export type Direction = "next" | "prev";

export const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
export const DURATION = 650;
export const GRADIENT_FADE_DURATION = 520;

export const GRAIN_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E";

export const HERO_GRADIENTS = HERO_THEMES.map((item) =>
  createHeroGradient(item.accentColor),
);

if (typeof document !== "undefined") {
  const styleId = "om-hero-skeleton-keyframes";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `@keyframes heroSkeletonPulse { 0% { opacity: 0.38; } 50% { opacity: 0.72; } 100% { opacity: 0.38; } }`;
    document.head.appendChild(style);
  }
}

export function mapHeroItems(
  items: readonly WebsiteHeroItem[],
): HeroCarouselItem[] {
  return [...items]
    .sort(
      (left, right) =>
        left.displayOrder - right.displayOrder ||
        left.id.localeCompare(right.id),
    )
    .map((item, index) => ({
      mediaType: item.mediaType,
      desktopUrl: item.desktopUrl,
      mobileUrl: item.mobileUrl || "",
      poster: item.desktopUrl,
      theme: HERO_THEMES[index % HERO_THEMES.length],
    }));
}

export function resolveHeroMediaSource(
  item: HeroCarouselItem,
  isMobile: boolean,
): string {
  const mobileUrl = String(item.mobileUrl || "").trim();
  if (isMobile && mobileUrl) {
    return mobileUrl;
  }

  return item.desktopUrl;
}

export function getHeroPoster(
  item: HeroCarouselItem,
  isMobile: boolean,
): string {
  return (
    item.poster || item.blurMedia || resolveHeroMediaSource(item, isMobile)
  );
}

export function getHeroBlurMedia(
  item: HeroCarouselItem,
  isMobile: boolean,
): string {
  return item.blurMedia || getHeroPoster(item, isMobile);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getRole(
  index: number,
  activeIndex: number,
  totalItems: number,
): Role {
  if (totalItems <= 1) {
    return index === activeIndex ? "center" : "back";
  }

  const relativeIndex = (index - activeIndex + totalItems) % totalItems;
  if (relativeIndex === 0) return "center";
  if (relativeIndex === 1) return "right";
  if (relativeIndex === totalItems - 1) return "left";
  return "back";
}

export function roleStyle(role: Role, isMobile: boolean): React.CSSProperties {
  switch (role) {
    case "center":
      return {
        left: "50%",
        height: isMobile ? "70%" : "92%",
        bottom: isMobile ? "15%" : 0,
        transform: `translateX(-50%) scale(${isMobile ? 1.2 : 1.26})`,
        filter: "blur(0px)",
        opacity: 1,
        zIndex: 20,
      };
    case "left":
      return {
        left: isMobile ? "20%" : "30%",
        height: isMobile ? "16%" : "28%",
        bottom: isMobile ? "32%" : "12%",
        transform: "translateX(-50%) scale(1)",
        filter: "blur(2px)",
        opacity: 0.85,
        zIndex: 10,
      };
    case "right":
      return {
        left: isMobile ? "80%" : "70%",
        height: isMobile ? "16%" : "28%",
        bottom: isMobile ? "32%" : "12%",
        transform: "translateX(-50%) scale(1)",
        filter: "blur(2px)",
        opacity: 0.85,
        zIndex: 10,
      };
    case "back":
      return {
        left: "50%",
        height: isMobile ? "13%" : "22%",
        bottom: isMobile ? "32%" : "12%",
        transform: "translateX(-50%) scale(1)",
        filter: "blur(4px)",
        opacity: 1,
        zIndex: 5,
      };
  }
}

function isValidHeroAssetUrl(value: string): boolean {
  return /^https?:\/\//i.test(String(value || "").trim());
}

export const HeroGradientBackground = memo(function HeroGradientBackground({
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
  const layerGradientsRef = useRef<[string, string]>([
    fallbackGradient,
    fallbackGradient,
  ]);
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
    const currentVisibleGradient =
      layerGradientsRef.current[currentVisibleLayer];

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

  const baseLayerStyle: React.CSSProperties = useMemo(
    () => ({
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      transition: `opacity ${GRADIENT_FADE_DURATION}ms ${EASE}`,
      willChange: "opacity",
      transform: "translate3d(0,0,0)",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
    }),
    [],
  );

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

export const HeroCarouselImages = memo(function HeroCarouselImages({
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
  const [failedVideoMedia, setFailedVideoMedia] = useState<
    Record<string, boolean>
  >({});
  const [loadedMedia, setLoadedMedia] = useState<Record<string, boolean>>(() =>
    getPreloadedHeroAssetMap(),
  );
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const preloadedMediaRef = useRef<Set<string>>(new Set());

  const markMediaLoaded = useCallback((assetUrl: string) => {
    const normalizedAssetUrl = String(assetUrl || "").trim();
    if (!normalizedAssetUrl) {
      return;
    }

    setLoadedMedia((current) =>
      current[normalizedAssetUrl]
        ? current
        : {
            ...current,
            [normalizedAssetUrl]: true,
          },
    );
  }, []);

  useEffect(() => {
    setLoadedMedia(getPreloadedHeroAssetMap());
    setFailedVideoMedia({});
    preloadedMediaRef.current.clear();
  }, [isMobile, items]);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const preloadIndexes = Array.from(
      new Set([activeIndex, (activeIndex + 1) % items.length]),
    );

    preloadIndexes.forEach((index) => {
      const mediaItem = items[index];
      if (!mediaItem) return;

      const poster = getHeroPoster(mediaItem, isMobile);
      const blurMedia = getHeroBlurMedia(mediaItem, isMobile);
      const mediaSource = resolveHeroMediaSource(mediaItem, isMobile);

      [poster, blurMedia].forEach((assetUrl) => {
        const normalizedAssetUrl = String(assetUrl || "").trim();
        if (
          !isValidHeroAssetUrl(normalizedAssetUrl) ||
          preloadedMediaRef.current.has(normalizedAssetUrl)
        ) {
          return;
        }

        const image = new Image();
        image.onload = () => {
          markMediaLoaded(normalizedAssetUrl);
        };
        image.src = normalizedAssetUrl;
        preloadedMediaRef.current.add(normalizedAssetUrl);
      });

      if (
        mediaItem.mediaType === "video" &&
        isValidHeroAssetUrl(mediaSource) &&
        !preloadedMediaRef.current.has(mediaSource)
      ) {
        const video = document.createElement("video");
        video.preload = "auto";
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
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => undefined);
    }

    return () => {
      activeVideo.pause();
    };
  }, [activeIndex]);

  const hasRenderableItems = useMemo(
    () =>
      items.some((item) => {
        const poster = getHeroPoster(item, isMobile);
        const mediaSource = resolveHeroMediaSource(item, isMobile);
        return isValidHeroAssetUrl(poster) || isValidHeroAssetUrl(mediaSource);
      }),
    [isMobile, items],
  );

  const hasLoadedVisibleMedia = useMemo(
    () =>
      items.some((item) => {
        const poster = getHeroPoster(item, isMobile);
        const blurMedia = getHeroBlurMedia(item, isMobile);
        const mediaSource = resolveHeroMediaSource(item, isMobile);
        return Boolean(
          loadedMedia[poster] ||
          loadedMedia[blurMedia] ||
          loadedMedia[mediaSource],
        );
      }),
    [isMobile, items, loadedMedia],
  );

  return (
    <div className="absolute inset-0" style={{ zIndex: 3 }}>
      {!hasRenderableItems || !hasLoadedVisibleMedia ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: isMobile ? "12%" : "4%",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: isMobile ? "56%" : "26%",
              height: isMobile ? "62%" : "88%",
              borderRadius: "999px 999px 24px 24px",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
              opacity: 0.65,
              animation: "heroSkeletonPulse 1.6s ease-in-out infinite",
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
        const displayImageSource =
          role === "center" && imageItem.mediaType === "image"
            ? mediaSource
            : role === "center"
              ? poster
              : blurMedia;
        const hasValidImageSource = isValidHeroAssetUrl(displayImageSource);
        const hasValidVideoSource = isValidHeroAssetUrl(mediaSource);
        const shouldRenderVideo =
          role === "center" &&
          imageItem.mediaType === "video" &&
          hasValidVideoSource &&
          !failedVideoMedia[mediaSource];
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
              position: "absolute",
              left: style.left,
              bottom: style.bottom,
              height: style.height,
              aspectRatio: "0.6 / 1",
              transform: style.transform,
              filter: style.filter,
              opacity: isMediaReady ? style.opacity : 0,
              zIndex: style.zIndex,
              transition: `transform ${DURATION}ms ${EASE}, filter ${DURATION}ms ${EASE}, opacity ${DURATION}ms ${EASE}, left ${DURATION}ms ${EASE}`,
              willChange: "transform, filter, opacity",
              touchAction: "pan-y",
              cursor: isMobile ? "auto" : "pointer",
            }}
          >
            {shouldRenderVideo ? (
              <video
                ref={role === "center" ? activeVideoRef : null}
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
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "bottom center",
                  backgroundColor: "transparent",
                }}
              />
            ) : (
              <img
                src={displayImageSource}
                alt=""
                draggable={false}
                onLoad={(event) => {
                  markMediaLoaded(
                    event.currentTarget.currentSrc || displayImageSource,
                  );
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "bottom center",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});

/**
 * The exact pointer/keyboard gesture logic used by the Shop hero.
 *
 * - drag/swipe resolves direction after 8px of movement
 * - navigation triggers when the horizontal drag exceeds 24% of the surface
 * - small taps (delta < 8px) fire `onTap` when provided
 * - ArrowLeft/ArrowRight rotate the carousel
 */
export function useHeroGesture({
  surfaceRef,
  rotateHero,
  onTap,
}: {
  surfaceRef: React.RefObject<HTMLElement | null>;
  rotateHero: (direction: Direction) => void;
  onTap?: () => void;
}) {
  const pointerTargetRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
    hasResolvedDirection: false,
    isHorizontal: false,
  });

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

  const resolveGestureNavigation = useCallback(
    (shouldNavigate: boolean) => {
      const pointerTarget = pointerTargetRef.current;
      const gestureSurfaceWidth =
        surfaceRef.current?.clientWidth || window.innerWidth || 1;
      const { deltaX, deltaY, isHorizontal, pointerId } = dragStateRef.current;

      if (shouldNavigate) {
        if (isHorizontal) {
          const threshold = gestureSurfaceWidth * 0.24;
          if (Math.abs(deltaX) >= threshold) {
            rotateHero(deltaX < 0 ? "next" : "prev");
          }
        } else if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) {
          if (onTap) onTap();
        }
      }

      if (pointerTarget && pointerId !== -1) {
        try {
          pointerTarget.releasePointerCapture(pointerId);
        } catch {
          // Ignore browsers that already cancelled pointer capture.
        }
      }

      pointerTargetRef.current = null;
      resetGestureState();
    },
    [onTap, resetGestureState, rotateHero, surfaceRef],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      dragStateRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        deltaX: 0,
        deltaY: 0,
        hasResolvedDirection: false,
        isHorizontal: false,
      };

      pointerTargetRef.current = event.currentTarget;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
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
    },
    [],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (dragStateRef.current.pointerId !== event.pointerId) return;
      resolveGestureNavigation(true);
    },
    [resolveGestureNavigation],
  );

  const handlePointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (dragStateRef.current.pointerId !== event.pointerId) return;
      resolveGestureNavigation(false);
    },
    [resolveGestureNavigation],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        rotateHero("prev");
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        rotateHero("next");
      }
    },
    [rotateHero],
  );

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
    onKeyDown: handleKeyDown,
  };
}
