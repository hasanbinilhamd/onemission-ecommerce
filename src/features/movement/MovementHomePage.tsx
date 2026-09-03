import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../app/config/routes";
import { HomepageFooter } from "../footer";
import { ArrowRight } from "lucide-react";
import { SkeletonBlock, CmsStatePanel } from "../../components/shared";
import {
  websiteService,
  type MovementHomeContent,
} from "../../services/api/websiteService";

/**
 * MovementHomePage — approved Home design, CMS-driven content ONLY.
 *
 * The HQ Home CMS is the single source of truth:
 *   loading → skeleton matching the Home layout
 *   success  → real CMS content
 *   empty    → honest empty state (no dummy copy)
 *   error    → honest error state with retry
 *
 * No static fallback content is ever rendered. DESIGN + LAYOUT + INTERACTION
 * stay in this component — the CMS only supplies content.
 */

type HomeState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; content: MovementHomeContent };

/** Splits the CMS headline into the existing multi-line treatment. */
function splitHeadlineLines(headline: string): string[] {
  const parts = String(headline || "")
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length <= 1) return parts.length === 1 ? [parts[0]] : [];
  return parts.map((part) => `${part}.`);
}

function useIsMobileViewport(): boolean {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 639px)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isMobile;
}

const HOME_DESTINATION_ROUTES: Record<string, string> = {
  mission: ROUTES.MISSION,
  impact: ROUTES.IMPACT,
  shop: ROUTES.SHOP,
  donate: ROUTES.DONATE,
};

function resolveHomeDestination(destination: string | undefined): string {
  return (
    HOME_DESTINATION_ROUTES[String(destination || "mission")] || ROUTES.MISSION
  );
}

function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] font-['SF-Pro-Display',_sans-serif]">
      <div className="flex min-h-[85vh] w-full items-end sm:min-h-screen">
        <div className="w-full px-6 pb-24 sm:px-12 lg:px-24">
          <SkeletonBlock className="h-10 w-4/5 max-w-xl sm:h-16" />
          <SkeletonBlock className="mt-3 h-10 w-3/5 max-w-md sm:h-16" />
          <SkeletonBlock className="mt-6 h-4 w-full max-w-md" />
          <SkeletonBlock className="mt-2 h-4 w-2/3 max-w-sm" />
          <SkeletonBlock className="mt-8 h-12 w-52 rounded-full" />
        </div>
      </div>
      <div className="bg-white px-4 py-12 sm:px-12 sm:py-24 lg:px-24">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="mt-3 h-9 w-64" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <SkeletonBlock
              key={index}
              className="aspect-[2/1] w-full rounded-2xl sm:aspect-[4/5]"
            />
          ))}
        </div>
      </div>
      <div className="bg-white">
        <HomepageFooter />
      </div>
    </div>
  );
}

export function MovementHomePage() {
  const [state, setState] = useState<HomeState>({ status: "loading" });
  const isMobile = useIsMobileViewport();

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const content = await websiteService.getMovementHome();
      setState({ status: "success", content });
    } catch {
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (state.status === "loading") {
    return <HomeSkeleton />;
  }

  if (state.status === "error") {
    return (
      <div className="min-h-screen bg-white">
        <div className="pt-16">
          <CmsStatePanel
            eyebrow="One Mission"
            title="Unable to load the homepage."
            description="Please check your connection and try again."
            actionLabel="Try Again"
            onAction={() => void load()}
          />
        </div>
        <div className="bg-white">
          <HomepageFooter />
        </div>
      </div>
    );
  }

  const { home, cards } = state.content;

  if (!home) {
    return (
      <div className="min-h-screen bg-white">
        <div className="pt-16">
          <CmsStatePanel
            eyebrow="One Mission"
            title="The homepage is being prepared."
            description="Content will appear here once it is published."
          />
        </div>
        <div className="bg-white">
          <HomepageFooter />
        </div>
      </div>
    );
  }

  const heroImage = isMobile
    ? home.mobileImage || home.desktopImage
    : home.desktopImage || home.mobileImage;
  const headlineLines = splitHeadlineLines(home.headline);

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white flex flex-col font-['SF-Pro-Display',_sans-serif]">
      <main className="flex-grow flex flex-col">
        {/* HERO SECTION */}
        <section className="relative w-full min-h-[85vh] sm:min-h-screen flex flex-col justify-end pb-24 sm:pb-32 px-6 sm:px-12 lg:px-24">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/60 via-neutral-900/80 to-[#0A0A0A] z-10" />
            {heroImage ? (
              <img
                src={heroImage}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#1A1A1A] object-cover" />
            )}
          </div>

          <div className="relative z-20 max-w-4xl">
            {headlineLines.length > 0 && (
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight uppercase leading-[0.95] mb-6">
                {headlineLines.map((line, index) => (
                  <span
                    key={index}
                    className={`block ${index % 2 === 1 ? "text-neutral-400" : ""}`}
                  >
                    {line}
                  </span>
                ))}
              </h1>
            )}

            {home.description && (
              <p className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-md mb-10 leading-relaxed">
                {home.description}
              </p>
            )}

            {home.ctaLabel && (
              <Link
                to={resolveHomeDestination(home.ctaDestination)}
                className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-semibold text-sm tracking-wide uppercase transition-transform hover:scale-105"
              >
                {home.ctaLabel}
                <ArrowRight size={18} strokeWidth={2.5} />
              </Link>
            )}
          </div>
        </section>

        {/* JOIN THE MISSION CARDS */}
        {cards.length > 0 && (
          <section className="px-4 sm:px-12 lg:px-24 py-12 sm:py-24 bg-white relative z-20 text-neutral-900">
            <div className="mb-8 sm:mb-12">
              <h2 className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-neutral-500 uppercase mb-2 sm:mb-3">
                One Mission
              </h2>
              <p className="text-2xl sm:text-4xl font-bold uppercase tracking-tight">
                Join The Mission
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {cards.map((card, index) => {
                const displayOrder = Number(card.displayOrder) || index + 1;
                const cardNumber = String(displayOrder).padStart(2, "0");
                return (
                  <Link
                    key={card.id ?? index}
                    to={resolveHomeDestination(card.destination)}
                    className="group relative block aspect-[2/1] sm:aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100"
                  >
                    {card.image && (
                      <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url(${card.image})` }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 z-10" />
                    <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-4 text-[120px] sm:text-[220px] leading-none font-bold text-white opacity-[0.12] select-none z-10 pointer-events-none tracking-tighter">
                      {cardNumber}
                    </div>
                    <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end sm:justify-between z-20 text-white">
                      <div className="flex justify-between items-end gap-4">
                        <div>
                          {card.title && (
                            <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-tight mb-1 sm:mb-2 leading-tight">
                              {card.title}
                            </h3>
                          )}
                          {card.description && (
                            <p className="text-xs sm:text-sm text-white/80 leading-snug">
                              {card.description}
                            </p>
                          )}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 transition-all group-hover:bg-white group-hover:text-black">
                          <ArrowRight size={18} strokeWidth={2} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Adjust footer padding on mobile so it doesn't get hidden behind bottom nav */}
      <div className="bg-white">
        <HomepageFooter />
      </div>
    </div>
  );
}
