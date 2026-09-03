import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Dumbbell,
  Sprout,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import {
  Button,
  SkeletonBlock,
  CmsStatePanel,
  ComingSoonPage,
} from "../components/shared";
import { HomepageFooter } from "../features/footer";
import {
  missionService,
  type MissionPayload,
  type MissionOptionPayload,
} from "../services/api/missionService";

/**
 * MissionPage — approved Mission voting experience, CMS-driven content ONLY.
 *
 * The HQ Mission CMS is the single source of truth:
 *   loading → skeleton (intro + option cards + voting area)
 *   success  → real CMS content (only an OPEN mission is returned publicly)
 *   no mission → honest "NO ACTIVE MISSION" empty state
 *   error    → honest error state with retry
 *
 * Results and total voters are live data only — never fabricated, never
 * static. Voting goes through the server-side vote API (anonymous-friendly).
 */

type MissionState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; payload: MissionPayload };

const RESULT_ICONS: readonly LucideIcon[] = [
  BookOpen,
  Trophy,
  Dumbbell,
  Sprout,
] as const;

const SOCIAL_PROOF_AVATARS = ["#D1D5DB", "#9CA3AF", "#6B7280"] as const;

function sortOptionsByDisplayOrder(
  options: MissionOptionPayload[],
): MissionOptionPayload[] {
  return [...options].sort(
    (left, right) =>
      Number(left.displayOrder || 0) - Number(right.displayOrder || 0) ||
      left.id.localeCompare(right.id),
  );
}

/** Preserves the approved two-line headline treatment for any CMS title. */
function splitTitleLines(title: string): [string, string] {
  const words = String(title || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length <= 1) return ["The Next Mission", "Is Yours."];
  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")];
}

function MissionSkeleton() {
  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif]">
      <main>
        <section className="mx-auto max-w-5xl px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
          <SkeletonBlock className="h-3 w-56" />
          <SkeletonBlock className="mt-4 h-12 w-3/4 max-w-xl sm:h-16" />
          <SkeletonBlock className="mt-3 h-12 w-1/2 max-w-md sm:h-16" />
          <SkeletonBlock className="mt-5 h-4 w-full max-w-md" />
        </section>
        <section className="mx-auto mt-10 max-w-5xl px-4 sm:mt-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            {[0, 1, 2, 3].map((index) => (
              <SkeletonBlock
                key={index}
                className="aspect-[3/4] w-full rounded-2xl"
              />
            ))}
          </div>
        </section>
        <section className="mx-auto mt-10 max-w-md px-4 sm:mt-12 lg:px-8">
          <SkeletonBlock className="h-14 w-full rounded-full" />
        </section>
      </main>
      <div className="bg-white sm:mt-20">
        <HomepageFooter />
      </div>
    </div>
  );
}

