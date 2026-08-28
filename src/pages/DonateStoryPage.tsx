import { Link, useParams } from 'react-router-dom';
import { HomepageFooter } from '../features/footer';
import { TopBackNavigation } from '../features/navigation';
import { ROUTES } from '../app/config/routes';
import { ACTIVE_CAMPAIGN } from '../features/donate';
import { Button } from '../components/shared';

export function DonateStoryPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  // For MVP, we only have one active campaign.
  // We should match it by ID ideally, but we'll use ACTIVE_CAMPAIGN directly.
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

  const { story } = campaign;

  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif] text-neutral-900">
      <TopBackNavigation label="Back" fallbackTo={ROUTES.DONATE} />

      <article className="mx-auto max-w-3xl px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
          {campaign.title}
        </p>
        <h1 className="mt-3 text-3xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
          {story.title}
        </h1>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <img
            src={story.image}
            alt={story.imageAlt}
            className="aspect-[4/3] sm:aspect-[16/9] w-full object-cover"
          />
        </div>

        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-neutral-700">
          {story.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
            Our Partner
          </p>
          <p className="mt-1.5 text-lg font-bold uppercase tracking-tight">
            {campaign.partner.name}
          </p>
          <p className="mt-0.5 text-sm font-medium text-neutral-500">
            {campaign.partner.tagline}
          </p>
        </div>
      </article>

      <div className="mt-16 bg-white pb-[100px] sm:mt-20 lg:pb-0">
        <HomepageFooter />
      </div>
    </div>
  );
}
