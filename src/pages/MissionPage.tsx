import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Check, Dumbbell, Sprout, Trophy, type LucideIcon } from 'lucide-react';
import { Button } from '../components/shared';
import { HomepageFooter } from '../features/footer';
import {
  missionService,
  type MissionPayload,
  type MissionOptionPayload,
} from '../services/api/missionService';

/**
 * MissionPage — approved Mission voting experience, CMS-driven.
 *
 * Content source: HQ Mission CMS (public API). Voting goes through the
 * server-side vote API; results are computed from real vote records.
 *
 * Fallback: when the API is unavailable, the previously approved static
 * content renders (design unchanged). Live statistics are NEVER fabricated —
 * they only render when real voting data arrives from the backend.
 *
 * Imagery constraint: local fallback images remain full-silhouette
 * compositions (no visible human faces or eyes).
 */

const FALLBACK_MISSION = {
  eyebrow: 'YOUR VOICE, OUR NEXT STEP',
  title: 'THE NEXT MISSION IS YOURS.',
  description: 'Your vote will shape our next move as a movement.',
};

const FALLBACK_OPTIONS: readonly MissionOptionPayload[] = [
  {
    id: 'pesantren',
    title: 'PESANTREN',
    description: 'Support sports facilities and apparel for santri.',
    image: '/images/mission/mission-pesantren.jpg',
    displayOrder: 1,
  },
  {
    id: 'football',
    title: 'MUSLIM FOOTBALL',
    description: 'Empower Muslim teams to play with identity and purpose.',
    image: '/images/mission/mission-football.jpg',
    displayOrder: 2,
  },
  {
    id: 'calisthenics',
    title: 'MUSLIM CALISTHENICS',
    description: 'Build a strong and disciplined Muslim fitness community.',
    image: '/images/mission/mission-calisthenics.jpg',
    displayOrder: 3,
  },
  {
    id: 'youth',
    title: 'YOUTH DEVELOPMENT',
    description: 'Invest in the next generation through sports and character.',
    image: '/images/mission/mission-youth.jpg',
    displayOrder: 4,
  },
] as const;

const FALLBACK_ALTS: readonly string[] = [
  'Silhouette of a santri holding a soccer ball on a field at dusk.',
  'Silhouette of a Muslim football player on a pitch at dusk.',
  'Silhouette of a calisthenics athlete on a pull-up bar at night.',
  'Silhouettes of young athletes jogging on a track at sunrise.',
] as const;

const RESULT_ICONS: readonly LucideIcon[] = [BookOpen, Trophy, Dumbbell, Sprout] as const;

const SOCIAL_PROOF_AVATARS = ['#D1D5DB', '#9CA3AF', '#6B7280'] as const;

function sortOptionsByDisplayOrder(options: MissionOptionPayload[]): MissionOptionPayload[] {
  return [...options].sort(
    (left, right) => Number(left.displayOrder || 0) - Number(right.displayOrder || 0) || left.id.localeCompare(right.id),
  );
}

/** Preserves the approved two-line headline treatment for any CMS title. */
function splitTitleLines(title: string): [string, string] {
  const words = String(title || '').trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return ['The Next Mission', 'Is Yours.'];
  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(' '), words.slice(midpoint).join(' ')];
}

