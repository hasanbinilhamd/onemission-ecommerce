import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ChevronRight,
  Globe2,
  Instagram,
  Music2,
  ShoppingBag,
  Shirt,
  Youtube,
} from "lucide-react";
import { env } from "../../app/config/env";

/**
 * Entry Gateway — ONEMISSION's lightweight link hub.
 *
 * The gateway appears on every full load of the root route and acts as the
 * first choice screen before entering the complete ONEMISSION experience.
 *
 * Destinations:
 *   - Shop on Shopee (external)
 *   - Official Website (dismisses the gate and reveals the site)
 *   - Awrah Fit (direct product deep-link)
 *
 * No localStorage/sessionStorage persistence is used by design.
 */

let entryGatewayShown = false;

const AWRAH_FIT_PATH = "/product/awrah-fit-ultra-stretch";
const ENTRY_GATEWAY_IMAGE_URL =
  "https://assets.onemissionclo.com/Collection/awrah%20fit.png";
const COMMUNITY_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/onemissionclo/",
    icon: Instagram,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@hasanbinilhamd",
    icon: Music2,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@onemissionworld",
    icon: Youtube,
  },
] as const;

function markEntryGatewayShown() {
  entryGatewayShown = true;
}

function shouldShowEntryGateway(): boolean {
  return !entryGatewayShown;
}

interface HomeEntryGateProps {
  children: ReactNode;
}

