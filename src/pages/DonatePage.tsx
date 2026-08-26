import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Check, Dumbbell, Shirt, Users, type LucideIcon } from 'lucide-react';
import { Button, Input } from '../components/shared';
import { HomepageFooter } from '../features/footer';
import { ROUTES } from '../app/config/routes';

/**
 * DonatePage — Phase 5: Help Us Move Further.
 *
 * Trust layer of the movement: hero, one active mission with progress,
 * contribution selection + simple form (frontend confirmation only — no
 * payment gateway, no backend), transparency summary, partners, completed
 * missions linking to Journal, and a final CTA back into the movement loop.
 *
 * Follows the approved Home/Mission/Journal design language. All human
 * imagery is full-silhouette composition — no visible faces or eyes.
 * Numbers are static MVP presentation data.
 */

const CURRENT_MISSION = {
  number: 'MISSION 001',
  title: 'EQUIP 50 SANTRI',
  description: 'Providing sportswear and training support for santri.',
  image: '/images/mission/mission-pesantren.jpg',
  imageAlt: 'Silhouette of a santri holding a soccer ball on a field at dusk.',
  status: 'ACTIVE',
  raised: 18_500_000,
  target: 25_000_000,
  progressPercent: 74,
  supportersCurrent: 31,
  supportersTarget: 50,
} as const;

const SUPPORT_PRESETS = [
  { value: 25_000, label: 'Rp25.000' },
  { value: 50_000, label: 'Rp50.000' },
  { value: 100_000, label: 'Rp100.000' },
  { value: 250_000, label: 'Rp250.000' },
] as const;

const CUSTOM_PRESET_VALUE = 'custom' as const;

const SUPPORT_AREAS: readonly { id: string; icon: LucideIcon; title: string; description: string }[] = [
  { id: 'sportswear', icon: Shirt, title: 'SPORTSWEAR', description: 'Providing appropriate sportswear.' },
  { id: 'facilities', icon: Building2, title: 'FACILITIES', description: 'Supporting training facilities.' },
  { id: 'training', icon: Dumbbell, title: 'TRAINING', description: 'Supporting sports activities and programs.' },
  { id: 'community', icon: Users, title: 'COMMUNITY', description: 'Supporting community development.' },
] as const;

/** Static MVP numbers — placeholders until real, verified metrics exist. */
const IMPACT_CARDS: readonly { image: string; alt: string; label: string }[] = [
  {
    image: '/images/donate/donate-equip.jpg',
    alt: 'Silhouettes of two people passing a folded garment at dawn.',
    label: '50 SANTRI EQUIPPED',
  },
  {
    image: '/images/journal/journal-featured.jpg',
    alt: 'Silhouettes of Muslim athletes in a huddle on a pitch at dawn.',
    label: '100 ATHLETES SUPPORTED',
  },
  {
    image: '/images/journal/journal-community.jpg',
    alt: 'Silhouettes of a football team in a huddle at dusk.',
    label: '1 COMMUNITY BUILT',
  },
] as const;

const TRANSPARENCY_CARDS: readonly { label: string; value: string }[] = [
  { label: 'TOTAL RAISED', value: 'Rp25.000.000' },
  { label: 'USED', value: 'Rp23.500.000' },
  { label: 'REMAINING', value: 'Rp1.500.000' },
] as const;

const COMPLETED_MISSIONS: readonly { image: string; alt: string; number: string; title: string }[] = [
  {
    image: '/images/journal/journal-santri.jpg',
    alt: 'Silhouettes of santri walking across a pesantren courtyard at dusk.',
    number: 'MISSION 001',
    title: '50 SANTRI EQUIPPED',
  },
  {
    image: '/images/journal/journal-featured.jpg',
    alt: 'Silhouettes of Muslim athletes in a huddle on a pitch at dawn.',
    number: 'MISSION 002',
    title: '100 ATHLETES SUPPORTED',
  },
] as const;

const PARTNER_PLACEHOLDER_DESCRIPTION =
  'Partner information will be listed here, documented with each mission report.';

