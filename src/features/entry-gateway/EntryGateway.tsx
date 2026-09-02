import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { env } from "../../app/config/env";
import {
  websiteService,
  type WebsiteHeroItem,
} from "../../services/api/websiteService";
import { createHeroGradient } from "../hero/theme";
import {
  GRAIN_SVG,
  HERO_GRADIENTS,
  HeroCarouselImages,
  HeroGradientBackground,
  mapHeroItems,
  useHeroGesture,
  type Direction,
} from "../hero/carousel";

/**
 * Entry Gateway — the Shop hero adapted as the opening screen.
 *
 * The gateway reuses the EXACT Shop hero system (shared module
 * features/hero/carousel): the same gradient background, the same
 * center/left/right/back model composition, the same desktop/mobile media
 * resolution, the same skeleton preload, the same transitions and gesture
 * thresholds. Visually it IS the Shop hero — without the "VALUES MATTER"
 * headline and without Shop's collection below it.
 *
 * On top of the hero sit only:
 *   - the One Mission logo (top-left, same sizing philosophy as Shop)
 *   - two small editorial bottom actions:
 *       ENTER ONEMISSION →
 *       SHOP IN SHOPEE ↗
 *
 * TRUE GATE behavior is preserved: fixed overlay above the app shell, app
 * root inert, scroll locked, until a choice is made. Persistence and the
 * Shopee URL source of truth are unchanged. No new CMS, no duplicate
 * carousel.
 */

/**
 * In-memory entry state.
 *
 * The gateway is evaluated on EVERY full load of the root route (refresh →
 * module reloads → flag resets → gateway appears again), but survives SPA
 * navigation within the same page session, so moving between internal
 * routes never re-triggers the gateway. No localStorage/sessionStorage —
 * deliberately no persistence.
 */
let entryGatewayShown = false;

function markEntryGatewayShown() {
  entryGatewayShown = true;
}

function shouldShowEntryGateway(): boolean {
  return !entryGatewayShown;
}

interface HomeEntryGateProps {
  children: React.ReactNode;
}

/**
 * Mounted ONLY on the `/` route. Direct visits to /shop, /mission, /impact,
 * /donate never pass through here.
 */
