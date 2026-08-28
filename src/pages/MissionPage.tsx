import { useCallback, useState } from 'react';
import { ArrowRight, BookOpen, Check, Dumbbell, Sprout, Trophy, type LucideIcon } from 'lucide-react';
import { Button } from '../components/shared';
import { HomepageFooter } from '../features/footer';

/**
 * MissionPage — Phase 3: Mission voting experience.
 *
 * Follows the approved Movement Homepage design language (SF Pro Display,
 * editorial cards, ghost numbers, rounded-full CTAs, same footer treatment).
 *
 * Voting is frontend-only: there is no voting backend in the repository, so
 * the collective results below are static presentation data and the user's
 * vote only produces the confirmation state (it does not alter the results).
 *
 * Imagery constraint: all mission card photos are full-silhouette
 * compositions — no visible human faces or eyes.
 */

interface MissionOption {
  id: string;
  number: string;
  title: string;
  description: string;
  image: string;
  alt: string;
}

const MISSION_OPTIONS: readonly MissionOption[] = [
  {
    id: 'pesantren',
    number: '01',
    title: 'PESANTREN',
    description: 'Support sports facilities and apparel for santri.',
    image: '/images/mission/mission-pesantren.jpg',
    alt: 'Silhouette of a santri holding a soccer ball on a field at dusk.',
  },
  {
    id: 'football',
    number: '02',
    title: 'MUSLIM FOOTBALL',
    description: 'Empower Muslim teams to play with identity and purpose.',
    image: '/images/mission/mission-football.jpg',
    alt: 'Silhouette of a Muslim football player on a pitch at dusk.',
  },
  {
    id: 'calisthenics',
    number: '03',
    title: 'MUSLIM CALISTHENICS',
    description: 'Build a strong and disciplined Muslim fitness community.',
    image: '/images/mission/mission-calisthenics.jpg',
    alt: 'Silhouette of a calisthenics athlete on a pull-up bar at night.',
  },
  {
    id: 'youth',
    number: '04',
    title: 'YOUTH DEVELOPMENT',
    description: 'Invest in the next generation through sports and character.',
    image: '/images/mission/mission-youth.jpg',
    alt: 'Silhouettes of young athletes jogging on a track at sunrise.',
  },
] as const;

interface VotingResult {
  id: string;
  label: string;
  percent: number;
  icon: LucideIcon;
}

/** Static presentation data — no voting backend exists yet. */
const VOTING_RESULTS: readonly VotingResult[] = [
  { id: 'pesantren', label: 'Pesantren', percent: 48, icon: BookOpen },
  { id: 'football', label: 'Muslim Football', percent: 31, icon: Trophy },
  { id: 'calisthenics', label: 'Muslim Calisthenics', percent: 13, icon: Dumbbell },
  { id: 'youth', label: 'Youth Development', percent: 8, icon: Sprout },
] as const;

const PARTICIPATION_COUNT = '12,843 people have voted';

const SOCIAL_PROOF_AVATARS = ['#D1D5DB', '#9CA3AF', '#6B7280'] as const;

