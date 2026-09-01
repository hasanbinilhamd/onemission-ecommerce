import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { env } from '../../app/config/env';

/**
 * Entry Gateway — first-visit split experience.
 *
 * Full-screen brand gateway shown once (localStorage "onemission_entry_seen")
 * before the Home experience. Two paths:
 *   JOIN THE MISSION → /
 *   SHOP ON SHOPEE   → configured VITE_SHOPEE_STORE_URL (single source of truth)
 *
 * Desktop: 50/50 editorial split with a subtle hover expansion (55/45) via CSS
 * transitions. Mobile: stacked large panels, tap to navigate (no hover).
 *
 * No CMS, no analytics, no new dependencies. Left panel reuses an existing
 * silhouette asset (no visible faces/eyes).
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

  if (!showGateway) {
    return <>{children}</>;
  }

  const shopeeUrl = env.shopeeStoreUrl.trim();

  const handleJoinMission = () => {
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

  return <EntryGateway onJoinMission={handleJoinMission} onShopOnShopee={handleShopOnShopee} shopeeUrl={shopeeUrl} shopeeMissing={shopeeMissing} />;
}

interface EntryGatewayProps {
  onJoinMission: () => void;
  onShopOnShopee: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  shopeeUrl: string;
  shopeeMissing: boolean;
}

function EntryGateway({ onJoinMission, onShopOnShopee, shopeeUrl, shopeeMissing }: EntryGatewayProps) {
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
      className="min-h-dvh w-full bg-white font-['SF-Pro-Display',_sans-serif]"
      style={{ minHeight: '100dvh' }}
    >
      {/* ─── BRAND HEADER ─────────────────────────────────────────────── */}
      <div
        className="relative z-10 flex items-baseline gap-3 px-5 py-4 lg:absolute lg:inset-x-0 lg:top-0 lg:px-10 lg:py-5 lg:[mix-blend-mode:difference]"
      >
        <span className="text-sm font-bold uppercase tracking-[0.28em] text-neutral-900 lg:text-white">
          One Mission
        </span>
        <span className="hidden text-[10px] font-semibold uppercase tracking-[0.32em] text-neutral-400 sm:inline lg:text-white/80">
          Values In Motion.
        </span>
      </div>

      {/* ─── SPLIT PANELS ─────────────────────────────────────────────── */}
      <div className="flex min-h-dvh flex-col lg:flex-row" style={{ minHeight: '100dvh' }}>
        {/* LEFT — JOIN THE MISSION (dark, image-driven) */}
        <button
          type="button"
          onClick={onJoinMission}
          onMouseEnter={() => setHoveredPanel('left')}
          onMouseLeave={() => setHoveredPanel(null)}
          aria-label="Join the Mission — enter the One Mission website"
          className="group relative flex min-h-[52dvh] w-full flex-col justify-end overflow-hidden bg-[#0A0A0A] p-6 text-left text-white transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white sm:p-10 lg:min-h-0 lg:p-14"
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
              The Movement
            </p>
            <h2 className="mt-3 text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
              Join The
              <span className="block">Mission</span>
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/80">
              Be part of what we're building.
              <span className="block">Move with purpose.</span>
            </p>
            <span className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-900 transition-transform duration-300 group-hover:scale-[1.03]">
              Enter The Mission
              <ArrowRight size={15} strokeWidth={2.5} />
            </span>
          </div>
        </button>

        {/* RIGHT — SHOP ON SHOPEE (light, product-oriented) */}
        <a
          href={shopeeUrl || undefined}
          onClick={onShopOnShopee}
          onMouseEnter={() => setHoveredPanel('right')}
          onMouseLeave={() => setHoveredPanel(null)}
          aria-label="Shop on Shopee — open the official One Mission Shopee store"
          className="group relative flex min-h-[48dvh] w-full flex-col justify-end bg-white p-6 text-left text-neutral-900 transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-neutral-900 sm:p-10 lg:min-h-0 lg:p-14"
          style={{ flexBasis: isDesktop ? rightBasis : 'auto' }}
        >
          <div className="relative z-10 max-w-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
              The Gear
            </p>
            <h2 className="mt-3 text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
              Shop On
              <span className="block">Shopee</span>
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-500">
              Wear the movement.
              <span className="block">Explore our latest gear.</span>
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
