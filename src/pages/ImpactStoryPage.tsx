import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LayoutGrid, Rows3, Columns2 } from 'lucide-react';
import { SkeletonBlock, CmsStatePanel } from '../components/shared';
import { HomepageFooter } from '../features/footer';
import { TopBackNavigation } from '../features/navigation';
import { ROUTES } from '../app/config/routes';
import {
  impactService,
  type ImpactContentBlock,
  type ImpactDetailPayload,
  type ImpactStoryStatus,
} from '../services/api/impactService';

/**
 * ImpactStoryPage — Impact detail, CMS content ONLY.
 *
 *   loading → skeleton
 *   success  → real CMS blocks (ordered TEXT + IMAGE) + related stories
 *   not found → honest not-found state
 *   error    → honest error state with retry
 *
 * The gallery layout toggle is a USER VIEWING PREFERENCE (persisted locally
 * like the existing Collection grid-mode preference) — never CMS data.
 * No static Journal content is used as fallback.
 */

type GalleryMode = 'single' | 'two' | 'editorial';

const GALLERY_MODE_STORAGE_KEY = 'impact-gallery-mode';
const GALLERY_MODES: readonly { mode: GalleryMode; label: string; icon: typeof Rows3 }[] = [
  { mode: 'single', label: 'Single', icon: Rows3 },
  { mode: 'two', label: 'Two Column', icon: Columns2 },
  { mode: 'editorial', label: 'Editorial', icon: LayoutGrid },
] as const;

function loadStoredGalleryMode(): GalleryMode {
  if (typeof window === 'undefined') return 'single';
  const stored = window.localStorage.getItem(GALLERY_MODE_STORAGE_KEY);
  if (stored === 'single' || stored === 'two' || stored === 'editorial') return stored;
  return 'single';
}

function persistGalleryMode(mode: GalleryMode) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(GALLERY_MODE_STORAGE_KEY, mode);
}

function statusLabel(status: ImpactStoryStatus): string {
  if (status === 'NOW_LIVE') return 'NOW LIVE';
  if (status === 'COMING_SOON') return 'COMING SOON';
  if (status === 'CLOSED') return 'CLOSED';
  return 'DRAFT';
}

function statusBadgeClass(status: ImpactStoryStatus): string {
  if (status === 'NOW_LIVE') return 'bg-emerald-100 text-emerald-900';
  if (status === 'COMING_SOON') return 'bg-amber-100 text-amber-900';
  return 'bg-neutral-200 text-neutral-700';
}

type StoryState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'notFound' }
  | { status: 'success'; payload: ImpactDetailPayload };

function StorySkeleton() {
  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif]">
      <div className="mx-auto max-w-3xl px-4 pt-28 sm:px-6 sm:pt-32">
        <SkeletonBlock className="h-3 w-32" />
        <SkeletonBlock className="mt-4 h-10 w-4/5 max-w-xl" />
        <SkeletonBlock className="mt-3 h-4 w-full max-w-md" />
        <SkeletonBlock className="mt-8 aspect-[16/9] w-full rounded-2xl" />
        <SkeletonBlock className="mt-8 h-4 w-full" />
        <SkeletonBlock className="mt-3 h-4 w-full" />
        <SkeletonBlock className="mt-3 h-4 w-3/4" />
      </div>
      <div className="mt-16 bg-white pb-[100px] lg:pb-0">
        <HomepageFooter />
      </div>
    </div>
  );
}

