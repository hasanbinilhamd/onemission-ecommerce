import { HomepageFooter } from '../features/footer';
import { TopBackNavigation } from '../features/navigation';
import { ROUTES } from '../app/config/routes';
import { SkeletonBlock, CmsStatePanel } from '../components/shared';
import { useDonateCms } from '../features/donate/donateCms';

/**
 * DonateUpdatesPage — latest campaign updates, from the CMS only.
 */
export function DonateUpdatesPage() {
  const { status, payload, reload } = useDonateCms();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif]">
        <div className="mx-auto max-w-3xl px-4 pt-28 sm:px-6 sm:pt-32">
          <SkeletonBlock className="h-3 w-40" />
          <SkeletonBlock className="mt-4 h-10 w-1/2" />
          <SkeletonBlock className="mt-10 h-4 w-full" />
          <SkeletonBlock className="mt-3 h-4 w-full" />
          <SkeletonBlock className="mt-3 h-4 w-2/3" />
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
            title="Unable to load updates."
            description="Please check your connection and try again."
            actionLabel="Try Again"
            onAction={reload}
          />
        </div>
      </div>
    );
  }

  const campaign = payload?.campaign ?? null;
  const updates = payload?.updates ?? [];

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
          Kabar Terbaru
        </h1>

        <div className="mt-12 space-y-12">
          {updates.length === 0 ? (
            <p className="text-sm text-neutral-500">Belum ada kabar terbaru untuk campaign ini.</p>
          ) : (
            updates.map((update) => (
              <div key={update.id} className="border-b border-neutral-200 pb-12 last:border-0 last:pb-0">
                <p className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">
                  {new Date(update.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                </p>
                {update.title && (
                  <h3 className="mt-3 text-lg font-bold leading-snug sm:text-xl text-neutral-900">
                    {update.title}
                  </h3>
                )}
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