export function MissionPage() {
  const [payload, setPayload] = useState<MissionPayload | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    missionService
      .getMission()
      .then((result) => {
        if (!isActive) return;
        setPayload(result);
        // Server already knows whether this voter identity (authenticated OR
        // anonymous cookie) has voted — reflect it without any login flow.
        if (result.hasVoted) {
          setHasVoted(true);
          setAlreadyVoted(true);
        }
      })
      .catch(() => {
        // API unavailable → approved fallback content stays rendered.
      });
    return () => {
      isActive = false;
    };
  }, []);

  const options = useMemo(() => {
    if (payload && payload.options.length > 0) {
      return sortOptionsByDisplayOrder(payload.options);
    }
    return [...FALLBACK_OPTIONS];
  }, [payload]);

  const missionStatus = payload?.mission?.status ?? null;

  const resultRows = useMemo(() => {
    if (!payload) return [];
    return payload.results.map((row, index) => {
      const option = options.find((item) => item.id === row.optionId);
      return {
        optionId: row.optionId,
        label: option?.title || `Option ${index + 1}`,
        percent: row.percentage,
        votes: row.votes,
        icon: RESULT_ICONS[index % RESULT_ICONS.length],
      };
    });
  }, [payload, options]);

  const votingAllowed = missionStatus === 'OPEN';
  const voteButtonDisabled =
    !selectedId || hasVoted || isSubmitting || (missionStatus !== null && !votingAllowed);

  const handleSelect = useCallback((id: string) => {
    if (hasVoted) return;
    setSelectedId(id);
    setVoteError(null);
  }, [hasVoted]);

  const handleVote = useCallback(async () => {
    if (!selectedId || hasVoted || isSubmitting) return;

    if (!payload) {
      setVoteError('Voting is temporarily unavailable. Please try again later.');
      return;
    }

    if (!votingAllowed) {
      setVoteError(
        missionStatus === 'CLOSED'
          ? 'Voting is currently closed.'
          : 'Voting has not started yet.',
      );
      return;
    }

    setIsSubmitting(true);
    setVoteError(null);

    try {
      const updated = await missionService.vote(selectedId);
      setPayload(updated);
      setHasVoted(true);
      setAlreadyVoted(false);
    } catch (error) {
      const errorCode = (error as { code?: string } | null)?.code;
      if (errorCode === 'MISSION_ALREADY_VOTED') {
        // Duplicate vote: show the already-voted state — never ask to log in.
        setAlreadyVoted(true);
        setHasVoted(true);
      } else {
        setVoteError('Your vote could not be recorded. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [hasVoted, isSubmitting, missionStatus, payload, selectedId, votingAllowed]);

  const eyebrow = payload?.mission?.eyebrow || FALLBACK_MISSION.eyebrow;
  const description = payload?.mission?.description || FALLBACK_MISSION.description;
  const [titleLineOne, titleLineTwo] = splitTitleLines(payload?.mission?.title || FALLBACK_MISSION.title);

  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif] text-neutral-900">
      <main>
        {/* ─── MISSION INTRO ─────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block">{titleLineOne}</span>
            <span className="block">{titleLineTwo}</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-500 sm:text-base">
            {description}
          </p>
        </section>

        {/* ─── MISSION OPTIONS ───────────────────────────────────────────── */}
        <section className="mx-auto mt-10 max-w-5xl px-4 sm:mt-12 sm:px-6 lg:px-8">
          <div
            role="group"
            aria-label="Mission options"
            className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6"
          >
            {options.map((option, index) => {
              const isSelected = selectedId === option.id;
              const cardNumber = String(Number(option.displayOrder) || index + 1).padStart(2, '0');
              const optionImage = option.image || FALLBACK_OPTIONS[index % FALLBACK_OPTIONS.length].image;
              const optionAlt = FALLBACK_ALTS[index % FALLBACK_ALTS.length];
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
                    src={optionImage}
                    alt={optionAlt}
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
                    {cardNumber}
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
            disabled={voteButtonDisabled}
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
                {isSubmitting ? 'Recording…' : 'Vote Now'}
                {!isSubmitting && <ArrowRight size={16} strokeWidth={2.5} />}
              </span>
            )}
          </Button>

          {hasVoted && !alreadyVoted && (
            <div
              role="status"
              aria-live="polite"
              className="mt-4 flex flex-col items-center gap-1 text-center"
            >
              <p className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-900">
                <Check size={14} strokeWidth={3} />
                Your Vote Has Been Recorded
              </p>
              <p className="text-xs text-neutral-500">Thank you for moving with us.</p>
            </div>
          )}

          {alreadyVoted && (
            <div
              role="status"
              aria-live="polite"
              className="mt-4 flex flex-col items-center gap-1 text-center"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-900">
                You've Already Voted
              </p>
              <p className="text-xs text-neutral-500">
                You have already submitted your vote for this mission.
              </p>
            </div>
          )}

          {voteError && (
            <div className="mt-4 text-center" role="alert">
              <p className="text-sm font-medium text-neutral-700">{voteError}</p>
            </div>
          )}

          {missionStatus !== null && !votingAllowed && !hasVoted && (
            <p className="mt-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              {missionStatus === 'CLOSED' ? 'Voting is currently closed.' : 'Voting has not started yet.'}
            </p>
          )}
        </section>

        {/* ─── SOCIAL PROOF (live data only — never fabricated) ──────────── */}
        {payload && (
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
            <p className="text-sm font-medium text-neutral-600">
              {payload.totalVotes.toLocaleString('id-ID')} people have voted
            </p>
          </section>
        )}

        {/* ─── VOTING RESULTS (computed by the backend) ──────────────────── */}
        {payload && (
          <section className="mx-auto mt-16 max-w-5xl px-4 sm:mt-20 sm:px-6 lg:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
              Voting Results
            </p>

            <div className="mt-7 space-y-5 sm:space-y-6">
              {resultRows.map((result) => {
                const ResultIcon = result.icon;
                return (
                  <div key={result.optionId} className="flex items-center gap-3 sm:gap-4">
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
        )}
      </main>

      {/* Footer with bottom-nav clearance on mobile — same pattern as the
          approved Movement Homepage. */}
      <div className="mt-16 bg-white pb-[100px] sm:mt-20 lg:pb-0">
        <HomepageFooter />
      </div>
    </div>
  );
}
