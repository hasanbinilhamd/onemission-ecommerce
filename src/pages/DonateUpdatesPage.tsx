import { Link, useParams } from 'react-router-dom';
import { HomepageFooter } from '../features/footer';
import { TopBackNavigation } from '../features/navigation';
import { ROUTES } from '../app/config/routes';
import { Button } from '../components/shared';
import { useDonateCms } from '../features/donate/donateCms';

export function DonateUpdatesPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { campaign, isFallback } = useDonateCms();

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

  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif] text-neutral-900">
      <TopBackNavigation label="Back" fallbackTo={ROUTES.DONATE} />

      <main className="mx-auto max-w-3xl px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
          {campaign.title}
        </p>
        <h1 className="mt-3 text-3xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
          Kabar Terbaru
        </h1>

        <div className="mt-12 space-y-12">
          {campaign.updates.length === 0 ? (
            <p className="text-sm text-neutral-500">Belum ada kabar terbaru untuk campaign ini.</p>
          ) : (
            campaign.updates.map((update) => (
              <div key={update.id} className="border-b border-neutral-200 pb-12 last:border-0 last:pb-0">
                <p className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">
                  {update.date}
                </p>
                <h3 className="mt-3 text-lg font-bold leading-snug sm:text-xl text-neutral-900">
                  {update.title}
                </h3>
                {update.image && (
                  <div className="mt-6 overflow-hidden rounded-2xl bg-neutral-100">
                    <img src={update.image} alt={update.imageAlt} className="w-full aspect-[4/3] sm:aspect-[16/9] object-cover" />
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
