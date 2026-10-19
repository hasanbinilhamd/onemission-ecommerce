import { useEffect, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../app/config/routes";
import {
  ChevronRight,
  Globe2,
  Instagram,
  Music2,
  ShoppingBag,
  Shirt,
  Crown,
  ThumbsUp,
  Youtube,
} from "lucide-react";
import { env } from "../../app/config/env";

/**
 * Entry Gateway — ONEMISSION's lightweight link hub.
 *
 * The gateway appears on every visit to the root route and acts as the
 * first choice screen before entering the complete ONEMISSION experience.
 *
 * Destinations:
 *   - Shop on Shopee (external)
 *   - Official Website (navigates to /shop)
 *   - Awrah Fit (direct Shopee product link)
 *
 * No localStorage/sessionStorage persistence is used by design.
 */

const AWRAH_FIT_SHOPEE_URL =
  "https://shopee.co.id/product/1115876802/54869422914/";
const ENTRY_GATEWAY_IMAGE_URL = "/awrahfit.png";
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

/** The home route always displays the entry gateway when revisited. */
export function HomeEntryGate() {
  const navigate = useNavigate();
  const [shopeeMissing, setShopeeMissing] = useState(false);

  useEffect(() => {
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
  }, []);

  const shopeeUrl = env.shopeeStoreUrl.trim();

  const handleEnterOnemission = () => {
    navigate(ROUTES.SHOP);
  };

  const handleShopOnShopee = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!shopeeUrl) {
      event.preventDefault();
      setShopeeMissing(true);
      return;
    }

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
  onShopOnShopee: (event: MouseEvent<HTMLAnchorElement>) => void;
  shopeeUrl: string;
  shopeeMissing: boolean;
}

function EntryGateway({
  onEnterOnemission,
  onShopOnShopee,
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
            src="/white_om_full_logo.png"
            alt="ONEMISSION"
            className="h-auto w-[min(78vw,360px)] object-contain"
          />
        </header>

        <section
          className="relative isolate mt-5 w-full"
          style={{ aspectRatio: isMobile ? "1.48 / 1" : "2.12 / 1" }}
          aria-label="ONEMISSION Awrah Fit product"
        >
          {/* Allow the soft white spotlight to fade naturally into the page background. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div
              className="h-[88%] w-[74%] rounded-full"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(248,251,255,0.56) 20%, rgba(218,236,255,0.30) 40%, rgba(132,182,226,0.14) 49%, rgba(82,134,183,0.04) 68%, transparent 80%)",
                filter: "blur(30px)",
                transform: "scale(1.13)",
              }}
            />
          </div>

          <img
            src={ENTRY_GATEWAY_IMAGE_URL}
            alt="ONEMISSION Awrah Fit sportswear"
            className="relative z-10 block h-full w-full object-contain"
            style={{
              filter:
                "brightness(1.12) contrast(1.06) drop-shadow(0 20px 35px rgba(0,0,0,0.20))",
              // Fade any opaque edges of the image so no rectangular box remains.
              maskImage:
                "radial-gradient(ellipse 66% 83% at center, black 53%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 66% 83% at center, black 53%, transparent 100%)",
            }}
          />
        </section>

        <section className="mt-5 grid w-full gap-3 sm:gap-4">
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
                Get free ongkir.
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
                Grab special offers.
              </p>
            </div>
            <ChevronRight
              size={28}
              strokeWidth={1.8}
              className="shrink-0 text-white/85 transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>

          <a
            href={AWRAH_FIT_SHOPEE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-h-[86px] w-full items-center gap-5 rounded-[24px] border border-white/16 px-5 py-4 text-left text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/28 hover:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 sm:min-h-[98px] sm:px-7"
            style={{
              background:
                "linear-gradient(100deg, rgba(23,45,62,0.80) 0%, rgba(14,30,43,0.88) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.05), 0 12px 30px rgba(0,0,0,0.12)",
            }}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center border-r border-white/16 pr-5 sm:h-14 sm:w-16">
              <ThumbsUp size={30} strokeWidth={1.7} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[19px] font-medium tracking-[-0.02em] sm:text-[24px]">
                Awrah Fit
              </p>
              <p className="m-0 mt-1 text-[12px] text-white/58 sm:text-[14px]">
                Most valuable products.
              </p>
            </div>
            <ChevronRight
              size={28}
              strokeWidth={1.8}
              className="shrink-0 text-white/85 transition-transform duration-200 group-hover:translate-x-1"
            />
          </a>

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
