import { HomepageFooter } from '../features/footer';
import { TopBackNavigation } from '../features/navigation';
import { ROUTES } from '../app/config/routes';
import { SkeletonBlock, CmsStatePanel } from '../components/shared';
import { useDonateCms } from '../features/donate/donateCms';

/**
 * DonateStoryPage — the active campaign story, from the CMS only.
 * Loading → skeleton; error → error state; no content → honest empty state.
 */
export function DonateStoryPage() {
  const { status, payload, reload } = useDonateCms();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif]">
        <div className="mx-auto max-w-3xl px-4 pt-28 sm:px-6 sm:pt-32">
          <SkeletonBlock className="h-3 w-40" />
          <SkeletonBlock className="mt-4 h-10 w-3/4 max-w-xl" />
          <SkeletonBlock className="mt-8 aspect-[16/9] w-full rounded-2xl" />
          <SkeletonBlock className="mt-8 h-4 w-full" />
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
            title="Unable to load the story."
            description="Please check your connection and try again."
            actionLabel="Try Again"
            onAction={reload}
          />
        </div>
      </div>
    );
  }

  const campaign = payload?.campaign ?? null;
  const story = payload?.story ?? null;
  const partners = payload?.partners ?? [];

  if (!campaign) {
    return (
      <div className="min-h-screen bg-white">
        <TopBackNavigation label="Back" fallbackTo={ROUTES.DONATE} />
        <div className="pt-16">
          <CmsStatePanel eyebrow="Donate" title="No Active Campaign" />
        </div>
      </div>
    );
  }

  const storyParagraphs = String(story?.content || '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif] text-neutral-900">
      <TopBackNavigation label="Back" fallbackTo={ROUTES.DONATE} />

      <article className="mx-auto max-w-3xl px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
          {campaign.title}
        </p>
        {story?.title && (
          <h1 className="mt-3 text-3xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
            {story.title}
          </h1>
        )}

        {campaign.coverImage && (
          <div className="mt-8 overflow-hidden rounded-2xl">
            <img
              src={campaign.coverImage}
              alt={campaign.title}
              className="aspect-[4/3] sm:aspect-[16/9] w-full object-cover"
            />
          </div>
        )}

        {storyParagraphs.length > 0 ? (
          <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-neutral-700">
            {storyParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm text-neutral-400">The story is still being prepared.</p>
        )}

        {partners.length > 0 && (
          <div className="mt-12 pt-8 border-t border-neutral-200">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
              Our Partners
            </p>
            {partners.map((partner) => (
              <div key={partner.id} className="mt-3">
                <p className="text-lg font-bold uppercase tracking-tight">
                  {partner.name}
                  {partner.tagline ? (
                    <span className="ml-2 text-sm font-medium normal-case tracking-normal text-neutral-500">
                      {partner.tagline}
                    </span>
                  ) : null}
                </p>
              </div>
            ))}
          </div>
        )}
      </article>

      <div className="mt-16 bg-white pb-[100px] sm:mt-20 lg:pb-0">
        <HomepageFooter />
      </div>
    </div>
  );
}
