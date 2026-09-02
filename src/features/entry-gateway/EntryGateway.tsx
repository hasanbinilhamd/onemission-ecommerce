import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { env } from '../../app/config/env';
import { websiteService, type WebsiteHeroItem } from '../../services/api/websiteService';

/**
 * Entry Gateway — hero-first entry experience (redesigned).
 *
 * ONE full-screen hero (reusing the SAME approved Shop hero media source —
 * the Website CMS hero items, active + ordered by displayOrder) with the
 * One Mission brand mark and TWO simple bottom actions:
 *
 *   ENTER ONEMISSION →   (the complete One Mission website at /)
 *   SHOP IN SHOPEE ↗     (configured VITE_SHOPEE_STORE_URL)
 *
 * TRUE ENTRY GATE behavior is preserved: while open, the gateway renders as
 * a fixed overlay above the entire application shell (navbar, bottom nav,
 * search/cart/account, page content) via a portal to document.body; the app
 * root is marked inert (keyboard/a11y), body scrolling is locked, and the
 * underlying website is unreachable until a path is chosen.
 *
 * Loading → full-screen dark skeleton, then a fade into the real hero
 * (never dummy imagery). No hero media → minimal brand-safe presentation
 * (never fabricated images). Persistence (`onemission_entry_seen`) and the
 * Shopee URL source of truth are unchanged. No new CMS.
 */

const ENTRY_SEEN_KEY = 'onemission_entry_seen';

function readEntryGatewaySeen(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(ENTRY_SEEN_KEY) === 'true';
  } catch {
    return true;
  }
}

function persistEntryGatewaySeen() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ENTRY_SEEN_KEY, 'true');
  } catch {
    // Persistence is best-effort; the gateway may re-appear if storage fails.
  }
}

function useIsMobileViewport(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches,
  );

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return isMobile;
}

/** Same media resolution rule as the approved Shop hero. */
function resolveHeroMediaSource(item: WebsiteHeroItem, isMobile: boolean): string {
  const mobileUrl = String(item.mobileUrl || '').trim();
  if (isMobile && mobileUrl) return mobileUrl;
  return String(item.desktopUrl || '').trim();
}

interface HomeEntryGateProps {
  children: React.ReactNode;
}

/**
 * Mounted ONLY on the `/` route. Direct visits to /shop, /mission, /impact,
 * /donate never pass through here.
 */
