import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button, Input } from '../components/shared';
import { HomepageFooter } from '../features/footer';
import { ROUTES } from '../app/config/routes';
import {
  ACTIVE_CAMPAIGN,
  CUSTOM_AMOUNT_KEY,
  SUPPORT_PRESET_AMOUNTS,
  SUPPORT_AREAS,
  IMPACT_CARDS,
  TRANSPARENCY_STATS,
  COMPLETED_CAMPAIGNS,
} from '../features/donate';

/**
 * DonatePage — Phase 5.1 revision: campaign-first, support on demand.
 *
 * Experience: SEE → UNDERSTAND → TRUST → DECIDE → DONATE.
 * The donation form is NOT visible on initial load — it appears only after
 * the user intentionally clicks DONATE NOW. No payment gateway: submission
 * shows a frontend confirmation only, and never claims money was transferred.
 *
 * Follows the approved Home/Mission/Journal design language. All human
 * imagery is full-silhouette composition — no visible faces or eyes.
 * Numbers are static MVP presentation data.
 */

type PresetSelection = number | typeof CUSTOM_AMOUNT_KEY;

function formatRupiah(value: number): string {
  return `Rp${value.toLocaleString('id-ID')}`;
}

function formatPresetLabel(value: number): string {
  if (value >= 1_000_000) return `Rp${value / 1_000_000}Jt`;
  if (value >= 1_000) return `Rp${value / 1_000}K`;
  return `Rp${value}`;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function DonatePage() {
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetSelection | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showName, setShowName] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resolvedAmount =
    selectedPreset !== null && selectedPreset !== CUSTOM_AMOUNT_KEY
      ? selectedPreset
      : Number(customAmount);

  const amountValid = Number.isFinite(resolvedAmount) && resolvedAmount > 0;
  const nameValid = !showName || name.trim().length > 0;
  const emailValid = isValidEmail(email);
  const formValid = amountValid && nameValid && emailValid && !isSubmitted;

  const openSupport = () => {
    setIsSupportOpen(true);
    window.requestAnimationFrame(() => {
      document.getElementById('donation-support')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handlePresetSelect = (value: PresetSelection) => {
    if (isSubmitted) return;
    setSelectedPreset(value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formValid) return;
    setIsSubmitted(true);
  };

  const campaign = ACTIVE_CAMPAIGN;

  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif] text-neutral-900">
      <main>
        {/* ─── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative flex min-h-[68vh] items-end overflow-hidden bg-[#0A0A0A]">
          <img
            src="/images/donate/donate-hero.jpg"
            alt="Silhouettes of Muslim athletes walking together toward the sunrise."
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-[#0A0A0A]/20"
          />
          <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-14 pt-24 text-white sm:px-6 sm:pb-16 lg:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/60">
              Donate Now
            </p>
            <h1 className="mt-4 text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Your Support,
              <span className="block">Their Hope.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
              Together, we can reach more people in need.
            </p>
          </div>
        </section>

        {/* ─── CURRENT CAMPAIGN ─────────────────────────────────────────── */}
        <section className="mx-auto mt-12 max-w-5xl px-4 sm:mt-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="overflow-hidden rounded-2xl">
              <img
                src={campaign.image}
                alt={campaign.imageAlt}
                className="aspect-[4/5] w-full object-cover lg:h-full"
              />
            </div>

            <div className="flex flex-col justify-center">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-neutral-900 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-white" />
                {campaign.statusLabel}
              </span>
              <h2 className="mt-4 text-3xl font-bold uppercase leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {campaign.title}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500 sm:text-base">
                {campaign.description}
              </p>

              {/* ─── PROGRESS ─────────────────────────────────────────── */}
              <div className="mt-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
                  Progress Collected
                </p>
                <p className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                  {formatRupiah(campaign.raised)}
                  
                </p>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-medium text-neutral-400">
                    of {formatRupiah(campaign.target)}
                  </span>
                  <div className="mt-1.5 text-sm font-bold text-neutral-900">{campaign.progressPercent}%</div>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={campaign.progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Campaign progress — ${campaign.progressPercent} percent`}
                  className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-100"
                >
                  <div
                    className="h-full rounded-full bg-neutral-900"
                    style={{ width: `${campaign.progressPercent}%` }}
                  />
                </div>

                <div className="mt-7 grid grid-cols-3 divide-neutral-200">
                  <div className="pr-3 text-center">
                    <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {campaign.donors.toLocaleString('id-ID')}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                      Donors
                    </p>
                  </div>
                  <div className="px-0 sm:px-5 text-center">
                    <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {campaign.beneficiaries.toLocaleString('id-ID')}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                      Beneficiaries
                    </p>
                  </div>
                  <div className="pl-3 sm:pl-5 text-center">
                    <p className="text-2xl font-bold tracking-tight sm:text-3xl">{campaign.daysLeft}</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                      Days Left
                    </p>
                  </div>
                </div>
              </div>

              {/* ─── ONE CLEAR CTA ────────────────────────────────────── */}
              <Button
                type="button"
                onClick={openSupport}
                className="mt-8 w-full rounded-full py-4 text-[11px] font-semibold uppercase tracking-[0.24em] sm:w-auto sm:px-12"
              >
                Donate Now
              </Button>
            </div>
          </div>

          {/* ─── PARTNER / TRUST ──────────────────────────────────── */}
          <div className="mt-8 border-t border-neutral-200 pt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
              Our Partner
            </p>
            <p className="mt-1.5 text-lg font-bold uppercase tracking-tight">
              {campaign.partner.name}
            </p>
            <p className="mt-0.5 text-sm font-medium text-neutral-500">
              {campaign.partner.tagline}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              {campaign.partner.statement}
            </p>
          </div>
        </section>


        {/* ─── SUPPORT INTERACTION (hidden until Donate Now) ────────────── */}
        {isSupportOpen && (
          <section
            id="donation-support"
            aria-label="Donation support"
            className="mx-auto mt-10 max-w-5xl scroll-mt-20 px-4 sm:mt-20 sm:px-6 lg:px-8"
          >
            {isSubmitted ? (
              <div
                role="status"
                aria-live="polite"
                className="rounded-2xl bg-neutral-50 p-8 text-center sm:p-12"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white">
                  <Check size={22} strokeWidth={3} />
                </span>
                <h3 className="mt-5 text-xl font-bold uppercase tracking-tight sm:text-2xl">
                  You Helped Move This Forward.
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-500">
                  Thank you for supporting this cause.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
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
                  {SUPPORT_PRESET_AMOUNTS.map((amount) => {
                    const isSelected = selectedPreset === amount;
                    return (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => handlePresetSelect(amount)}
                        aria-pressed={isSelected}
                        className={[
                          'rounded-full border px-4 py-3.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2',
                          isSelected
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:text-neutral-900',
                        ].join(' ')}
                      >
                        {formatPresetLabel(amount)}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => handlePresetSelect(CUSTOM_AMOUNT_KEY)}
                    aria-pressed={selectedPreset === CUSTOM_AMOUNT_KEY}
                    className={[
                      'rounded-full border px-4 py-3.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2',
                      selectedPreset === CUSTOM_AMOUNT_KEY
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:text-neutral-900',
                    ].join(' ')}
                  >
                    Custom
                  </button>
                </div>

                {selectedPreset === CUSTOM_AMOUNT_KEY && (
                  <div className="mt-5 max-w-xs">
                    <label htmlFor="donate-custom-amount" className="mb-1 block text-sm font-medium text-neutral-700">
                      Custom amount
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-400">
                        Rp
                      </span>
                      <input
                        id="donate-custom-amount"
                        type="number"
                        min={1000}
                        inputMode="numeric"
                        value={customAmount}
                        onChange={(event) => setCustomAmount(event.target.value)}
                        placeholder="Enter amount"
                        aria-label="Custom support amount in Rupiah"
                        className="w-full rounded border border-neutral-300 py-2.5 pl-9 pr-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-7 max-w-xl">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                      className="mt-0.5 h-4 w-4 cursor-pointer rounded border-neutral-300 accent-neutral-900"
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
                </div>
              </form>
            )}
          </section>
        )}

        {/* ─── WHERE YOUR SUPPORT GOES ──────────────────────────────────── */}
        <section className="mx-auto mt-12 max-w-5xl px-4 sm:mt-20 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
            Transparency
          </p>
          <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight sm:text-4xl">
            Where Your Support Goes
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {SUPPORT_AREAS.map((area) => {
              const AreaIcon = area.icon;
              return (
                <div key={area.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                    <AreaIcon size={18} strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-tight">{area.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-500">{area.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── YOUR SUPPORT IN ACTION ───────────────────────────────────── */}
        <section className="mx-auto mt-12 max-w-5xl px-4 sm:mt-20 sm:px-6 lg:px-8">
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

        {/* ─── TRANSPARENCY ─────────────────────────────────────────────── */}
        <section className="mx-auto mt-14 max-w-5xl px-4 sm:mt-20 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
            Transparency
          </p>
          <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight sm:text-4xl">Transparency</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
            You deserve to know where your support goes.
          </p>

          <div className="mt-8 grid grid-cols-1 divide-y divide-neutral-200 border-y border-neutral-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {TRANSPARENCY_STATS.map((stat) => (
              <div key={stat.label} className="py-6 sm:px-6 sm:py-8 sm:text-center sm:first:pl-0 sm:last:pr-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{stat.value}</p>
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
            {COMPLETED_CAMPAIGNS.map((mission) => (
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
                  <p className="mt-1 text-xs leading-relaxed text-white/75">{mission.description}</p>
                  <span className="mt-3 inline-block rounded-full bg-white px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-900">
                    Read Story
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
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
            Every contribution helps the next mission move forward.
          </p>
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
