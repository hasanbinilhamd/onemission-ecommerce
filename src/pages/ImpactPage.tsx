import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, SkeletonBlock, CmsStatePanel } from '../components/shared';
import { HomepageFooter } from '../features/footer';
import {
  impactService,
  type ImpactListPayload,
  type ImpactListItem,
  type ImpactPageSettings,
  type ImpactStoryStatus,
} from '../services/api/impactService';

/**
 * ImpactPage — the documentation/storytelling layer of the movement.
 *
 * The HQ Impact CMS is the single source of truth:
 *   loading → skeleton
 *   success  → real CMS content (status-priority ordering server-side)
 *   empty    → honest empty state (no fabricated stories)
 *   error    → honest error state with retry
 *
 * No static Journal content is ever used as fallback.
 */

const INITIAL_BATCH_SIZE = 12;
const BATCH_SIZE = 12;

const STATUS_OPTIONS = ['ALL', 'NOW_LIVE', 'COMING_SOON', 'CLOSED'] as const;
const SORT_OPTIONS = ['LATEST', 'UPCOMING', 'OLDEST'] as const;

type StatusFilter = (typeof STATUS_OPTIONS)[number];
type SortMode = (typeof SORT_OPTIONS)[number];

type ImpactState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; settings: ImpactPageSettings; items: ImpactListItem[]; total: number; isCmsActive: boolean };

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

function emptyStateLabel(status: StatusFilter): string {
  if (status === 'COMING_SOON') return 'No upcoming Impact at the moment.';
  if (status === 'NOW_LIVE') return 'No live Impact at the moment.';
  if (status === 'CLOSED') return 'No closed Impact at the moment.';
  return 'No Impact has been published yet.';
}

function ImpactSkeleton() {
  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif]">
      <main>
        <section className="mx-auto max-w-5xl px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
          <SkeletonBlock className="h-3 w-40" />
          <SkeletonBlock className="mt-4 h-14 w-2/3 max-w-2xl sm:h-20" />
          <SkeletonBlock className="mt-5 h-4 w-full max-w-md" />
        </section>
        <section className="mx-auto mt-14 max-w-5xl px-4 sm:mt-20 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3].map((index) => (
              <SkeletonBlock key={index} className="h-9 w-24 rounded-full" />
            ))}
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <SkeletonBlock key={index} className="aspect-[4/3] w-full rounded-2xl" />
            ))}
          </div>
        </section>
      </main>
      <div className="mt-16 bg-white pb-[100px] sm:mt-20 lg:pb-0">
        <HomepageFooter />
      </div>
    </div>
  );
}

export function ImpactPage() {
  const [state, setState] = useState<ImpactState>({ status: 'loading' });
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('ALL');
  const [activeSort, setActiveSort] = useState<SortMode>('LATEST');
  const [loadedCount, setLoadedCount] = useState(INITIAL_BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadPage = useCallback(async (status: StatusFilter, sort: SortMode, offset: number, limit: number) => {
    try {
      const result: ImpactListPayload = await impactService.getImpactList(status, sort, offset, limit);
      if (offset === 0) {
        setState({
          status: 'success',
          settings: result.settings ?? { eyebrow: '', title: '', description: '' },
          items: result.items ?? [],
          total: result.total ?? 0,
          isCmsActive: true,
        });
      } else {
        setState((current) => {
          if (current.status !== 'success') return current;
          const existingIds = new Set(current.items.map((item) => item.slug));
          return {
            ...current,
            items: [...current.items, ...result.items.filter((item) => !existingIds.has(item.slug))],
            total: result.total ?? current.total,
          };
        });
      }
    } catch {
      setState((current) =>
        current.status === 'success' ? current : { status: 'error' },
      );
    }
  }, []);

  useEffect(() => {
    setState({ status: 'loading' });
    void loadPage('ALL', 'LATEST', 0, INITIAL_BATCH_SIZE);
  }, [loadPage]);

  const handleStatusChange = (status: StatusFilter) => {
    setActiveStatus(status);
    setLoadedCount(INITIAL_BATCH_SIZE);
    setState({ status: 'loading' });
    void loadPage(status, activeSort, 0, INITIAL_BATCH_SIZE);
  };

  const handleSortChange = (sort: SortMode) => {
    setActiveSort(sort);
    setLoadedCount(INITIAL_BATCH_SIZE);
    setState({ status: 'loading' });
    void loadPage(activeStatus, sort, 0, INITIAL_BATCH_SIZE);
  };

  const handleSeeMore = () => {
    if (state.status !== 'success') return;
    setIsLoadingMore(true);
    void loadPage(activeStatus, activeSort, loadedCount, BATCH_SIZE).finally(() => {
      setIsLoadingMore(false);
      setLoadedCount((current) => current + BATCH_SIZE);
    });
  };

  if (state.status === 'loading') {
    return <ImpactSkeleton />;
  }

  if (state.status === 'error') {
    return (
      <div className="min-h-screen bg-white">
        <div className="pt-16">
          <CmsStatePanel
            eyebrow="Impact"
            title="Unable to load Impact."
            description="Please check your connection and try again."
            actionLabel="Try Again"
            onAction={() => {
              setState({ status: 'loading' });
              void loadPage(activeStatus, activeSort, 0, INITIAL_BATCH_SIZE);
            }}
          />
        </div>
        <div className="bg-white pb-[100px] lg:pb-0">
          <HomepageFooter />
        </div>
      </div>
    );
  }

  const { settings, items, total } = state;
  const hasMore = items.length < total;
  const showEmptyState = items.length === 0 && !hasMore;

  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif] text-neutral-900">
      <main>
        {/* ─── IMPACT INTRO ────────────────────────────────────────────── */}
        {(settings.title || settings.eyebrow || settings.description) && (
          <section className="mx-auto max-w-5xl px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
            {settings.eyebrow && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
                {settings.eyebrow}
              </p>
            )}
            {settings.title && (
              <h1 className="mt-4 text-5xl font-bold uppercase leading-none tracking-tight sm:text-7xl lg:text-8xl">
                {settings.title}
              </h1>
            )}
            {settings.description && (
              <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-500 sm:text-base">
                {settings.description}
              </p>
            )}
          </section>
        )}

        {/* ─── STATUS FILTER + SORT + COLLECTION ────────────────────────── */}
        <section className={`mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 ${settings.title ? 'mt-14 sm:mt-20' : 'pt-24 sm:pt-28'}`}>
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

          {showEmptyState ? (
            <p className="mt-14 text-center text-sm font-medium text-neutral-400">
              {emptyStateLabel(activeStatus)}
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((story) => (
                <article key={story.slug}>
                  <Link
                    to={`/impact/${story.slug}`}
                    aria-label={`${story.title} — read story`}
                    className="group block focus-visible:outline-none"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                      {story.coverImage ? (
                        <img
                          src={story.coverImage}
                          alt={story.title}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-neutral-100" />
                      )}
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
                        {story.shortDescription && (
                          <p className="mt-1.5 text-xs leading-relaxed text-white/80 line-clamp-2">
                            {story.shortDescription}
                          </p>
                        )}
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
                disabled={isLoadingMore}
                className="rounded-full px-10 py-3.5 text-[11px] font-semibold uppercase tracking-[0.24em]"
              >
                {isLoadingMore ? 'Loading…' : 'See More'}
              </Button>
            </div>
          )}

          {!hasMore && items.length > 0 && (
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