function formatRupiah(value: number): string {
  return `Rp${value.toLocaleString('id-ID')}`;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function DonatePage() {
  const [selectedPreset, setSelectedPreset] = useState<number | typeof CUSTOM_PRESET_VALUE | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showName, setShowName] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resolvedAmount =
    selectedPreset !== null && selectedPreset !== CUSTOM_PRESET_VALUE
      ? selectedPreset
      : Number(customAmount);

  const amountValid = Number.isFinite(resolvedAmount) && resolvedAmount > 0;
  const nameValid = !showName || name.trim().length > 0;
  const emailValid = isValidEmail(email);
  const formValid = amountValid && nameValid && emailValid && !isSubmitted;

  const handlePresetSelect = (value: number | typeof CUSTOM_PRESET_VALUE) => {
    if (isSubmitted) return;
    setSelectedPreset(value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formValid) return;
    setIsSubmitted(true);
  };

  const scrollToSupport = () => {
    document.getElementById('support')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif] text-neutral-900">
      <main>
        {/* ─── DONATE HERO ──────────────────────────────────────────────── */}
        <section className="relative flex min-h-[72vh] items-end overflow-hidden bg-[#0A0A0A]">
          <img
            src="/images/donate/donate-hero.jpg"
            alt="Silhouettes of Muslim athletes walking together toward the sunrise."
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/55 to-[#0A0A0A]/20"
          />
          <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-24 text-white sm:px-6 sm:pb-20 lg:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/60">
              Support The Mission
            </p>
            <h1 className="mt-4 text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Help Us
              <span className="block">Move Further.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
              Support real initiatives that help Muslim communities move, grow, and build together.
            </p>
            <Button
              type="button"
              onClick={scrollToSupport}
              className="mt-8 rounded-full px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.24em]"
            >
              Support This Mission
            </Button>
          </div>
        </section>

        {/* ─── CURRENT MISSION ──────────────────────────────────────────── */}
        <section className="mx-auto mt-14 max-w-5xl px-4 sm:mt-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
            <div className="overflow-hidden rounded-2xl">
              <img
                src={CURRENT_MISSION.image}
                alt={CURRENT_MISSION.imageAlt}
                className="aspect-[4/3] w-full object-cover lg:aspect-[4/5] lg:h-full"
              />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
                {CURRENT_MISSION.number}
              </p>
              <h2 className="mt-3 text-3xl font-bold uppercase leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {CURRENT_MISSION.title}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500 sm:text-base">
                {CURRENT_MISSION.description}
              </p>
              <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-neutral-900 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-white" />
                {CURRENT_MISSION.status}
              </span>
            </div>
          </div>
        </section>

        {/* ─── MISSION PROGRESS ─────────────────────────────────────────── */}
        <section className="mx-auto mt-10 max-w-5xl px-4 sm:mt-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-neutral-200 p-5 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
                  Raised
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                  {formatRupiah(CURRENT_MISSION.raised)}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
                  Target
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                  {formatRupiah(CURRENT_MISSION.target)}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div
                role="progressbar"
                aria-valuenow={CURRENT_MISSION.progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Mission funding progress — ${CURRENT_MISSION.progressPercent} percent`}
                className="h-2 w-full overflow-hidden rounded-full bg-neutral-100"
              >
                <div
                  className="h-full rounded-full bg-neutral-900"
                  style={{ width: `${CURRENT_MISSION.progressPercent}%` }}
                />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-sm font-bold text-neutral-900">{CURRENT_MISSION.progressPercent}%</p>
                <p className="text-sm font-semibold text-neutral-500">
                  {CURRENT_MISSION.supportersCurrent} / {CURRENT_MISSION.supportersTarget} santri supported
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CHOOSE YOUR SUPPORT + FORM ───────────────────────────────── */}
        <section id="support" className="mx-auto mt-14 max-w-5xl scroll-mt-20 px-4 sm:mt-20 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
            Support
          </p>
          <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight sm:text-4xl">
            Choose Your Support
          </h2>

          <div
            role="group"
            aria-label="Choose a support amount"
            className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
          >
            {SUPPORT_PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetSelect(preset.value)}
                  disabled={isSubmitted}
                  aria-pressed={isSelected}
                  className={[
                    'rounded-full border px-4 py-3.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2',
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:text-neutral-900',
                    isSubmitted ? 'cursor-default opacity-60' : '',
                  ].join(' ')}
                >
                  {preset.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => handlePresetSelect(CUSTOM_PRESET_VALUE)}
              disabled={isSubmitted}
              aria-pressed={selectedPreset === CUSTOM_PRESET_VALUE}
              className={[
                'rounded-full border px-4 py-3.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2',
                selectedPreset === CUSTOM_PRESET_VALUE
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:text-neutral-900',
                isSubmitted ? 'cursor-default opacity-60' : '',
              ].join(' ')}
            >
              Custom
            </button>
          </div>

          {isSubmitted ? (
            /* ─── DONATION STATE (frontend confirmation only) ─────────── */
            <div
              role="status"
              aria-live="polite"
              className="mt-10 rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center sm:p-12"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white">
                <Check size={22} strokeWidth={3} />
              </span>
              <h3 className="mt-5 text-xl font-bold uppercase tracking-tight sm:text-2xl">
                You Helped Move This Mission Forward.
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-500">
                Thank you for standing with this mission. Your support helps keep the movement moving.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-10 max-w-xl rounded-2xl border border-neutral-200 p-5 sm:p-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="donate-amount" className="mb-1 block text-sm font-medium text-neutral-700">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-400">
                      Rp
                    </span>
                    <input
                      id="donate-amount"
                      type="number"
                      min={1000}
                      inputMode="numeric"
                      readOnly={selectedPreset !== CUSTOM_PRESET_VALUE}
                      value={
                        selectedPreset === CUSTOM_PRESET_VALUE
                          ? customAmount
                          : selectedPreset !== null
                            ? String(selectedPreset)
                            : ''
                      }
                      onChange={(event) => setCustomAmount(event.target.value)}
                      placeholder={selectedPreset === null ? 'Select an amount above' : 'Enter amount'}
                      aria-label="Support amount in Rupiah"
                      className="w-full rounded border border-neutral-300 py-2.5 pl-9 pr-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-black disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <Input
                  label="Your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
                <Input
                  label="Your email"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Your email"
                  autoComplete="email"
                />
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-sm text-neutral-600">
                <input
                  type="checkbox"
                  checked={showName}
                  onChange={(event) => setShowName(event.target.checked)}
                  className="mt-0.5 h-4 w-4 cursor-pointer rounded border-neutral-300 text-neutral-900 accent-neutral-900"
                />
                Show my name as a supporter.
              </label>
              {showName && !nameValid && (
                <p className="mt-2 text-xs font-medium text-red-500">
                  Your name is required to be shown as a supporter.
                </p>
              )}

              <Button
                type="submit"
                disabled={!formValid}
                className="mt-6 w-full rounded-full py-4 text-[11px] font-semibold uppercase tracking-[0.24em]"
              >
                Support This Mission
              </Button>
            </form>
          )}
        </section>

        {/* ─── WHERE YOUR SUPPORT GOES ──────────────────────────────────── */}
        <section className="mx-auto mt-14 max-w-5xl px-4 sm:mt-20 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
            Transparency
          </p>
          <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight sm:text-4xl">
            Where Your Support Goes
          </h2>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SUPPORT_AREAS.map((area) => {
              const AreaIcon = area.icon;
              return (
                <div key={area.id} className="rounded-2xl border border-neutral-200 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                    <AreaIcon size={18} strokeWidth={2} />
                  </span>
                  <h3 className="mt-4 text-sm font-bold uppercase tracking-tight">{area.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-500">{area.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── YOUR SUPPORT IN ACTION ───────────────────────────────────── */}
        <section className="mx-auto mt-14 max-w-5xl px-4 sm:mt-20 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
            Impact
          </p>
          <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight sm:text-4xl">
            Your Support In Action
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
            Documentation in progress. Every mission will be reported with verified numbers.
          </p>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {IMPACT_CARDS.map((card) => (
              <div key={card.label} className="group relative overflow-hidden rounded-2xl">
                <img
                  src={card.image}
                  alt={card.alt}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5"
                />
                <p className="absolute inset-x-0 bottom-0 p-4 text-sm font-bold uppercase tracking-[0.14em] text-white sm:text-base">
                  {card.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── WHO WE WORK WITH ─────────────────────────────────────────── */}
        <section className="mx-auto mt-14 max-w-5xl px-4 sm:mt-20 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
            Partners
          </p>
          <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight sm:text-4xl">
            Who We Work With
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
            Donations are distributed through trusted partners and documented after each mission.
          </p>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {['Partner', 'Partner', 'Partner'].map((partner, index) => (
              <div key={index} className="flex items-center gap-4 rounded-2xl border border-neutral-200 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold uppercase tracking-wide text-neutral-400">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-sm font-bold uppercase tracking-tight">{partner}</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                    {PARTNER_PLACEHOLDER_DESCRIPTION}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── TRANSPARENCY ─────────────────────────────────────────────── */}
        <section className="mx-auto mt-14 max-w-5xl px-4 sm:mt-20 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
            Transparency
          </p>
          <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight sm:text-4xl">Transparency</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
            You deserve to know where your support goes.
          </p>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {TRANSPARENCY_CARDS.map((card) => (
              <div key={card.label} className="rounded-2xl border border-neutral-200 p-5 text-center sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{card.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── COMPLETED MISSIONS ───────────────────────────────────────── */}
        <section className="mx-auto mt-14 max-w-5xl px-4 sm:mt-20 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
            History
          </p>
          <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight sm:text-4xl">
            Completed Missions
          </h2>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {COMPLETED_MISSIONS.map((mission) => (
              <Link
                key={mission.number}
                to={ROUTES.JOURNAL}
                aria-label={`${mission.number} — ${mission.title} — read the story`}
                className="group relative block overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
              >
                <img
                  src={mission.image}
                  alt={mission.alt}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                  Completed
                </span>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">
                    {mission.number}
                  </p>
                  <h3 className="mt-1 text-lg font-bold uppercase leading-tight tracking-tight sm:text-xl">
                    {mission.title}
                  </h3>
                  <span className="mt-3 inline-block rounded-full bg-white px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-900">
                    Read The Story
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── FINAL CTA ────────────────────────────────────────────────── */}
        <section className="mx-auto mt-16 max-w-5xl px-4 text-center sm:mt-24 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
            The Mission Doesn't Stop Here.
          </h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={ROUTES.MISSION}
              className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
            >
              Join The Mission
            </Link>
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-700 transition-colors hover:border-neutral-500 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
            >
              Back To Home
            </Link>
          </div>
        </section>
      </main>

      {/* Footer with bottom-nav clearance on mobile — same pattern as the
          approved Movement Homepage, Mission, and Journal pages. */}
      <div className="mt-16 bg-white pb-[72px] sm:mt-20 lg:pb-0">
        <HomepageFooter />
      </div>
    </div>
  );
}
