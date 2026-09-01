import { useEffect, useState } from 'react';
import { HomepageFooter } from '../features/footer';
import { TopBackNavigation } from '../features/navigation';
import { ROUTES } from '../app/config/routes';
import { Button, SkeletonBlock, CmsStatePanel } from '../components/shared';
import { formatRupiah } from './DonatePage';
import { useDonateCms } from '../features/donate/donateCms';
import {
  donationService,
  type DonationListItem,
} from '../services/api/donationService';

type SortOrder = 'TERBARU' | 'TERBESAR';

const PAGE_SIZE = 10;

/**
 * DonateDonorsPage — real successful donations only (server-side LATEST /
 * LARGEST), never fabricated donor lists.
 */
export function DonateDonorsPage() {
  const { status, payload, reload } = useDonateCms();
  const [sortOrder, setSortOrder] = useState<SortOrder>('TERBARU');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [donations, setDonations] = useState<DonationListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoadingDonations, setIsLoadingDonations] = useState(false);

  const campaign = payload?.campaign ?? null;

  useEffect(() => {
    if (status !== 'success') return undefined;
    let isActive = true;
    setIsLoadingDonations(true);
    donationService
      .getDonations(sortOrder === 'TERBARU' ? 'LATEST' : 'LARGEST', 0, visibleCount)
      .then((result) => {
        if (!isActive) return;
        setDonations(result.items ?? []);
        setTotal(result.total ?? 0);
      })
      .catch(() => {
        // Keep the previously loaded list on errors.
      })
      .finally(() => {
        if (isActive) setIsLoadingDonations(false);
      });
    return () => {
      isActive = false;
    };
  }, [sortOrder, status, visibleCount]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif]">
        <div className="mx-auto max-w-3xl px-4 pt-28 sm:px-6 sm:pt-32">
          <SkeletonBlock className="h-10 w-1/2" />
          <SkeletonBlock className="mt-6 h-4 w-40" />
          <SkeletonBlock className="mt-8 h-4 w-full" />
          <SkeletonBlock className="mt-4 h-4 w-full" />
          <SkeletonBlock className="mt-4 h-4 w-full" />
        </div>
        <div className="mt-16 bg-white pb-[100px] lg:pb-0">
          <HomepageFooter />
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-white">
        <TopBackNavigation label="Back" fallbackTo={ROUTES.DONATE} />
        <div className="pt-16">
          <CmsStatePanel
            eyebrow="Donate"
            title="Unable to load donations."
            description="Please check your connection and try again."
            actionLabel="Try Again"
            onAction={reload}
          />
        </div>
      </div>
    );
  }

  const hasMore = donations.length < total;

  const handleLoadMore = () => {
    setVisibleCount((current) => current + PAGE_SIZE);
  };

  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif] text-neutral-900">
      <TopBackNavigation label="Back" fallbackTo={ROUTES.DONATE} />

      <main className="mx-auto max-w-3xl px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <h1 className="mt-3 text-3xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
          Donasi
        </h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
          {campaign ? `${campaign.donorCount.toLocaleString('id-ID')} Donors` : 'Donors'}
        </p>

        <div className="mt-8 flex gap-4 border-b border-neutral-200 pb-4">
          <button
            onClick={() => {
              setSortOrder('TERBARU');
              setVisibleCount(PAGE_SIZE);
            }}
            className={[
              'text-xs font-bold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900',
              sortOrder === 'TERBARU' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
            ].join(' ')}
          >
            Terbaru
          </button>
          <button
            onClick={() => {
              setSortOrder('TERBESAR');
              setVisibleCount(PAGE_SIZE);
            }}
            className={[
              'text-xs font-bold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900',
              sortOrder === 'TERBESAR' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
            ].join(' ')}
          >
            Terbesar
          </button>
        </div>

        <div className="mt-8 space-y-6">
          {donations.length === 0 && !isLoadingDonations ? (
            <p className="text-sm text-neutral-500">Belum ada donasi.</p>
          ) : (
            donations.map((donor) => (
              <div key={donor.id} className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-base font-bold text-neutral-900">{donor.donorName}</p>
                  <p className="text-neutral-500 text-xs mt-1">
                    {new Date(donor.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <p className="text-base font-bold text-neutral-900 shrink-0">
                  {formatRupiah(donor.amount)}
                </p>
              </div>
            ))
          )}
          {isLoadingDonations && (
            <div className="space-y-4" aria-hidden="true">
              <SkeletonBlock className="h-6 w-full" />
              <SkeletonBlock className="h-6 w-full" />
              <SkeletonBlock className="h-6 w-2/3" />
            </div>
          )}
        </div>

        {hasMore && (
          <div className="mt-12 text-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoadingDonations}
              className="rounded-full px-10 py-3.5 text-[11px] font-semibold uppercase tracking-[0.24em]"
            >
              Load More
            </Button>
          </div>
        )}
      </main>

      <div className="mt-16 bg-white pb-[100px] sm:mt-20 lg:pb-0">
        <HomepageFooter />
      </div>
    </div>
  );
}
