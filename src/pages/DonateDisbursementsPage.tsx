import { HomepageFooter } from '../features/footer';
import { TopBackNavigation } from '../features/navigation';
import { ROUTES } from '../app/config/routes';
import { SkeletonBlock, CmsStatePanel, ComingSoonPage } from '../components/shared';
import { useDonateCms } from '../features/donate/donateCms';
import { formatRupiah } from './DonatePage';

/**
 * DonateDisbursementsPage — fund disbursement information, from the CMS only.
 * Totals are derived from real CMS disbursement records + backend-computed
 * raised amount — never static values.
 */
export function DonateDisbursementsPage() {
  const { status, payload, reload } = useDonateCms();

  // Page-level CMS availability — independent from campaign status.
  if (payload?.pageAvailability === 'COMING_SOON') {
    return (
      <div className="min-h-screen bg-white">
        <TopBackNavigation label="Back" fallbackTo={ROUTES.DONATE} />
        <ComingSoonPage
          eyebrow="Donate"
          title="The Next Cause Is Taking Shape."
          description="We're preparing the next opportunity to give with purpose."
        />
        <div className="bg-white pb-[100px] lg:pb-0">
          <HomepageFooter />
        </div>
      </div>
    );
  }

  const disbursements = payload?.disbursements ?? [];
  const campaign = payload?.campaign ?? null;

  const totalDisbursed = disbursements.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const raised = campaign ? Number(campaign.raised) || 0 : 0;
  const remaining = Math.max(0, raised - totalDisbursed);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif]">
        <div className="mx-auto max-w-3xl px-4 pt-28 sm:px-6 sm:pt-32">
          <SkeletonBlock className="h-3 w-40" />
          <SkeletonBlock className="mt-4 h-10 w-1/2" />
          <SkeletonBlock className="mt-10 h-24 w-full rounded-2xl" />
          <SkeletonBlock className="mt-4 h-16 w-full rounded-xl" />
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
            title="Unable to load disbursements."
            description="Please check your connection and try again."
            actionLabel="Try Again"
            onAction={reload}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif] text-neutral-900">
      <TopBackNavigation label="Back" fallbackTo={ROUTES.DONATE} />

      <main className="mx-auto max-w-3xl px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        {campaign && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
            {campaign.title}
          </p>
        )}
        <h1 className="mt-3 text-3xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
          Pencairan Dana
        </h1>

        <div className="mt-10 grid grid-cols-1 divide-y divide-neutral-200 border-y border-neutral-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="py-6 sm:px-6 sm:py-8 sm:first:pl-0 sm:last:pr-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
              TOTAL TERKUMPUL
            </p>
            <p className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
              {formatRupiah(campaign?.raised ?? 0)}
            </p>
          </div>
          <div className="py-6 sm:px-6 sm:py-8 sm:first:pl-0 sm:last:pr-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
              TOTAL DISALURKAN
            </p>
            <p className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">{formatRupiah(totalDisbursed)}</p>
          </div>
          <div className="py-6 sm:px-6 sm:py-8 sm:first:pl-0 sm:last:pr-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
              SISA DANA
            </p>
            <p className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">{formatRupiah(remaining)}</p>
          </div>
        </div>

        <div className="mt-12 space-y-8">
          {disbursements.length === 0 ? (
            <p className="text-sm text-neutral-500">Belum ada pencairan dana untuk campaign ini.</p>
          ) : (
            disbursements.map((item) => (
              <div key={item.id} className="border-b border-neutral-200 pb-8 last:border-0 last:pb-0">
                <p className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">
                  {new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                </p>
                <h3 className="mt-2 text-lg font-bold leading-snug text-neutral-900">{item.title}</h3>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <p className="text-sm text-neutral-500">{item.partnerName}</p>
                  <p className="text-base font-bold text-neutral-900">{formatRupiah(item.amount)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <div className="mt-16 bg-white pb-[100px] sm:mt-20 lg:pb-0">
        <HomepageFooter />
      </div>
    </div>
  );
}
