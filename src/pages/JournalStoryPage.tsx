import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/shared';
import { HomepageFooter } from '../features/footer';
import { TopBackNavigation } from '../features/navigation';
import { getJournalStoryById } from '../features/journal';
import { ROUTES } from '../app/config/routes';

/**
 * JournalStoryPage — static story detail.
 *
 * Renders a single Journal story from the static content structure. No CMS,
 * no publishing workflow — this is the read experience only.
 *
 * Follows the established inner-page pattern (TopBackNavigation + footer),
 * the same pattern used by ProductDetailPage and TrackOrderPage.
 */
export function JournalStoryPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const story = getJournalStoryById(slug);

  if (!story) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center font-['SF-Pro-Display',_sans-serif]">
        <TopBackNavigation label="Back to Impact" fallbackTo={ROUTES.JOURNAL} />
        <h1 className="text-3xl font-bold uppercase tracking-tight text-neutral-900">
          Story not found
        </h1>
        <p className="mb-8 mt-2 max-w-sm text-sm text-neutral-500">
          This story does not exist or has been moved.
        </p>
        <Link to={ROUTES.JOURNAL}>
          <Button>Back to Impact</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif] text-neutral-900">
      <TopBackNavigation label="Back to Impact" fallbackTo={ROUTES.JOURNAL} />

      <article className="mx-auto max-w-3xl px-4 pt-24 sm:px-6 sm:pt-28">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
          {story.category} · {story.date} · {story.readMinutes} min read
        </p>
        <h1 className="mt-3 text-3xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
          {story.title}
        </h1>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <img
            src={story.image}
            alt={story.alt}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>

        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-neutral-700">
          {story.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <div className="mt-16 bg-white">
        <HomepageFooter />
      </div>
    </div>
  );
}
