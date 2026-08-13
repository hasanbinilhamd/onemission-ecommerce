import { ArrowRight } from 'lucide-react';
import { env } from '../../app/config/env';

const SHOPEE_ORANGE = '#EE4D2D';

export function ShopeeMarketplaceSection() {
  const shopeeStoreUrl = env.shopeeStoreUrl.trim();
  const hasShopeeStoreUrl = Boolean(shopeeStoreUrl);

  return (
    <section
      aria-label="OneMission on Shopee"
      className="bg-white px-5 py-10 sm:px-8 sm:py-12"
    >
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-neutral-200 bg-neutral-950 text-white shadow-[0_24px_80px_rgba(17,24,39,0.14)]">
        <div className="grid items-center gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-10 lg:py-9">
          <div className="min-w-0 text-center lg:text-left">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
              Marketplace
            </p>
            <h2 className="mt-3 text-[clamp(1.75rem,6vw,3.5rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-white">
              Available also on Shopee
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/65 sm:text-base lg:mx-0">
              Shop OneMission on Shopee and enjoy a familiar and convenient shopping experience.
            </p>

            <div className="mt-6 flex justify-center lg:justify-start">
              {hasShopeeStoreUrl ? (
                <a
                  href={shopeeStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                  aria-label="Shop OneMission on Shopee, opens in a new tab"
                >
                  Shop on Shopee
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-white/20 px-5 py-3 text-sm font-semibold text-white/70"
                  title="Configure VITE_SHOPEE_STORE_URL to enable this link."
                >
                  Shop on Shopee
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[260px] items-center justify-center lg:justify-end">
            <div className="relative w-full rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-4">
              <div className="rounded-[1.25rem] bg-white p-5 text-neutral-950 shadow-[0_20px_48px_rgba(0,0,0,0.22)]">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white"
                    style={{ backgroundColor: SHOPEE_ORANGE }}
                    aria-hidden="true"
                  >
                    S
                  </div>
                  <div className="min-w-0">
                    <p className="m-0 text-sm font-semibold text-neutral-950">Shopee</p>
                    <p className="m-0 text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">Official Store</p>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">OneMission</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">Marketplace access</p>
                </div>
              </div>
              <span
                className="absolute -right-3 -top-3 h-10 w-10 rounded-full"
                style={{ backgroundColor: SHOPEE_ORANGE, opacity: 0.92 }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