export function ImpactStoryPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [state, setState] = useState<StoryState>({ status: 'loading' });
  const [galleryMode, setGalleryMode] = useState<GalleryMode>(() => loadStoredGalleryMode());

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const payload = await impactService.getImpactStory(slug);
      setState({ status: 'success', payload });
    } catch (error) {
      const code = (error as { code?: string } | null)?.code;
      if (code === 'IMPACT_NOT_FOUND') {
        setState({ status: 'notFound' });
      } else {
        setState({ status: 'error' });
      }
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleGalleryModeChange = (mode: GalleryMode) => {
    setGalleryMode(mode);
    persistGalleryMode(mode);
  };

  if (state.status === 'loading') {
    return <StorySkeleton />;
  }

  if (state.status === 'notFound') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center font-['SF-Pro-Display',_sans-serif]">
        <TopBackNavigation label="Back to Impact" fallbackTo={ROUTES.IMPACT} />
        <h1 className="text-3xl font-bold uppercase tracking-tight text-neutral-900">
          Story not found
        </h1>
        <p className="mb-8 mt-2 max-w-sm text-sm text-neutral-500">
          This story does not exist or has been moved.
        </p>
        <Link
          to={ROUTES.IMPACT}
          className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-white transition-colors hover:bg-neutral-700"
        >
          Back to Impact
        </Link>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="min-h-screen bg-white">
        <TopBackNavigation label="Back to Impact" fallbackTo={ROUTES.IMPACT} />
        <div className="pt-16">
          <CmsStatePanel
            eyebrow="Impact"
            title="Unable to load this story."
            description="Please check your connection and try again."
            actionLabel="Try Again"
            onAction={() => void load()}
          />
        </div>
      </div>
    );
  }

  const { story, blocks, related } = state.payload;
  const imageBlocks: ImpactContentBlock[] = blocks.filter((block) => block.type === 'IMAGE');
  const textBlocks: ImpactContentBlock[] = blocks.filter((block) => block.type === 'TEXT');
  const showGalleryToggle = imageBlocks.length >= 2;

  const galleryGridClass =
    galleryMode === 'single'
      ? 'grid-cols-1'
      : galleryMode === 'two'
        ? 'grid-cols-2'
        : 'grid-cols-2';

  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif] text-neutral-900">
      <TopBackNavigation label="Back to Impact" fallbackTo={ROUTES.IMPACT} />

      <article className="mx-auto max-w-3xl px-4 pt-24 sm:px-6 sm:pt-28">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusBadgeClass(story.status)}`}>
            {statusLabel(story.status)}
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
            {story.category}
            {story.publishedAt ? ` · ${new Date(story.publishedAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}` : ''}
            {story.readingMinutes ? ` · ${story.readingMinutes} min read` : ''}
          </p>
        </div>

        <h1 className="mt-3 text-3xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
          {story.title}
        </h1>
        {story.shortDescription && (
          <p className="mt-3 text-sm leading-relaxed text-neutral-500 sm:text-base">
            {story.shortDescription}
          </p>
        )}

        {story.coverImage && (
          <div className="mt-8 overflow-hidden rounded-2xl">
            <img
              src={story.coverImage}
              alt={story.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        )}

        {/* ─── CONTENT BLOCKS (in CMS order) ───────────────────────────── */}
        {textBlocks.length > 0 && (
          <div className="mt-8 space-y-8">
            {textBlocks.map((block) => (
              <p key={block.id} className="text-[15px] leading-relaxed text-neutral-700">
                {block.text}
              </p>
            ))}
          </div>
        )}

        {/* ─── IMAGE DOCUMENTATION + GALLERY TOGGLE ─────────────────────── */}
        {showGalleryToggle && (
          <div className="mt-12 border-t border-neutral-200 pt-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
                Image Gallery
              </p>
              <div
                role="group"
                aria-label="Gallery layout"
                className="flex items-center gap-1 rounded-full border border-neutral-200 p-1"
              >
                {GALLERY_MODES.map(({ mode, label, icon: Icon }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleGalleryModeChange(mode)}
                    aria-pressed={galleryMode === mode}
                    aria-label={`${label} layout`}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 ${
                      galleryMode === mode ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <Icon size={13} strokeWidth={2.2} />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`grid gap-4 ${galleryGridClass}`}>
              {imageBlocks.map((block, index) => {
                const isEditorialFirst = galleryMode === 'editorial' && index === 0;
                return (
                  <figure
                    key={block.id}
                    className={isEditorialFirst ? 'col-span-2' : ''}
                  >
                    <div className="overflow-hidden rounded-2xl">
                      <img
                        src={block.imageUrl || ''}
                        alt={block.altText || ''}
                        loading="lazy"
                        className={`w-full object-cover ${
                          isEditorialFirst ? 'aspect-[16/9]' : 'aspect-[4/3]'
                        }`}
                      />
                    </div>
                    {block.caption && (
                      <figcaption className="mt-2 text-xs leading-relaxed text-neutral-400">
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              })}
            </div>
          </div>
        )}

        {!showGalleryToggle && imageBlocks.length === 1 && (
          <div className="mt-12">
            <figure>
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={imageBlocks[0].imageUrl || ''}
                  alt={imageBlocks[0].altText || ''}
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
              {imageBlocks[0].caption && (
                <figcaption className="mt-2 text-xs leading-relaxed text-neutral-400">
                  {imageBlocks[0].caption}
                </figcaption>
              )}
            </figure>
          </div>
        )}

        {textBlocks.length === 0 && imageBlocks.length === 0 && (
          <p className="mt-8 text-sm text-neutral-400">Documentation is still being prepared.</p>
        )}
      </article>

      {/* ─── RELATED IMPACT ─────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="mx-auto mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
            Related Impact
          </p>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                to={`/impact/${item.slug}`}
                className="group block focus-visible:outline-none"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-neutral-100" />
                  )}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <h3 className="text-sm font-bold uppercase leading-tight tracking-tight line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-16 bg-white pb-[100px] lg:pb-0">
        <HomepageFooter />
      </div>
    </div>
  );
}
