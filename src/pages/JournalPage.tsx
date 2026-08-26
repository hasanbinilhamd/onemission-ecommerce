import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/shared';
import { HomepageFooter } from '../features/footer';
import {
  JOURNAL_CATEGORIES,
  JOURNAL_COLLECTION_STORIES,
  JOURNAL_FEATURED_STORY,
  type JournalCategory,
} from '../features/journal';

/**
 * JournalPage — Phase 4: the stories behind the movement.
 *
 * Editorial archive layout: intro, one featured story, a filterable story
 * collection, and SEE MORE that reveals the next batch inline (no
 * pagination, no arrow — it loads below, it does not navigate).
 *
 * Follows the approved Home/Mission design language (SF Pro Display,
 * editorial cards, rounded-2xl imagery, calm power). Content is static —
 * no CMS/backend. All human imagery is full-silhouette (no visible eyes).
 */

const INITIAL_BATCH_SIZE = 4;
const BATCH_SIZE = 4;

const FILTER_OPTIONS: readonly ('ALL' | JournalCategory)[] = ['ALL', ...JOURNAL_CATEGORIES];

export function JournalPage() {
  const [activeCategory, setActiveCategory] = useState<'ALL' | JournalCategory>('ALL');
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);

  const visibleStories = useMemo(() => {
    const filtered =
      activeCategory === 'ALL'
        ? JOURNAL_COLLECTION_STORIES
        : JOURNAL_COLLECTION_STORIES.filter((story) => story.category === activeCategory);
    return filtered.slice(0, visibleCount);
  }, [activeCategory, visibleCount]);

  const totalInCategory = useMemo(() => {
    return activeCategory === 'ALL'
      ? JOURNAL_COLLECTION_STORIES.length
      : JOURNAL_COLLECTION_STORIES.filter((story) => story.category === activeCategory).length;
  }, [activeCategory]);

  const hasMore = visibleCount < totalInCategory;

  const handleCategoryChange = (category: 'ALL' | JournalCategory) => {
    setActiveCategory(category);
    setVisibleCount(INITIAL_BATCH_SIZE);
  };

  const handleSeeMore = () => {
    setVisibleCount((current) => current + BATCH_SIZE);
  };

  const featured = JOURNAL_FEATURED_STORY;

  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif] text-neutral-900">
      <main>
        {/* ─── JOURNAL INTRO ────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
            One Mission
          </p>
          <h1 className="mt-4 text-5xl font-bold uppercase leading-none tracking-tight sm:text-7xl lg:text-8xl">
            Journal
          </h1>
          <p className="mt-5 text-lg font-semibold uppercase tracking-tight text-neutral-400 sm:text-2xl">
            The Stories
            <span className="block">Behind The Movement.</span>
          </p>
        </section>

        {/* ─── FEATURED STORY ───────────────────────────────────────────── */}
        <section className="mx-auto mt-10 max-w-5xl px-4 sm:mt-12 sm:px-6 lg:px-8">
          <Link
            to={`/journal/${featured.id}`}
            aria-label={`${featured.title} — read story`}
            className="group relative block overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
          >
            <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/9]">
              <img
                src={featured.image}
                alt={featured.alt}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10"
              />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8 lg:p-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
                  {featured.category} · {featured.date}
                </p>
                <h2 className="mt-2 max-w-2xl text-2xl font-bold uppercase leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  {featured.title}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                  {featured.description}
                </p>
                <span className="mt-4 inline-block text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90 underline-offset-4 group-hover:underline">
                  Read Story
                </span>
              </div>
            </div>
          </Link>
        </section>

        {/* ─── CATEGORY FILTER + STORY COLLECTION ───────────────────────── */}
        <section className="mx-auto mt-14 max-w-5xl px-4 sm:mt-20 sm:px-6 lg:px-8">
          <div
            role="group"
            aria-label="Filter stories by category"
            className="flex flex-wrap gap-2"
          >
            {FILTER_OPTIONS.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryChange(category)}
                  aria-pressed={isActive}
                  className={[
                    'rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2',
                    isActive
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400 hover:text-neutral-900',
                  ].join(' ')}
                >
                  {category === 'ALL' ? 'All' : category.charAt(0) + category.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {visibleStories.map((story) => (
              <article key={story.id}>
                <Link
                  to={`/journal/${story.id}`}
                  aria-label={`${story.title} — read story`}
                  className="group block focus-visible:outline-none"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <img
                      src={story.image}
                      alt={story.alt}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                      {story.category}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold uppercase leading-tight tracking-tight text-neutral-900 transition-colors duration-150 group-hover:text-neutral-600 group-focus-visible:ring-2 group-focus-visible:ring-neutral-900">
                    {story.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-neutral-400">
                    {story.date} · {story.readMinutes} min read
                  </p>
                </Link>
              </article>
            ))}
          </div>

          {/* ─── SEE MORE (no arrow — reveals below, no pagination) ─────── */}
          {hasMore && (
            <div className="mt-12 flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleSeeMore}
                className="rounded-full px-10 py-3.5 text-[11px] font-semibold uppercase tracking-[0.24em]"
              >
                See More
              </Button>
            </div>
          )}

          {!hasMore && totalInCategory > 0 && (
            <p className="mt-12 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-300">
              End of the archive — more stories are being written.
            </p>
          )}
        </section>
      </main>

      {/* Footer with bottom-nav clearance on mobile — same pattern as the
          approved Movement Homepage and Mission page. */}
      <div className="mt-16 bg-white pb-[72px] sm:mt-20 lg:pb-0">
        <HomepageFooter />
      </div>
    </div>
  );
}
