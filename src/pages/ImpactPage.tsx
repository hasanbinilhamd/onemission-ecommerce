import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/shared';
import { HomepageFooter } from '../features/footer';
import { JOURNAL_STORIES } from '../features/journal';
import {
  impactService,
  type ImpactListItem,
  type ImpactPageSettings,
  type ImpactStoryStatus,
} from '../services/api/impactService';

/**
 * ImpactPage — the documentation/storytelling layer of the movement.
 *
 * CMS-driven: header settings, status-priority ordering, category filter,
 * and SEE MORE pagination all come from the public HQ Impact API.
 *
 * Fallback: when the API is unavailable, the previously approved static
 * content renders with the same visual design.
 */

const INITIAL_BATCH_SIZE = 4;
const BATCH_SIZE = 4;

const FILTER_OPTIONS = ['ALL', 'PEOPLE', 'COMMUNITY', 'PHILOSOPHY', 'JOURNEY'] as const;

const FALLBACK_SETTINGS: ImpactPageSettings = {
  eyebrow: 'IMPACT',
  title: 'THE WORK BEHIND THE MOVEMENT.',
  description: 'Stories, progress, people, and ideas shaping what we are building together.',
};

const FALLBACK_ITEMS: ImpactListItem[] = JOURNAL_STORIES.map((story) => ({
  id: story.id,
  title: story.title,
  slug: story.id,
  category: story.category,
  shortDescription: story.description,
  coverImage: story.image,
  status: 'NOW_LIVE',
  featured: story.featured === true,
  publishedAt: story.date,
  readingMinutes: story.readMinutes,
}));

function statusLabel(status: ImpactStoryStatus): string {
  if (status === 'NOW_LIVE') return 'NOW LIVE';
  if (status === 'COMING_SOON') return 'COMING SOON';
  if (status === 'CLOSED') return 'CLOSED';
  return 'DRAFT';
}

function statusBadgeClass(status: ImpactStoryStatus): string {
  if (status === 'NOW_LIVE') return 'bg-neutral-900 text-white';
  if (status === 'COMING_SOON') return 'bg-white/20 text-white backdrop-blur-md';
  return 'bg-white/20 text-white backdrop-blur-md';
}

function formatDate(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
}

export function ImpactPage() {
  const [settings, setSettings] = useState<ImpactPageSettings>(FALLBACK_SETTINGS);
  const [items, setItems] = useState<ImpactListItem[]>(FALLBACK_ITEMS);
  const [isCmsActive, setIsCmsActive] = useState(false);
  const [activeCategory, setActiveCategory] = useState<(typeof FILTER_OPTIONS)[number]>('ALL');
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);
  const [total, setTotal] = useState(FALLBACK_ITEMS.length);

  useEffect(() => {
    let isActive = true;
    impactService
      .getImpactList('ALL', 0, INITIAL_BATCH_SIZE)
      .then((result) => {
        if (!isActive) return;
        if (result.settings) setSettings(result.settings);
        if (Array.isArray(result.items)) {
          setItems(result.items);
          setTotal(result.total);
          setIsCmsActive(true);
        }
      })
      .catch(() => {
        // API unavailable → approved fallback content stays rendered.
      });
    return () => {
      isActive = false;
    };
  }, []);

  const handleCategoryChange = async (category: (typeof FILTER_OPTIONS)[number]) => {
    setActiveCategory(category);
    setVisibleCount(INITIAL_BATCH_SIZE);

    if (!isCmsActive) return;

    try {
      const result = await impactService.getImpactList(category, 0, INITIAL_BATCH_SIZE);
      setItems(result.items);
      setTotal(result.total);
    } catch {
      // Keep the previously loaded list on filter errors.
    }
  };

  const handleSeeMore = async () => {
    if (!isCmsActive) {
      setVisibleCount((current) => current + BATCH_SIZE);
      return;
    }

    try {
      const result = await impactService.getImpactList(activeCategory, visibleCount, BATCH_SIZE);
      setItems((current) => {
        const existingIds = new Set(current.map((item) => item.slug));
        const next = result.items.filter((item) => !existingIds.has(item.slug));
        return [...current, ...next];
      });
      setTotal(result.total);
      setVisibleCount((current) => current + BATCH_SIZE);
    } catch {
      // Leave the list unchanged on errors.
    }
  };

  const visibleItems = useMemo(
    () => (isCmsActive ? items : items.slice(0, visibleCount)),
    [isCmsActive, items, visibleCount],
  );

  const hasMore = isCmsActive ? items.length < total : visibleCount < items.length;

  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif] text-neutral-900">
      <main>
        {/* ─── IMPACT INTRO ────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
            {settings.eyebrow}
          </p>
          <h1 className="mt-4 text-5xl font-bold uppercase leading-none tracking-tight sm:text-7xl lg:text-8xl">
            {settings.title}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-500 sm:text-base">
            {settings.description}
          </p>
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

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((story) => (
              <article key={story.slug}>
                <Link
                  to={`/impact/${story.slug}`}
                  aria-label={`${story.title} — read story`}
                  className="group block focus-visible:outline-none"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10"
                    />
                    <span className="absolute left-4 top-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90">
                      {story.category}
                    </span>
                    <span
                      className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] ${statusBadgeClass(story.status)}`}
                    >
                      {statusLabel(story.status)}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-4 text-white sm:p-5">
                      <h3 className="text-lg font-bold uppercase leading-tight tracking-tight drop-shadow-sm line-clamp-2">
                        {story.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-white/80 line-clamp-2">
                        {story.shortDescription}
                      </p>
                      <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-widest text-white/60 drop-shadow-sm">
                        {formatDate(story.publishedAt)}
                        {story.readingMinutes ? ` · ${story.readingMinutes} min read` : ''}
                      </p>
                    </div>
                  </div>
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

          {!hasMore && visibleItems.length > 0 && (
            <p className="mt-12 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-300">
              End of the archive — more stories are being written.
            </p>
          )}
        </section>
      </main>

      {/* Footer with bottom-nav clearance on mobile — same pattern as the
          approved Movement pages. */}
      <div className="mt-16 bg-white pb-[100px] sm:mt-20 lg:pb-0">
        <HomepageFooter />
      </div>
    </div>
  );
}
