import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { Button, Input } from '../components/shared';
import { HomepageFooter } from '../features/footer';
import { ROUTES } from '../app/config/routes';
import {
  ACTIVE_CAMPAIGN,
  CUSTOM_AMOUNT_KEY,
  SUPPORT_PRESET_AMOUNTS,
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

export function formatRupiah(value: number): string {
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

  // Recent 5 donors newest first
  const recentDonors = [...campaign.donorsList].sort((a, b) => b.dateTimestamp - a.dateTimestamp).slice(0, 5);

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
                  <span className="font-medium text-neutral-400"> of {formatRupiah(campaign.target)}</span>
                </p>
                <div
                  role="progressbar"
                  aria-valuenow={campaign.progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Campaign progress — ${campaign.progressPercent} percent`}
                  className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100"
                >
                  <div
                    className="h-full rounded-full bg-neutral-900"
                    style={{ width: `${campaign.progressPercent}%` }}
                  />
                </div>
                <div className="mt-1.5 text-sm font-bold text-neutral-900">{campaign.progressPercent}%</div>

                <div className="mt-7 grid grid-cols-3 divide-x divide-neutral-200">
                  <div className="pr-3">
                    <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {campaign.donors.toLocaleString('id-ID')}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                      Donors
                    </p>
                  </div>
                  <div className="px-3 sm:px-5">
                    <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {campaign.beneficiaries.toLocaleString('id-ID')}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                      Beneficiaries
                    </p>
                  </div>
                  <div className="pl-3 sm:pl-5">
                    <p className="text-2xl font-bold tracking-tight sm:text-3xl">{campaign.daysLeft}</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                      Days Left
                    </p>
                  </div>
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
        </section>

        {/* ─── SUPPORT INTERACTION (hidden until Donate Now) ────────────── */}
        {isSupportOpen && (
          <section
            id="donation-support"
            aria-label="Donation support"
            className="mx-auto mt-14 max-w-5xl scroll-mt-20 px-4 sm:mt-20 sm:px-6 lg:px-8"
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

        {/* ─── NAVIGATION LINKS TO DETAILS ─────────────────────────────── */}
        <section className="mx-auto mt-14 max-w-5xl px-4 sm:mt-20 sm:px-6 lg:px-8">
          <div className="flex flex-col border-t border-neutral-200">
            <Link 
              to={`/donate/${campaign.id}/story`}
              className="flex items-center justify-between py-6 border-b border-neutral-200 group hover:opacity-75 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <h3 className="text-lg font-bold uppercase tracking-tight sm:text-xl">
                Cerita Penggalangan Dana
              </h3>
              <ArrowRight size={20} className="text-neutral-900 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link 
              to={`/donate/${campaign.id}/updates`}
              className="flex items-center justify-between py-6 border-b border-neutral-200 group hover:opacity-75 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <h3 className="text-lg font-bold uppercase tracking-tight sm:text-xl">
                Kabar Terbaru
              </h3>
              <ArrowRight size={20} className="text-neutral-900 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link 
              to={`/donate/${campaign.id}/disbursements`}
              className="flex items-center justify-between py-6 border-b border-neutral-200 group hover:opacity-75 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <h3 className="text-lg font-bold uppercase tracking-tight sm:text-xl">
                Pencairan Dana
              </h3>
              <ArrowRight size={20} className="text-neutral-900 transition-transform group-hover:translate-x-1" />
            </Link>

            <div className="py-6 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex-1">
                <Link to={`/donate/${campaign.id}/donors`} className="group inline-flex items-center justify-between w-full sm:w-auto sm:gap-4 hover:opacity-75 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900">
                  <h3 className="text-lg font-bold uppercase tracking-tight sm:text-xl">
                    Donasi
                  </h3>
                  <ArrowRight size={20} className="text-neutral-900 sm:hidden transition-transform group-hover:translate-x-1" />
                </Link>
                <p className="mt-2 text-sm text-neutral-500 font-medium">
                  {campaign.donors.toLocaleString('id-ID')} PEOPLE HAVE SUPPORTED THIS MISSION.
                </p>
                
                <div className="mt-6 space-y-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    Donasi Terbaru
                  </p>
                  
                  <div className="space-y-4">
                    {recentDonors.map((donor) => (
                      <div key={donor.id} className="flex justify-between items-start gap-4 text-sm">
                        <div className="flex-1">
                          <p className="font-bold text-neutral-900">{donor.name}</p>
                          <p className="text-neutral-500 text-xs mt-0.5">{donor.timeAgo}</p>
                        </div>
                        <p className="font-bold text-neutral-900 shrink-0">
                          {formatRupiah(donor.amount)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/donate/${campaign.id}/donors`}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-900 hover:opacity-75 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                    >
                      Lihat Semua Donasi <ArrowRight size={14} strokeWidth={2.5} />
                    </Link>
                  </div>
                </div>
              </div>
              <Link to={`/donate/${campaign.id}/donors`} className="hidden sm:inline-block group p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded">
                <ArrowRight size={20} className="text-neutral-900 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
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
