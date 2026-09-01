import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HomepageFooter } from '../features/footer';
import { TopBackNavigation } from '../features/navigation';
import { ROUTES } from '../app/config/routes';
import { Button } from '../components/shared';
import { formatRupiah } from './DonatePage';
import { useDonateCms } from '../features/donate/donateCms';
import {
  donationService,
  type DonationListItem,
} from '../services/api/donationService';

type SortOrder = 'TERBARU' | 'TERBESAR';

const PAGE_SIZE = 10;

export function DonateDonorsPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { campaign, isFallback } = useDonateCms();
  const [sortOrder, setSortOrder] = useState<SortOrder>('TERBARU');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [cmsDonations, setCmsDonations] = useState<DonationListItem[]>([]);
  const [cmsTotal, setCmsTotal] = useState(0);

  // Server-side donations list (successful donations only) — LATEST/LARGEST.
  useEffect(() => {
    if (isFallback) return undefined;
    let isActive = true;
    donationService
      .getDonations(sortOrder === 'TERBARU' ? 'LATEST' : 'LARGEST', 0, visibleCount)
      .then((result) => {
        if (!isActive) return;
        setCmsDonations(result.items);
        setCmsTotal(result.total);
      })
      .catch(() => {
        // Keep the previously loaded list on errors.
      });
    return () => {
      isActive = false;
    };
  }, [isFallback, sortOrder, visibleCount]);

  const sortedDonors = useMemo(() => {
    const arr = [...campaign.donorsList];
    if (sortOrder === 'TERBARU') {
      arr.sort((a, b) => b.dateTimestamp - a.dateTimestamp);
    } else {
      arr.sort((a, b) => b.amount - a.amount);
    }
    return arr;
  }, [campaign.donorsList, sortOrder]);

  if (isFallback && campaignId !== campaign.id) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center font-['SF-Pro-Display',_sans-serif]">
        <TopBackNavigation label="Back to Donate" fallbackTo={ROUTES.DONATE} />
        <h1 className="text-3xl font-bold uppercase tracking-tight text-neutral-900">
          Campaign not found
        </h1>
        <p className="mb-8 mt-2 max-w-sm text-sm text-neutral-500">
          This campaign does not exist or has ended.
        </p>
        <Link to={ROUTES.DONATE}>
          <Button>Back to Donate</Button>
        </Link>
      </div>
    );
  }

  const visibleDonors = isFallback ? sortedDonors.slice(0, visibleCount) : [];
  const hasMore = isFallback
    ? visibleCount < sortedDonors.length
    : cmsDonations.length < cmsTotal;

  const handleLoadMore = () => {
    setVisibleCount((current) => current + PAGE_SIZE);
  };

  const donorsShown = isFallback ? visibleDonors : cmsDonations;

  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif] text-neutral-900">
      <TopBackNavigation label="Back" fallbackTo={ROUTES.DONATE} />

      <main className="mx-auto max-w-3xl px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <h1 className="mt-3 text-3xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
          Donasi
        </h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
          {campaign.donors.toLocaleString('id-ID')} Donors
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
          {donorsShown.length === 0 ? (
            <p className="text-sm text-neutral-500">Belum ada donasi.</p>
          ) : (
            donorsShown.map((donor) => (
              <div key={donor.id} className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-base font-bold text-neutral-900">
                    {(donor as { name?: string }).name ?? (donor as DonationListItem).donorName}
                  </p>
                  <p className="text-neutral-500 text-xs mt-1">
                    {isFallback
                      ? (donor as { timeAgo?: string }).timeAgo
                      : new Date((donor as DonationListItem).createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <p className="text-base font-bold text-neutral-900 shrink-0">
                  {formatRupiah(donor.amount)}
                </p>
              </div>
            ))
          )}
        </div>

        {hasMore && (
          <div className="mt-12 text-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleLoadMore}
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