export function HomeEntryGate({ children }: HomeEntryGateProps) {
  const [showGateway, setShowGateway] = useState(() => !readEntryGatewaySeen());
  const [shopeeMissing, setShopeeMissing] = useState(false);

  useEffect(() => {
    if (!showGateway) return undefined;

    const rootElement = document.getElementById('root');
    if (rootElement) {
      try {
        (rootElement as HTMLElement & { inert?: boolean }).inert = true;
      } catch {
        rootElement.setAttribute('inert', '');
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      if (rootElement) {
        try {
          (rootElement as HTMLElement & { inert?: boolean }).inert = false;
        } catch {
          rootElement.removeAttribute('inert');
        }
      }
      document.body.style.overflow = previousOverflow;
    };
  }, [showGateway]);

  if (!showGateway) {
    return <>{children}</>;
  }

  const shopeeUrl = env.shopeeStoreUrl.trim();

  const handleEnterOnemission = () => {
    persistEntryGatewaySeen();
    setShowGateway(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  const handleShopOnShopee = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!shopeeUrl) {
      event.preventDefault();
      setShopeeMissing(true);
      return;
    }
    persistEntryGatewaySeen();
  };

  if (typeof document === 'undefined') return null;
  return createPortal(
    <EntryGateway
      onEnterOnemission={handleEnterOnemission}
      onShopOnShopee={handleShopOnShopee}
      shopeeUrl={shopeeUrl}
      shopeeMissing={shopeeMissing}
    />,
    document.body,
  );
}

interface EntryGatewayProps {
  onEnterOnemission: () => void;
  onShopOnShopee: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  shopeeUrl: string;
  shopeeMissing: boolean;
}

type HeroState =
  | { status: 'loading' }
  | { status: 'ready'; sources: string[] };

function EntryGateway({ onEnterOnemission, onShopOnShopee, shopeeUrl, shopeeMissing }: EntryGatewayProps) {
  const isMobile = useIsMobileViewport();
  const [heroState, setHeroState] = useState<HeroState>({ status: 'loading' });
  const [activeIndex, setActiveIndex] = useState(0);
  const [heroRevealed, setHeroRevealed] = useState(false);
  const pointerStartRef = useRef<{ x: number; y: number; id: number } | null>(null);

  // Reuse the approved Shop hero media source (Website CMS hero items).
  useEffect(() => {
    let isActive = true;
    websiteService
      .getHeroItems()
      .then((items) => {
        if (!isActive) return;
        const sources = [...(Array.isArray(items) ? items : [])]
          .filter((item) => item.active !== false)
          .sort((left, right) => Number(left.displayOrder || 0) - Number(right.displayOrder || 0))
          .map((item) => resolveHeroMediaSource(item, isMobile))
          .filter(Boolean);

        setHeroState({ status: 'ready', sources });
        setActiveIndex(0);
      })
      .catch(() => {
        if (isActive) setHeroState({ status: 'ready', sources: [] });
      });
    return () => {
      isActive = false;
    };
  }, [isMobile]);

  const sources = useMemo(
    () => (heroState.status === 'ready' ? heroState.sources : []),
    [heroState],
  );
  const resolvedIndex = sources.length > 0 ? activeIndex % sources.length : 0;

  // Fade into the real hero once the first asset has actually loaded.
  const firstSource = sources[0] || '';
  useEffect(() => {
    setHeroRevealed(false);
    if (!firstSource) return undefined;
    let isActive = true;
    const image = new Image();
    image.onload = () => {
      if (isActive) setHeroRevealed(true);
    };
    image.onerror = () => {
      // Even a broken first asset shouldn't block the gate — reveal the
      // brand-safe backdrop.
      if (isActive) setHeroRevealed(true);
    };
    image.src = firstSource;
    return () => {
      isActive = false;
    };
  }, [firstSource]);

  const goTo = useCallback((index: number) => {
    if (sources.length <= 1) return;
    setActiveIndex((current) => {
      const base = current % sources.length;
      return (base + index + sources.length) % sources.length;
    });
  }, [sources.length]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(1);
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start || start.id !== event.pointerId) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    goTo(deltaX > 0 ? -1 : 1);
  };

  const preloadedSources = useMemo(() => {
    if (sources.length === 0) return [];
    const next = (resolvedIndex + 1) % sources.length;
    return Array.from(new Set([sources[resolvedIndex], sources[next]])).filter(Boolean);
  }, [sources, resolvedIndex]);

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden bg-[#0A0A0A] font-['SF-Pro-Display',_sans-serif]"
      style={{ height: '100dvh' }}
      role="dialog"
      aria-modal="true"
      aria-label="One Mission entry"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* ─── HERO (edge-to-edge, unified surface) ─────────────────────── */}
      <div
        className="absolute inset-0"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {sources.length > 0 ? (
          <div
            aria-roledescription="carousel"
            aria-label="One Mission hero"
            className="absolute inset-0"
          >
            {preloadedSources.map((source) => {
              const isActiveLayer = source === sources[resolvedIndex];
              return (
                <img
                  key={source}
                  src={source}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="absolute inset-0 h-full w-full select-none object-cover"
                  style={{
                    opacity: isActiveLayer ? 1 : 0,
                    transition: 'opacity 900ms ease',
                  }}
                />
              );
            })}

            {/* Subtle bottom gradient keeps the actions readable on any image */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
            />

            {/* Carousel controls (desktop + tablet) */}
            {sources.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(-1)}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:flex"
                  style={{ width: 44, height: 44 }}
                >
                  <ChevronLeft size={26} strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(1)}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:flex"
                  style={{ width: 44, height: 44 }}
                >
                  <ChevronRight size={26} strokeWidth={1.75} />
                </button>
              </>
            )}
          </div>
        ) : (
          /* No hero media → minimal brand-safe backdrop (never fabricated) */
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-[#16181D] via-[#0A0A0A] to-[#0A0A0A]"
          />
        )}

        {/* Loading skeleton → fades out when the real hero is ready */}
        <div
          aria-hidden="true"
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: heroRevealed ? 0 : 1,
            pointerEvents: 'none',
            background: 'linear-gradient(180deg, #16181D 0%, #0A0A0A 100%)',
          }}
        >
          <div className="h-full w-full animate-pulse bg-neutral-800/25" />
        </div>
      </div>

      {/* ─── BRAND MARK (navbar is hidden while the gate is open) ──────── */}
      <div className="pointer-events-none absolute left-5 top-5 z-20 lg:left-8 lg:top-6">
        <img
          src="/white_om_logo.png"
          alt="One Mission"
          className="h-7 w-auto lg:h-8 [mix-blend-mode:difference]"
        />
      </div>

      {/* ─── BOTTOM ACTIONS (two simple, semantic choices) ─────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 px-5 pb-6 sm:px-10 sm:pb-8 lg:px-14 lg:pb-10"
        style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}
      >
        <button
          type="button"
          onClick={onEnterOnemission}
          aria-label="Enter Onemission — open the complete One Mission website"
          className="group inline-flex items-center gap-2.5 text-left text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.22em] sm:text-base">
            Enter Onemission
          </span>
          <ArrowRight
            size={16}
            strokeWidth={2}
            className="shrink-0 text-white/80 transition-transform duration-300 group-hover:translate-x-1"
          />
        </button>

        <div className="flex flex-col items-end gap-2">
          <a
            href={shopeeUrl || undefined}
            onClick={onShopOnShopee}
            target={shopeeUrl ? '_blank' : undefined}
            rel={shopeeUrl ? 'noreferrer' : undefined}
            aria-label="Shop in Shopee — open the official One Mission Shopee store"
            className="group inline-flex items-center gap-2.5 text-right text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span className="text-sm font-semibold uppercase tracking-[0.22em] sm:text-base">
              Shop in Shopee
            </span>
            <ArrowUpRight
              size={16}
              strokeWidth={2}
              className="shrink-0 text-white/80 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
          {shopeeMissing && (
            <p className="max-w-[220px] text-right text-[11px] font-medium text-amber-300" role="alert">
              Shopee destination is not configured. Set VITE_SHOPEE_STORE_URL.
            </p>
          )}
        </div>
      </div>

      {/* ─── HERO INDICATORS (multi-image only) ────────────────────────── */}
      {sources.length > 1 && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 z-10 flex justify-center gap-1.5"
          style={{ paddingBottom: 'max(6.5rem, calc(env(safe-area-inset-bottom) + 6rem))' }}
        >
          {sources.map((source, index) => (
            <span
              key={source}
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: index === resolvedIndex ? 22 : 6,
                backgroundColor: index === resolvedIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
