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
 * CMS-driven: header settings, status filtering + sorting, and SEE MORE
 * pagination all come from the public HQ Impact API. The server keeps the
 * default ordering (NOW LIVE → COMING SOON → CLOSED; DRAFT never public).
 *
 * Fallback: when the API is unavailable, the previously approved static
 * content renders with the same visual design.
 */

const INITIAL_BATCH_SIZE = 12;
const BATCH_SIZE = 12;

const STATUS_OPTIONS = ['ALL', 'NOW_LIVE', 'COMING_SOON', 'CLOSED'] as const;
const SORT_OPTIONS = ['LATEST', 'UPCOMING', 'OLDEST'] as const;

type StatusFilter = (typeof STATUS_OPTIONS)[number];
type SortMode = (typeof SORT_OPTIONS)[number];

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

/**
 * Semantic status colors (consistent across Impact pages):
 *   NOW LIVE     → subtle green
 *   COMING SOON  → subtle amber
 *   CLOSED       → neutral gray
 * Status text remains visible — color is never the only signal.
 */
function statusBadgeClass(status: ImpactStoryStatus): string {
  if (status === 'NOW_LIVE') return 'bg-emerald-100 text-emerald-900';
  if (status === 'COMING_SOON') return 'bg-amber-100 text-amber-900';
  return 'bg-neutral-200 text-neutral-700';
}

function formatDate(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
}

function getPublishedTime(value: string | null): number {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/** Fallback-only local sort (the server sorts when the CMS is active). */
function sortFallbackItems(items: ImpactListItem[], sort: SortMode): ImpactListItem[] {
  const priority: Record<string, number> = { NOW_LIVE: 0, COMING_SOON: 1, CLOSED: 2 };
  return [...items].sort((left, right) => {
    const groupDiff = (priority[left.status] ?? 99) - (priority[right.status] ?? 99);
    if (groupDiff !== 0) return groupDiff;
    const leftTime = getPublishedTime(left.publishedAt);
    const rightTime = getPublishedTime(right.publishedAt);
    if (sort === 'OLDEST' || sort === 'UPCOMING') return leftTime - rightTime;
    return rightTime - leftTime;
  });
}

function emptyStateLabel(status: StatusFilter): string {
  if (status === 'COMING_SOON') return 'No upcoming Impact at the moment.';
  if (status === 'NOW_LIVE') return 'No live Impact at the moment.';
  if (status === 'CLOSED') return 'No closed Impact at the moment.';
  return 'No Impact has been published yet.';
}

export function ImpactPage() {
  const [settings, setSettings] = useState<ImpactPageSettings>(FALLBACK_SETTINGS);
  const [items, setItems] = useState<ImpactListItem[]>(FALLBACK_ITEMS);
  const [isCmsActive, setIsCmsActive] = useState(false);
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('ALL');
  const [activeSort, setActiveSort] = useState<SortMode>('LATEST');
  const [loadedCount, setLoadedCount] = useState(INITIAL_BATCH_SIZE);
  const [total, setTotal] = useState(FALLBACK_ITEMS.length);
  const [isLoading, setIsLoading] = useState(false);

  const loadPage = async (status: StatusFilter, sort: SortMode, offset: number, limit: number) => {
    setIsLoading(true);
    try {
      const result = await impactService.getImpactList(status, sort, offset, limit);
      if (offset === 0) {
        if (result.settings) setSettings(result.settings);
        setItems(result.items);
      } else {
        setItems((current) => {
          const existingSlugs = new Set(current.map((item) => item.slug));
          return [...current, ...result.items.filter((item) => !existingSlugs.has(item.slug))];
        });
      }
      setTotal(result.total);
      setIsCmsActive(true);
    } catch {
      // API unavailable → approved fallback content stays rendered.
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;
    impactService
      .getImpactList('ALL', 'LATEST', 0, INITIAL_BATCH_SIZE)
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
        // Keep the approved fallback.
      });
    return () => {
      isActive = false;
    };
  }, []);

  const handleStatusChange = (status: StatusFilter) => {
    setActiveStatus(status);
    setLoadedCount(INITIAL_BATCH_SIZE);
    if (!isCmsActive) return;
    void loadPage(status, activeSort, 0, INITIAL_BATCH_SIZE);
  };

  const handleSortChange = (sort: SortMode) => {
    setActiveSort(sort);
    setLoadedCount(INITIAL_BATCH_SIZE);
    if (!isCmsActive) return;
    void loadPage(activeStatus, sort, 0, INITIAL_BATCH_SIZE);
  };

  const handleSeeMore = () => {
    if (!isCmsActive) {
      setLoadedCount((current) => current + BATCH_SIZE);
      return;
    }
    void loadPage(activeStatus, activeSort, loadedCount, BATCH_SIZE).then(() => {
      setLoadedCount((current) => current + BATCH_SIZE);
    });
  };

  const visibleItems = useMemo(() => {
    if (isCmsActive) return items;

    const filtered =
      activeStatus === 'ALL'
        ? FALLBACK_ITEMS
        : FALLBACK_ITEMS.filter((item) => item.status === activeStatus);
    return sortFallbackItems(filtered, activeSort).slice(0, loadedCount);
  }, [activeStatus, activeSort, isCmsActive, items, loadedCount]);

  const hasMore = isCmsActive
    ? items.length < total
    : (() => {
        const filtered =
          activeStatus === 'ALL'
            ? FALLBACK_ITEMS
            : FALLBACK_ITEMS.filter((item) => item.status === activeStatus);
        return loadedCount < filtered.length;
      })();

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

        {/* ─── STATUS FILTER + SORT + COLLECTION ────────────────────────── */}
        <section className="mx-auto mt-14 max-w-5xl px-4 sm:mt-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => {
                const isActive = activeStatus === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusChange(status)}
                    aria-pressed={isActive}
                    className={[
                      'rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2',
                      isActive
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400 hover:text-neutral-900',
                    ].join(' ')}
                  >
                    {status === 'ALL' ? 'All' : statusLabel(status)}
                  </button>
                );
              })}
            </div>

            <div role="group" aria-label="Sort impact" className="flex items-center gap-1.5">
              <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                Sort
              </span>
              {SORT_OPTIONS.map((sort) => {
                const isActive = activeSort === sort;
                return (
                  <button
                    key={sort}
                    type="button"
                    onClick={() => handleSortChange(sort)}
                    aria-pressed={isActive}
                    className={[
                      'rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2',
                      isActive
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400 hover:text-neutral-900',
                    ].join(' ')}
                  >
                    {sort.charAt(0) + sort.slice(1).toLowerCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {visibleItems.length === 0 && !isLoading ? (
            <p className="mt-14 text-center text-sm font-medium text-neutral-400">
              {emptyStateLabel(activeStatus)}
            </p>
          ) : (
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
          )}

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