export function MissionPage() {
  const [state, setState] = useState<MissionState>({ status: "loading" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const payload = await missionService.getMission();
      setState({ status: "success", payload });
      if (payload.hasVoted) {
        setHasVoted(true);
        setAlreadyVoted(true);
      } else {
        setHasVoted(false);
        setAlreadyVoted(false);
        setSelectedId(null);
      }
    } catch {
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const payload = state.status === "success" ? state.payload : null;

  const options = useMemo(
    () =>
      payload && payload.options.length > 0
        ? sortOptionsByDisplayOrder(payload.options)
        : [],
    [payload],
  );

  const resultRows = useMemo(() => {
    if (!payload) return [];
    return payload.results.map((row, index) => {
      const option = options.find((item) => item.id === row.optionId);
      return {
        optionId: row.optionId,
        label: option?.title || `Option ${index + 1}`,
        percent: row.percentage,
        icon: RESULT_ICONS[index % RESULT_ICONS.length],
      };
    });
  }, [payload, options]);

  const votingAllowed = payload?.mission?.status === "OPEN";
  const voteButtonDisabled =
    !selectedId || hasVoted || isSubmitting || !votingAllowed;

  const handleSelect = useCallback(
    (id: string) => {
      if (hasVoted) return;
      setSelectedId(id);
      setVoteError(null);
    },
    [hasVoted],
  );

  const handleVote = useCallback(async () => {
    if (!selectedId || hasVoted || isSubmitting) return;
    if (!votingAllowed) {
      setVoteError("Voting is currently closed.");
      return;
    }

    setIsSubmitting(true);
    setVoteError(null);

    try {
      const updated = await missionService.vote(selectedId);
      setState({ status: "success", payload: updated });
      setHasVoted(true);
      setAlreadyVoted(false);
    } catch (error) {
      const errorCode = (error as { code?: string } | null)?.code;
      if (errorCode === "MISSION_ALREADY_VOTED") {
        setAlreadyVoted(true);
        setHasVoted(true);
      } else {
        setVoteError("Your vote could not be recorded. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [hasVoted, isSubmitting, selectedId, votingAllowed]);

  if (state.status === "loading") {
    return <MissionSkeleton />;
  }

  if (state.status === "error") {
    return (
      <div className="min-h-screen bg-white">
        <div className="pt-16">
          <CmsStatePanel
            eyebrow="One Mission"
            title="Unable to load the mission."
            description="Please check your connection and try again."
            actionLabel="Try Again"
            onAction={() => void load()}
          />
        </div>
        <div className="bg-white">
          <HomepageFooter />
        </div>
      </div>
    );
  }

  const mission = payload?.mission ?? null;

  // Page-level CMS availability — independent from mission/voting content.
  if (payload?.pageAvailability === "COMING_SOON") {
    return (
      <div className="min-h-screen bg-white">
        <ComingSoonPage
          eyebrow="Mission"
          title="The Next Mission ."
          description="We're preparing something worth moving for."
        />
        <div className="bg-white">
          <HomepageFooter />
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-white">
        <div className="pt-16">
          <CmsStatePanel
            eyebrow="One Mission"
            title="No Active Mission"
            description="Voting will open here when the next mission goes live."
          />
        </div>
        <div className="bg-white">
          <HomepageFooter />
        </div>
      </div>
    );
  }

  const [titleLineOne, titleLineTwo] = splitTitleLines(mission.title);

  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif] text-neutral-900">
      <main>
        {/* ─── MISSION INTRO ─────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
          {mission.eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
              {mission.eyebrow}
            </p>
          )}
          <h1 className="mt-4 text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block">{titleLineOne}</span>
            <span className="block">{titleLineTwo}</span>
          </h1>
          {mission.description && (
            <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-500 sm:text-base">
              {mission.description}
            </p>
          )}
        </section>

        {/* ─── MISSION OPTIONS ───────────────────────────────────────────── */}
        {options.length > 0 && (
          <section className="mx-auto mt-10 max-w-5xl px-4 sm:mt-12 sm:px-6 lg:px-8">
            <div
              role="group"
              aria-label="Mission options"
              className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6"
            >
              {options.map((option, index) => {
                const isSelected = selectedId === option.id;
                const cardNumber = String(
                  Number(option.displayOrder) || index + 1,
                ).padStart(2, "0");
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option.id)}
                    disabled={hasVoted}
                    aria-pressed={isSelected}
                    aria-label={`${option.title}${isSelected ? ", selected" : ""}`}
                    className={[
                      "group relative block w-full overflow-hidden rounded-2xl text-left",
                      "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
                      isSelected
                        ? "ring-2 ring-neutral-900 ring-offset-2"
                        : "ring-1 ring-neutral-200 hover:ring-neutral-400",
                      hasVoted ? "cursor-default" : "cursor-pointer",
                    ].join(" ")}
                    style={{ aspectRatio: "3 / 4" }}
                  >
                    {option.image ? (
                      <img
                        src={option.image}
                        alt={option.title}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-neutral-100" />
                    )}
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
                        "absolute right-2.5 top-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200",
                        isSelected
                          ? "scale-100 opacity-100"
                          : "scale-75 opacity-0",
                      ].join(" ")}
                      style={{
                        backgroundColor: "#FFFFFF",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                      }}
                    >
                      <Check
                        size={14}
                        strokeWidth={3}
                        className="text-neutral-900"
                      />
                    </span>

                    <div className="absolute inset-x-0 bottom-0 z-10 p-3.5 text-white sm:p-5">
                      {option.title && (
                        <h3 className="text-sm font-bold uppercase leading-tight tracking-tight sm:text-lg lg:text-xl">
                          {option.title}
                        </h3>
                      )}
                      {option.description && (
                        <p className="mt-1 text-[11px] leading-snug text-white/75 sm:text-xs">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

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
                {isSubmitting ? "Recording…" : "Vote Now"}
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
              <p className="text-xs text-neutral-500">
                Thank you for moving with us.
              </p>
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
              <p className="text-sm font-medium text-neutral-700">
                {voteError}
              </p>
            </div>
          )}

          {!votingAllowed && !hasVoted && (
            <p className="mt-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Voting is currently closed.
            </p>
          )}
        </section>

        {/* ─── SOCIAL PROOF (live data only — never fabricated) ──────────── */}
        {payload && payload.totalVotes > 0 && (
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
              {payload.totalVotes.toLocaleString("id-ID")} people have voted
            </p>
          </section>
        )}

        {/* ─── VOTING RESULTS (computed by the backend) ──────────────────── */}
        {payload && resultRows.length > 0 && (
          <section className="mx-auto mt-16 max-w-5xl px-4 sm:mt-20 sm:px-6 lg:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
              Voting Results
            </p>

            <div className="mt-7 space-y-5 sm:space-y-6">
              {resultRows.map((result) => {
                const ResultIcon = result.icon;
                return (
                  <div
                    key={result.optionId}
                    className="flex items-center gap-3 sm:gap-4"
                  >
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
      <div className="mt-16 bg-white sm:mt-20">
        <HomepageFooter />
      </div>
    </div>
  );
}