export function MissionPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const handleSelect = useCallback((id: string) => {
    if (hasVoted) return;
    setSelectedId(id);
  }, [hasVoted]);

  const handleVote = useCallback(() => {
    if (!selectedId || hasVoted) return;
    setHasVoted(true);
  }, [hasVoted, selectedId]);

  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif] text-neutral-900">
      <main>
        {/* ─── MISSION INTRO ─────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
            Your Voice, Our Next Step
          </p>
          <h1 className="mt-4 text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block">The Next Mission</span>
            <span className="block">Is Yours.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-500 sm:text-base">
            Your vote will shape our next move as a movement.
          </p>
        </section>

        {/* ─── MISSION OPTIONS ───────────────────────────────────────────── */}
        <section className="mx-auto mt-10 max-w-5xl px-4 sm:mt-12 sm:px-6 lg:px-8">
          <div
            role="group"
            aria-label="Mission options"
            className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6"
          >
            {MISSION_OPTIONS.map((option) => {
              const isSelected = selectedId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  disabled={hasVoted}
                  aria-pressed={isSelected}
                  aria-label={`${option.title}${isSelected ? ', selected' : ''}`}
                  className={[
                    'group relative block w-full overflow-hidden rounded-2xl text-left',
                    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2',
                    isSelected
                      ? 'ring-2 ring-neutral-900 ring-offset-2'
                      : 'ring-1 ring-neutral-200 hover:ring-neutral-400',
                    hasVoted ? 'cursor-default' : 'cursor-pointer',
                  ].join(' ')}
                  style={{ aspectRatio: '3 / 4' }}
                >
                  <img
                    src={option.image}
                    alt={option.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10"
                  />

                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-3 -top-4 select-none text-[84px] font-bold leading-none tracking-tighter text-white opacity-[0.14] sm:-right-4 sm:text-[104px]"
                  >
                    {option.number}
                  </span>

                  <span
                    aria-hidden="true"
                    className={[
                      'absolute right-2.5 top-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200',
                      isSelected ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
                    ].join(' ')}
                    style={{
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    }}
                  >
                    <Check size={14} strokeWidth={3} className="text-neutral-900" />
                  </span>

                  <div className="absolute inset-x-0 bottom-0 z-10 p-3.5 text-white sm:p-5">
                    <h3 className="text-sm font-bold uppercase leading-tight tracking-tight sm:text-lg lg:text-xl">
                      {option.title}
                    </h3>
                    <p className="mt-1 text-[11px] leading-snug text-white/75 sm:text-xs">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ─── VOTE NOW ──────────────────────────────────────────────────── */}
        <section className="mx-auto mt-10 max-w-md px-4 sm:mt-12 lg:px-8">
          <Button
            type="button"
            disabled={!selectedId || hasVoted}
            onClick={handleVote}
            className="w-full rounded-full py-4 text-sm font-semibold uppercase tracking-[0.24em]"
          >
            {hasVoted ? (
              <span className="inline-flex items-center gap-2">
                <Check size={16} strokeWidth={3} />
                Vote Recorded
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                Vote Now
                <ArrowRight size={16} strokeWidth={2.5} />
              </span>
            )}
          </Button>

          {hasVoted && (
            <p
              role="status"
              aria-live="polite"
              className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-900"
            >
              <Check size={14} strokeWidth={3} />
              Your Vote Has Been Counted.
            </p>
          )}
        </section>

        {/* ─── SOCIAL PROOF ──────────────────────────────────────────────── */}
        <section className="mt-10 flex flex-col items-center justify-center gap-3 sm:mt-12">
          <div className="flex -space-x-2.5" aria-hidden="true">
            {SOCIAL_PROOF_AVATARS.map((color) => (
              <span
                key={color}
                className="h-8 w-8 rounded-full border-2 border-white"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className="text-sm font-medium text-neutral-600">{PARTICIPATION_COUNT}</p>
        </section>

        {/* ─── VOTING RESULTS ────────────────────────────────────────────── */}
        <section className="mx-auto mt-16 max-w-5xl px-4 sm:mt-20 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
            Voting Results
          </p>

          <div className="mt-7 space-y-5 sm:space-y-6">
            {VOTING_RESULTS.map((result) => {
              const ResultIcon = result.icon;
              return (
                <div key={result.id} className="flex items-center gap-3 sm:gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                    <ResultIcon size={18} strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-semibold text-neutral-900">
                        {result.label}
                      </span>
                      <span className="shrink-0 text-sm font-bold text-neutral-900">
                        {result.percent}%
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={result.percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${result.label} — ${result.percent} percent`}
                      className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100"
                    >
                      <div
                        className="h-full rounded-full bg-neutral-900"
                        style={{ width: `${result.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer with bottom-nav clearance on mobile — same pattern as the
          approved Movement Homepage. */}
      <div className="mt-16 bg-white pb-[100px] sm:mt-20 lg:pb-0">
        <HomepageFooter />
      </div>
    </div>
  );
}