/**
 * Mounted ONLY on the `/` route. Direct visits to /shop, /mission, /impact,
 * /donate and product pages never pass through here.
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

  const handleShopOnShopee = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!shopeeUrl) {
      event.preventDefault();
      setShopeeMissing(true);
      return;
    }

    markEntryGatewayShown();
  };

  const handleOpenAwrahFit = () => {
    markEntryGatewayShown();
    window.location.assign(AWRAH_FIT_PATH);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <EntryGateway
      onEnterOnemission={handleEnterOnemission}
      onShopOnShopee={handleShopOnShopee}
      onOpenAwrahFit={handleOpenAwrahFit}
      shopeeUrl={shopeeUrl}
      shopeeMissing={shopeeMissing}
    />,
    document.body,
  );
}

interface EntryGatewayProps {
  onEnterOnemission: () => void;
  onShopOnShopee: (event: MouseEvent<HTMLAnchorElement>) => void;
  onOpenAwrahFit: () => void;
  shopeeUrl: string;
  shopeeMissing: boolean;
}

function EntryGateway({
  onEnterOnemission,
  onShopOnShopee,
  onOpenAwrahFit,
  shopeeUrl,
  shopeeMissing,
}: EntryGatewayProps) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 640,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);


  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto font-['SF-Pro-Display',_sans-serif] text-white"
      role="dialog"
      aria-modal="true"
      aria-label="One Mission entry"
      style={{
        background:
          "radial-gradient(circle at 8% 58%, rgba(38,89,126,0.42), transparent 32%), radial-gradient(circle at 86% 8%, rgba(22,58,84,0.30), transparent 28%), linear-gradient(180deg, #081521 0%, #07131f 42%, #06111b 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{
          opacity: 0.18,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.75), transparent 82%)",
        }}
      />

      <main className="relative mx-auto flex min-h-full w-full max-w-[920px] flex-col items-center px-5 pb-10 pt-9 sm:px-8 sm:pb-12 sm:pt-12">
        <header className="flex w-full flex-col items-center text-center">
          <img
            src="/white_om_logo.png"
            alt="ONEMISSION"
            className="h-auto w-[min(78vw,360px)] object-contain"
          />
          <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.54em] text-white/62 sm:text-[11px]">
            Values Matter
          </p>
        </header>

        <section className="mt-10 flex w-full flex-col items-center text-center sm:mt-12">
          <h1
            className="m-0 max-w-[820px] text-[clamp(44px,9vw,82px)] font-medium leading-[0.9] tracking-[-0.055em]"
            aria-label="More Than Just Sportswear"
          >
            <span className="block text-white/62">More Than</span>
            <span className="block text-white">Just Sportswear</span>
          </h1>
          <p className="mt-5 max-w-[560px] text-[14px] leading-6 text-[#aebdca] sm:text-[18px] sm:leading-7">
            Modest performance wear for Muslim men
            <br className="hidden sm:block" /> who move with purpose.
          </p>
        </section>

        <section
          className="relative mt-9 w-full overflow-hidden rounded-[26px] border border-white/12 bg-[#0b1a27] shadow-[0_28px_70px_rgba(0,0,0,0.34)] sm:mt-10 sm:rounded-[30px]"
          style={{ aspectRatio: isMobile ? "1.48 / 1" : "2.12 / 1" }}
          aria-label="ONEMISSION editorial campaign"
        >
          <img
            src={ENTRY_GATEWAY_IMAGE_URL}
            alt="ONEMISSION Awrah Fit sportswear campaign"
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              objectPosition: isMobile ? "50% 34%" : "50% 32%",
              filter: "brightness(1.16) contrast(1.06)",
            }}
          />

          {/* Soft spotlight over the artwork lifts the black product from the dark backdrop. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 34% 72% at 51% 49%, rgba(166,204,228,0.34) 0%, rgba(112,161,199,0.22) 38%, rgba(64,111,150,0.08) 67%, transparent 100%)",
              mixBlendMode: "screen",
            }}
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(3,11,18,0.72) 0%, rgba(3,11,18,0.09) 35%, rgba(3,11,18,0.04) 63%, rgba(3,11,18,0.58) 100%), linear-gradient(180deg, rgba(4,12,19,0.03) 38%, rgba(4,12,19,0.23) 100%)",
            }}
          />

          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-left sm:left-8">
            {["FAITH", "DISCIPLINE", "MOVEMENT", "A HIGHER", "PURPOSE"].map(
              (line) => (
                <p
                  key={line}
                  className="m-0 text-[7px] font-medium uppercase tracking-[0.42em] text-white/46 sm:text-[9px]"
                  style={{ lineHeight: 2.35 }}
                >
                  {line}
                </p>
              ),
            )}
            <span className="mt-2 block h-px w-8 bg-white/35 sm:w-10" />
          </div>

          <div className="absolute bottom-5 right-5 max-w-[42%] text-right sm:bottom-7 sm:right-8">
            <p className="m-0 text-[20px] italic leading-none tracking-[-0.03em] text-white/55 sm:text-[32px]">
              Values
              <br />
              Matter
            </p>
          </div>
        </section>

        <section className="mt-9 grid w-full gap-3 sm:mt-10 sm:gap-4">
          <a
            href={shopeeUrl || undefined}
            onClick={onShopOnShopee}
            target={shopeeUrl ? "_blank" : undefined}
            rel={shopeeUrl ? "noreferrer" : undefined}
            className="group flex min-h-[86px] w-full items-center gap-5 rounded-[24px] border px-5 py-4 text-left text-white no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(26,94,141,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78c9ff]/70 sm:min-h-[98px] sm:px-7"
            style={{
              borderColor: "rgba(100,196,255,0.58)",
              background:
                "linear-gradient(100deg, rgba(31,92,130,0.86) 0%, rgba(21,57,82,0.82) 54%, rgba(13,35,51,0.92) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.08), 0 14px 36px rgba(0,0,0,0.16)",
            }}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center border-r border-white/20 pr-5 sm:h-14 sm:w-16">
              <ShoppingBag size={30} strokeWidth={1.7} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[19px] font-medium tracking-[-0.02em] sm:text-[24px]">
                Shop on Shopee
              </p>
              <p className="m-0 mt-1 text-[12px] text-white/58 sm:text-[14px]">
                Discover our latest collection.
              </p>
            </div>
            <ChevronRight
              size={28}
              strokeWidth={1.8}
              className="shrink-0 text-white/85 transition-transform duration-200 group-hover:translate-x-1"
            />
          </a>

          <button
            type="button"
            onClick={onEnterOnemission}
            className="group flex min-h-[86px] w-full items-center gap-5 rounded-[24px] border border-white/16 px-5 py-4 text-left text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/28 hover:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 sm:min-h-[98px] sm:px-7"
            style={{
              background:
                "linear-gradient(100deg, rgba(23,45,62,0.80) 0%, rgba(14,30,43,0.88) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.05), 0 12px 30px rgba(0,0,0,0.12)",
            }}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center border-r border-white/16 pr-5 sm:h-14 sm:w-16">
              <Globe2 size={30} strokeWidth={1.7} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[19px] font-medium tracking-[-0.02em] sm:text-[24px]">
                Official Website
              </p>
              <p className="m-0 mt-1 text-[12px] text-white/58 sm:text-[14px]">
                Explore the full ONEMISSION experience.
              </p>
            </div>
            <ChevronRight
              size={28}
              strokeWidth={1.8}
              className="shrink-0 text-white/85 transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>

          <button
            type="button"
            onClick={onOpenAwrahFit}
            className="group flex min-h-[86px] w-full items-center gap-5 rounded-[24px] border border-white/16 px-5 py-4 text-left text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/28 hover:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 sm:min-h-[98px] sm:px-7"
            style={{
              background:
                "linear-gradient(100deg, rgba(23,45,62,0.80) 0%, rgba(14,30,43,0.88) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.05), 0 12px 30px rgba(0,0,0,0.12)",
            }}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center border-r border-white/16 pr-5 sm:h-14 sm:w-16">
              <Shirt size={30} strokeWidth={1.7} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[19px] font-medium tracking-[-0.02em] sm:text-[24px]">
                Awrah Fit
              </p>
              <p className="m-0 mt-1 text-[12px] text-white/58 sm:text-[14px]">
                Modest fit. Higher purpose.
              </p>
            </div>
            <ChevronRight
              size={28}
              strokeWidth={1.8}
              className="shrink-0 text-white/85 transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>

          {shopeeMissing ? (
            <p
              className="m-0 px-2 text-center text-[11px] font-medium text-amber-300"
              role="alert"
            >
              Shopee destination is not configured. Set VITE_SHOPEE_STORE_URL.
            </p>
          ) : null}
        </section>

        <footer className="mt-10 w-full border-t border-white/14 pt-6 text-center sm:mt-12 sm:pt-7">
          <div className="flex items-center justify-center gap-7">
            {COMMUNITY_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                title={label}
                className="text-white/82 transition-all duration-200 hover:-translate-y-0.5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <Icon size={21} strokeWidth={1.9} />
              </a>
            ))}
          </div>
          <p className="mb-0 mt-5 text-[9px] font-medium uppercase tracking-[0.54em] text-white/58 sm:text-[10px]">
            Values Matter
          </p>
          <p className="mb-0 mt-5 text-[8px] uppercase tracking-[0.26em] text-white/35 sm:text-[9px]">
            © 2026 ONEMISSION. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
