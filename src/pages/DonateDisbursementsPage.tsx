import { Link, useParams } from 'react-router-dom';
import { HomepageFooter } from '../features/footer';
import { TopBackNavigation } from '../features/navigation';
import { ROUTES } from '../app/config/routes';
import { ACTIVE_CAMPAIGN } from '../features/donate';
import { Button } from '../components/shared';
import { formatRupiah } from './DonatePage';

export function DonateDisbursementsPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
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

  const totalDisbursed = campaign.disbursements.reduce((acc, curr) => acc + curr.amount, 0);
  const remaining = campaign.raised - totalDisbursed;

  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif] text-neutral-900">
      <TopBackNavigation label="Back" fallbackTo={ROUTES.DONATE} />

      <main className="mx-auto max-w-3xl px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
          {campaign.title}
        </p>
        <h1 className="mt-3 text-3xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
          Pencairan Dana
        </h1>

        <div className="mt-10 grid grid-cols-1 divide-y divide-neutral-200 border-y border-neutral-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="py-6 sm:px-6 sm:py-8 sm:first:pl-0 sm:last:pr-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
              TOTAL TERKUMPUL
            </p>
            <p className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">{formatRupiah(campaign.raised)}</p>
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

        <div className="mt-12 space-y-12">
          {campaign.disbursements.length === 0 ? (
            <p className="text-sm text-neutral-500">Belum ada pencairan dana untuk campaign ini.</p>
          ) : (
            campaign.disbursements.map((disbursement) => (
              <div key={disbursement.id} className="border-b border-neutral-200 pb-12 last:border-0 last:pb-0">
                <p className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">
                  {disbursement.date}
                </p>
                <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
                  <h3 className="text-lg font-bold uppercase leading-snug sm:text-xl text-neutral-900">
                    {disbursement.title}
                  </h3>
                  <p className="text-xl font-bold text-neutral-900">{formatRupiah(disbursement.amount)}</p>
                </div>
                <div className="mt-2 text-sm text-neutral-500">
                  Disalurkan melalui: <span className="font-bold text-neutral-900">{disbursement.partnerName}</span>
                </div>
                {disbursement.image && (
                  <div className="mt-6 overflow-hidden rounded-2xl bg-neutral-100">
                    <img src={disbursement.image} alt={disbursement.imageAlt} className="w-full aspect-[4/3] sm:aspect-[16/9] object-cover" />
                  </div>
                )}
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
