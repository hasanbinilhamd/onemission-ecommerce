import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HomepageFooter } from '../features/footer';
import { TopBackNavigation } from '../features/navigation';
import { ROUTES } from '../app/config/routes';
import { ACTIVE_CAMPAIGN } from '../features/donate';
import { Button } from '../components/shared';
import { formatRupiah } from './DonatePage';

type SortOrder = 'TERBARU' | 'TERBESAR';

export function DonateDonorsPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [sortOrder, setSortOrder] = useState<SortOrder>('TERBARU');
  const [visibleCount, setVisibleCount] = useState(10);
  const campaign = ACTIVE_CAMPAIGN;

  if (campaignId !== campaign.id) {
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

  const sortedDonors = useMemo(() => {
    const arr = [...campaign.donorsList];
    if (sortOrder === 'TERBARU') {
      arr.sort((a, b) => b.dateTimestamp - a.dateTimestamp);
    } else {
      arr.sort((a, b) => b.amount - a.amount);
    }
    return arr;
  }, [campaign.donorsList, sortOrder]);

  const visibleDonors = sortedDonors.slice(0, visibleCount);
  const hasMore = visibleCount < sortedDonors.length;

  const handleLoadMore = () => {
    setVisibleCount(c => c + 10);
  };

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
            onClick={() => setSortOrder('TERBARU')}
            className={[
              'text-xs font-bold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900',
              sortOrder === 'TERBARU' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
            ].join(' ')}
          >
            Terbaru
          </button>
          <button
            onClick={() => setSortOrder('TERBESAR')}
            className={[
              'text-xs font-bold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900',
              sortOrder === 'TERBESAR' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
            ].join(' ')}
          >
            Terbesar
          </button>
        </div>

        <div className="mt-8 space-y-6">
          {visibleDonors.length === 0 ? (
            <p className="text-sm text-neutral-500">Belum ada donasi.</p>
          ) : (
            visibleDonors.map((donor) => (
              <div key={donor.id} className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-base font-bold text-neutral-900">{donor.name}</p>
                  <p className="text-neutral-500 text-xs mt-1">{donor.timeAgo}</p>
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

      <div className="mt-16 bg-white pb-[72px] sm:mt-20 lg:pb-0">
        <HomepageFooter />
      </div>
    </div>
  );
}