export function HomeEntryGate({ children }: HomeEntryGateProps) {
  const [showGateway, setShowGateway] = useState(() =>
    shouldShowEntryGateway(),
  );
  const [shopeeMissing, setShopeeMissing] = useState(false);

  useEffect(() => {
    if (!showGateway) return undefined;

    const rootElement = document.getElementById("root");
    if (rootElement) {
      try {
        (rootElement as HTMLElement & { inert?: boolean }).inert = true;
      } catch {
        rootElement.setAttribute("inert", "");
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      if (rootElement) {
        try {
          (rootElement as HTMLElement & { inert?: boolean }).inert = false;
        } catch {
          rootElement.removeAttribute("inert");
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
    markEntryGatewayShown();
    setShowGateway(false);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  const handleShopOnShopee = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!shopeeUrl) {
      event.preventDefault();
      setShopeeMissing(true);
      return;
    }
    markEntryGatewayShown();
  };

  if (typeof document === "undefined") return null;
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

function EntryGateway({
  onEnterOnemission,
  onShopOnShopee,
  shopeeUrl,
  shopeeMissing,
}: EntryGatewayProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 640,
  );
  const [heroCmsItems, setHeroCmsItems] = useState<WebsiteHeroItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const heroSceneRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Same approved hero media source as Shop (Website CMS hero items).
  useEffect(() => {
    let isActive = true;
    websiteService
      .getHeroItems()
      .then((items) => {
        if (!isActive) return;
        setHeroCmsItems(
          (Array.isArray(items) ? items : [])
            .filter((item) => item.active !== false)
            .sort(
              (left, right) =>
                Number(left.displayOrder || 0) -
                Number(right.displayOrder || 0),
            ),
        );
        setActiveIndex(0);
      })
      .catch(() => {
        // No media → the shared hero renders its brand-safe skeleton state.
        if (isActive) setHeroCmsItems([]);
      });
    return () => {
      isActive = false;
    };
  }, []);

  const heroItems = useMemo(() => mapHeroItems(heroCmsItems), [heroCmsItems]);
  const heroGradients = useMemo(() => {
    if (heroItems.length === 0) {
      return [HERO_GRADIENTS[0]];
    }
    return heroItems.map((item) => createHeroGradient(item.theme.accentColor));
  }, [heroItems]);

  const resolvedActiveIndex =
    heroItems.length > 0 ? activeIndex % heroItems.length : 0;

  const rotateHero = useCallback(
    (direction: Direction) => {
      if (isAnimating || heroItems.length <= 1) return;

      setIsAnimating(true);
      const nextIndex =
        direction === "next"
          ? (resolvedActiveIndex + 1) % heroItems.length
          : (resolvedActiveIndex + heroItems.length - 1) % heroItems.length;
      setActiveIndex(nextIndex);
      window.setTimeout(() => setIsAnimating(false), 650);
    },
    [heroItems.length, isAnimating, resolvedActiveIndex],
  );

  const heroGesture = useHeroGesture({
    surfaceRef: heroSceneRef,
    rotateHero,
  });

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden font-['SF-Pro-Display',_sans-serif]"
      style={{ height: "100dvh" }}
      role="dialog"
      aria-modal="true"
      aria-label="One Mission entry"
    >
      {/* ─── THE SHOP HERO, ADAPTED ────────────────────────────────────── */}
      <section
        ref={heroSceneRef}
        tabIndex={0}
        aria-label="Featured editorial hero carousel"
        aria-roledescription="carousel"
        aria-live="off"
        onKeyDown={heroGesture.onKeyDown}
        className="relative h-full w-full overflow-hidden outline-none"
        style={{ height: "100dvh" }}
      >
        <div className="relative h-full w-full" style={{ overflow: "hidden" }}>
          <HeroGradientBackground
            activeIndex={resolvedActiveIndex}
            gradients={heroGradients}
          />

          {/* Same subtle atmosphere overlay as Shop */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 1,
              background:
                "linear-gradient(180deg, rgba(10,10,10,0.12) 0%, rgba(10,10,10,0.04) 44%, rgba(229,228,226,0.08) 100%)",
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 50,
              backgroundImage: `url("${GRAIN_SVG}")`,
              backgroundRepeat: "repeat",
              backgroundSize: "200px 200px",
              opacity: 0.4,
            }}
          />

          {/* "VALUES MATTER" background typography — the exact Shop hero
              treatment (zIndex 2: behind the model, above the gradient). */}
          <div
            className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none"
            style={{
              zIndex: 2,
              top: isMobile ? "10%" : "18%",
              fontFamily: "'SF-Pro-Display', sans-serif",
              fontSize: isMobile
                ? "clamp(120px, 36vw, 170px)"
                : "clamp(70px, 19vw, 380px)",
              fontWeight: 400,
              color: "#ffffff",
              opacity: 0.6,
              lineHeight: isMobile ? 0.68 : 1,
              textTransform: "lowercase",
              letterSpacing: "-0.08em",
              whiteSpace: "nowrap",
              padding: "0 10px",
            }}
          >
            {isMobile ? (
              <>
                values
                <br />
                matter
              </>
            ) : (
              "VALUES MATTER"
            )}
          </div>

          <HeroCarouselImages
            items={heroItems}
            activeIndex={resolvedActiveIndex}
            isMobile={isMobile}
            onPointerDown={heroGesture.onPointerDown}
            onPointerMove={heroGesture.onPointerMove}
            onPointerUp={heroGesture.onPointerUp}
            onPointerCancel={heroGesture.onPointerCancel}
          />

          {/* Shop-style desktop navigation arrows */}
          {heroItems.length > 1 && (
            <div
              className="hidden sm:block absolute sm:bottom-1/3 sm:left-0 w-screen"
              style={{ zIndex: 60 }}
            >
              <div className="flex justify-between px-10 items-center">
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={() => rotateHero("prev")}
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: "transparent",
                    color: "#ffffff",
                    transition:
                      "transform 150ms ease, background-color 150ms ease",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.transform = "scale(1.08)";
                    event.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.12)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.transform = "scale(1)";
                    event.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <ArrowLeft size={26} strokeWidth={2.25} />
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  onClick={() => rotateHero("next")}
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: "transparent",
                    color: "#ffffff",
                    transition:
                      "transform 150ms ease, background-color 150ms ease",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.transform = "scale(1.08)";
                    event.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.12)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.transform = "scale(1)";
                    event.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <ArrowRight size={26} strokeWidth={2.25} />
                </button>
              </div>
            </div>
          )}

          {/* ─── BRAND MARK (navbar is hidden while the gate is open) ──── */}
          <div
            className="absolute top-6 left-4 sm:left-8"
            style={{ zIndex: 60 }}
          >
            <img
              src="/white_om_logo.png"
              alt="One Mission"
              className="h-8 md:h-14 w-auto [mix-blend-mode:difference]"
            />
          </div>

          {/* ─── BOTTOM ACTIONS (small editorial navigation) ───────────── */}
          <div
            className="absolute inset-x-0 bottom-16 z-[70] flex items-end justify-between gap-4 px-5 pb-6 sm:px-10 sm:pb-8 lg:px-14 lg:pb-10"
            style={{
              paddingBottom:
                "max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))",
            }}
          >
            <button
              type="button"
              onClick={onEnterOnemission}
              aria-label="Enter Onemission — open the complete One Mission website"
              className="group inline-flex items-center gap-2 text-left text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] sm:text-xs">
                Enter Oneworld
              </span>
              <ArrowRight
                size={13}
                strokeWidth={2}
                className="shrink-0 text-white/80 transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>

            <div className="flex flex-col items-end gap-2">
              <a
                href={shopeeUrl || undefined}
                onClick={onShopOnShopee}
                target={shopeeUrl ? "_blank" : undefined}
                rel={shopeeUrl ? "noreferrer" : undefined}
                aria-label="Shop in Shopee — open the official One Mission Shopee store"
                className="group inline-flex items-center gap-2 text-right text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] sm:text-xs">
                  Shop in Shopee
                </span>
                <ArrowUpRight
                  size={13}
                  strokeWidth={2}
                  className="shrink-0 text-white/80 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
              {shopeeMissing && (
                <p
                  className="max-w-[220px] text-right text-[10px] font-medium text-amber-300"
                  role="alert"
                >
                  Shopee destination is not configured. Set
                  VITE_SHOPEE_STORE_URL.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
