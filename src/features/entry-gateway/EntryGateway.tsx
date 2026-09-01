import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight } from 'lucide-react';
import { env } from '../../app/config/env';

/**
 * Entry Gateway — TRUE full-screen entry gate.
 *
 * Shown once per browser (localStorage "onemission_entry_seen") before the
 * Home experience. While active, the gateway is rendered as a fixed overlay
 * ABOVE the entire application shell (navbar, bottom nav, search, cart,
 * account, page content) and blocks all underlying interaction:
 *   - pointer events are covered by the overlay itself
 *   - the app root is marked `inert` so keyboard focus cannot escape
 *   - body scrolling is locked while the gate is open
 *
 * Two paths:
 *   ENTER ONEMISSION → the complete One Mission website (Home at /)
 *   SHOP ON SHOPEE   → configured VITE_SHOPEE_STORE_URL (single source of truth)
 *
 * Desktop: 50/50 editorial split, subtle hover expansion (56/44) via CSS.
 * Mobile: stacked large panels, tap to navigate (no hover simulation).
 *
 * Dev testing: remove localStorage["onemission_entry_seen"] and refresh.
 * No CMS, no analytics, no new dependencies.
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

  // While the gate is open, the underlying website is completely inert:
  // pointer events are covered by the fixed overlay, the app root is marked
  // inert (keyboard/a11y), and body scrolling is locked.
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

  const gateway = (
    <EntryGateway
      onEnterOnemission={handleEnterOnemission}
      onShopOnShopee={handleShopOnShopee}
      shopeeUrl={shopeeUrl}
      shopeeMissing={shopeeMissing}
    />
  );

  if (typeof document === 'undefined') return null;
  return createPortal(gateway, document.body);
}

interface EntryGatewayProps {
  onEnterOnemission: () => void;
  onShopOnShopee: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  shopeeUrl: string;
  shopeeMissing: boolean;
}

function EntryGateway({ onEnterOnemission, onShopOnShopee, shopeeUrl, shopeeMissing }: EntryGatewayProps) {
  const [hoveredPanel, setHoveredPanel] = useState<'left' | 'right' | null>(null);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches,
  );

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const leftBasis = hoveredPanel === 'left' ? '56%' : hoveredPanel === 'right' ? '44%' : '50%';
  const rightBasis = hoveredPanel === 'right' ? '56%' : hoveredPanel === 'left' ? '44%' : '50%';

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-white font-['SF-Pro-Display',_sans-serif]"
      style={{ height: '100dvh' }}
      role="dialog"
      aria-modal="true"
      aria-label="One Mission entry"
    >
      {/* ─── BRAND MARK (navbar is hidden while the gate is open) ──────── */}
      <div className="pointer-events-none absolute left-5 top-5 z-30 flex items-center gap-3 lg:left-8 lg:top-6">
        <img
          src="/white_om_logo.png"
          alt="One Mission"
          className="h-7 w-auto lg:h-8 [mix-blend-mode:difference]"
        />
        <span className="hidden text-[10px] font-semibold uppercase tracking-[0.32em] text-neutral-400 sm:inline lg:text-white/70 lg:[mix-blend-mode:difference]">
          Values In Motion.
        </span>
      </div>

      {/* ─── SPLIT PANELS ─────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* LEFT — ENTER ONEMISSION (dark, image-driven, brand) */}
        <button
          type="button"
          onClick={onEnterOnemission}
          onMouseEnter={() => setHoveredPanel('left')}
          onMouseLeave={() => setHoveredPanel(null)}
          aria-label="Enter Onemission — open the complete One Mission website"
          className="group relative flex w-full flex-1 flex-col justify-end overflow-hidden bg-[#0A0A0A] p-6 text-left text-white transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white sm:p-10 lg:p-14"
          style={{ flexBasis: isDesktop ? leftBasis : 'auto' }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03]"
            style={{ backgroundImage: "url('/images/donate/donate-hero.jpg')" }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/55 to-[#0A0A0A]/25"
          />

          <div className="relative z-10 max-w-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/60">
              Onemission Exclusive
            </p>
            <h2 className="mt-3 text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
              Enter
              <span className="block">Onemission</span>
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/80">
              The movement, the stories, and exclusive pieces you won't find everywhere.
            </p>
            <span className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-900 transition-transform duration-300 group-hover:scale-[1.03]">
              Enter Onemission
              <ArrowRight size={15} strokeWidth={2.5} />
            </span>
          </div>
        </button>

        {/* RIGHT — SHOP ON SHOPEE (light, commerce-oriented) */}
        <a
          href={shopeeUrl || undefined}
          onClick={onShopOnShopee}
          onMouseEnter={() => setHoveredPanel('right')}
          onMouseLeave={() => setHoveredPanel(null)}
          aria-label="Shop on Shopee — open the official One Mission Shopee store"
          className="group relative flex w-full flex-1 flex-col justify-end bg-white p-6 text-left text-neutral-900 transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-neutral-900 sm:p-10 lg:p-14"
          style={{ flexBasis: isDesktop ? rightBasis : 'auto' }}
        >
          <div className="relative z-10 max-w-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
              Official Store
            </p>
            <h2 className="mt-3 text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
              Shop On
              <span className="block">Shopee</span>
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-500">
              Explore our everyday collection through the One Mission official Shopee store.
            </p>
            <span className="mt-8 inline-flex items-center gap-3 rounded-full bg-neutral-900 px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white transition-transform duration-300 group-hover:scale-[1.03]">
              Shop Now
              <ArrowRight size={15} strokeWidth={2.5} />
            </span>

            {shopeeMissing && (
              <p className="mt-4 text-xs font-medium text-red-600" role="alert">
                Shopee destination is not configured. Set VITE_SHOPEE_STORE_URL.
              </p>
            )}
          </div>
        </a>
      </div>
    </div>
  );
}
