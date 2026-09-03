import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import {
  Button,
  Input,
  SkeletonBlock,
  CmsStatePanel,
  ComingSoonPage,
} from "../components/shared";
import { HomepageFooter } from "../features/footer";
import { ROUTES } from "../app/config/routes";
import { openMidtransSnap } from "../services/payment/midtransSnap";
import {
  donationService,
  type DonatePayload,
  type DonateCampaignSummary,
} from "../services/api/donationService";
import { CUSTOM_AMOUNT_KEY, SUPPORT_PRESET_AMOUNTS } from "../features/donate";

/**
 * DonatePage — ONE active campaign + guest donation via the existing
 * Midtrans integration. The HQ Donate CMS is the single source of truth:
 *
 *   loading → skeleton
 *   success  → real CMS campaign (server-computed progress, PAID only)
 *   no active campaign → honest "NO ACTIVE CAMPAIGN" state (no CTA)
 *   error    → honest error state with retry
 *
 * No static campaign content, amounts, donors, or partners are ever
 * rendered as fallback data.
 */

type PresetSelection = number | typeof CUSTOM_AMOUNT_KEY;
type PaymentState = "idle" | "submitting" | "success" | "pending" | "failed";

export function formatRupiah(value: number): string {
  return `Rp${value.toLocaleString("id-ID")}`;
}

function formatPresetLabel(value: number): string {
  if (value >= 1_000_000) return `Rp${value / 1_000_000}Jt`;
  if (value >= 1_000) return `Rp${value / 1_000}K`;
  return `Rp${value}`;
}

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

type DonateState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; payload: DonatePayload };

function DonateSkeleton() {
  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif]">
      <main>
        <section className="min-h-[68vh] w-full bg-[#0A0A0A]">
          <div className="mx-auto flex min-h-[68vh] w-full max-w-5xl items-end px-4 pb-14 pt-24 sm:px-6 sm:pb-16 lg:px-8">
            <div className="w-full max-w-md">
              <SkeletonBlock className="h-3 w-28 bg-white/10" />
              <SkeletonBlock className="mt-4 h-12 w-4/5 bg-white/10" />
              <SkeletonBlock className="mt-3 h-12 w-3/5 bg-white/10" />
              <SkeletonBlock className="mt-5 h-4 w-full bg-white/10" />
            </div>
          </div>
        </section>
        <section className="mx-auto mt-12 max-w-5xl px-4 sm:mt-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            <SkeletonBlock className="aspect-[4/5] w-full rounded-2xl lg:h-full" />
            <div className="flex flex-col justify-center">
              <SkeletonBlock className="h-6 w-24 rounded-full" />
              <SkeletonBlock className="mt-4 h-10 w-4/5" />
              <SkeletonBlock className="mt-4 h-4 w-full max-w-md" />
              <SkeletonBlock className="mt-8 h-4 w-40" />
              <SkeletonBlock className="mt-3 h-8 w-64" />
              <SkeletonBlock className="mt-3 h-2 w-full" />
              <SkeletonBlock className="mt-10 h-14 w-full rounded-full sm:w-56" />
            </div>
          </div>
        </section>
      </main>
      <div className="mt-16 bg-white sm:mt-20">
        <HomepageFooter />
      </div>
    </div>
  );
}

export function DonatePage() {
  const [state, setState] = useState<DonateState>({ status: "loading" });
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetSelection | null>(
    null,
  );
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showName, setShowName] = useState(true);
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const paymentStateRef = useRef<PaymentState>("idle");

  const updatePaymentState = (next: PaymentState) => {
    paymentStateRef.current = next;
    setPaymentState(next);
  };

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const payload = await donationService.getDonate();
      setState({ status: "success", payload });
    } catch {
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const payload = state.status === "success" ? state.payload : null;
  const campaign: DonateCampaignSummary | null = payload?.campaign ?? null;
  const partners = payload?.partners ?? [];
  const highlights = payload?.highlights ?? [];
  const pastCampaigns = payload?.pastCampaigns ?? [];

  const resolvedAmount =
    selectedPreset !== null && selectedPreset !== CUSTOM_AMOUNT_KEY
      ? selectedPreset
      : Number(customAmount);

  const amountValid = Number.isFinite(resolvedAmount) && resolvedAmount >= 1000;
  const formValid = amountValid && paymentState !== "submitting";

  const openSupport = () => {
    setIsSupportOpen(true);
    window.requestAnimationFrame(() => {
      document
        .getElementById("donation-support")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handlePresetSelect = (value: PresetSelection) => {
    if (paymentState === "submitting") return;
    setSelectedPreset(value);
    updatePaymentState("idle");
    setPaymentError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formValid) return;

    updatePaymentState("submitting");
    setPaymentError(null);

    try {
      const result = await donationService.createDonation({
        amount: resolvedAmount,
        donorName: name.trim(),
        anonymous: !showName,
        donorEmail: email.trim(),
      });

      await openMidtransSnap({
        token: result.snapToken,
        onSuccess: () => {
          updatePaymentState("success");
          void load();
        },
        onPending: () => {
          updatePaymentState("pending");
        },
        onError: () => {
          updatePaymentState("failed");
          setPaymentError("Payment was not completed. Please try again.");
        },
        onClose: () => {
          if (paymentStateRef.current !== "success") {
            updatePaymentState("failed");
            setPaymentError("Payment was not completed. Please try again.");
          }
        },
      });
    } catch (error) {
      updatePaymentState("failed");
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Your donation could not be created. Please try again.",
      );
    }
  };

  if (state.status === "loading") {
    return <DonateSkeleton />;
  }

  if (state.status === "error") {
    return (
      <div className="min-h-screen bg-white">
        <div className="pt-16">
          <CmsStatePanel
            eyebrow="One Mission"
            title="Unable to load donations."
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

  // Page-level CMS availability — independent from campaign status.
  if (payload?.pageAvailability === "COMING_SOON") {
    return (
      <div className="min-h-screen bg-white">
        <ComingSoonPage
          eyebrow="Donate"
          title="Something Worth Giving For."
          description="We're preparing the next opportunity to give with purpose."
        />
        <div className="bg-white">
          <HomepageFooter />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-white">
        <div className="pt-16">
          <CmsStatePanel
            eyebrow="One Mission"
            title="No Active Campaign"
            description="Donations will open here when the next campaign goes live."
          />
        </div>
        <div className="bg-white">
          <HomepageFooter />
        </div>
      </div>
    );
  }

  const remaining = Math.max(0, campaign.targetAmount - campaign.raised);

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

        {/* ─── CURRENT CAMPAIGN (ONE active campaign only) ─────────────── */}
        <section className="mx-auto mt-12 max-w-5xl px-4 sm:mt-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="overflow-hidden rounded-2xl">
              {campaign.coverImage ? (
                <img
                  src={campaign.coverImage}
                  alt={campaign.title}
                  className="aspect-[4/5] w-full object-cover lg:h-full"
                />
              ) : (
                <div className="aspect-[4/5] w-full bg-neutral-100 lg:h-full" />
              )}
            </div>

            <div className="flex flex-col justify-center">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-neutral-900 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-white"
                />
                {campaign.status === "CLOSED" ? "CLOSED" : "ACTIVE"}
              </span>
              <h2 className="mt-4 text-3xl font-bold uppercase leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {campaign.title}
              </h2>
              {campaign.shortDescription && (
                <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500 sm:text-base">
                  {campaign.shortDescription}
                </p>
              )}

              {/* ─── PROGRESS (computed from PAID donations) ─────────── */}
              <div className="mt-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
                  Progress Collected
                </p>
                <p className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                  {formatRupiah(campaign.raised)}
                </p>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-medium text-neutral-400">
                    of {formatRupiah(campaign.targetAmount)}
                  </span>
                  <div className="mt-1.5 text-sm font-bold text-neutral-900">
                    {campaign.progressPercent}%
                  </div>
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

                <div className="mt-7 grid grid-cols-2 divide-x divide-neutral-200">
                  <div className="pr-3 text-center">
                    <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {campaign.donorCount.toLocaleString("id-ID")}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                      Donors
                    </p>
                  </div>
                  <div className="pl-3 text-center">
                    <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {formatRupiah(remaining)}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                      Remaining
                    </p>
                  </div>
                </div>
              </div>

              {/* ─── OUR PARTNERS ────────────────────────────────────── */}
              {partners.length > 0 && (
                <div className="mt-8 border-t border-neutral-200 pt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
                    Our Partners
                  </p>
                  {partners.map((partner) => (
                    <div key={partner.id} className="mt-2">
                      <p className="text-lg font-bold uppercase tracking-tight">
                        {partner.name}
                        {partner.tagline ? (
                          <span className="ml-2 text-sm font-medium normal-case tracking-normal text-neutral-500">
                            {partner.tagline}
                          </span>
                        ) : null}
                      </p>
                      {partner.statement && (
                        <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                          {partner.statement}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ─── ONE CLEAR CTA ────────────────────────────────────── */}
              {campaign.status !== "CLOSED" && (
                <Button
                  type="button"
                  onClick={openSupport}
                  className="mt-8 w-full rounded-full py-4 text-[11px] font-semibold uppercase tracking-[0.24em] sm:w-auto sm:px-12"
                >
                  Donate Now
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* ─── SUPPORT INTERACTION (hidden until Donate Now) ────────────── */}
        {isSupportOpen && campaign.status !== "CLOSED" && (
          <section
            id="donation-support"
            aria-label="Donation support"
            className="mx-auto mt-14 max-w-5xl scroll-mt-20 px-4 sm:mt-20 sm:px-6 lg:px-8"
          >
            {paymentState === "success" || paymentState === "pending" ? (
              <div
                role="status"
                aria-live="polite"
                className="rounded-2xl bg-neutral-50 p-8 text-center sm:p-12"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white">
                  <Check size={22} strokeWidth={3} />
                </span>
                <h3 className="mt-5 text-xl font-bold uppercase tracking-tight sm:text-2xl">
                  {paymentState === "success"
                    ? "You Helped Move This Forward."
                    : "Your Donation Is Being Processed."}
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-500">
                  {paymentState === "success"
                    ? "Thank you for supporting this cause."
                    : "Your payment is pending confirmation. The donation will be counted once payment is verified."}
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
                          "rounded-full border px-4 py-3.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
                          isSelected
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:text-neutral-900",
                        ].join(" ")}
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
                      "rounded-full border px-4 py-3.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
                      selectedPreset === CUSTOM_AMOUNT_KEY
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:text-neutral-900",
                    ].join(" ")}
                  >
                    Custom
                  </button>
                </div>

                {selectedPreset === CUSTOM_AMOUNT_KEY && (
                  <div className="mt-5 max-w-xs">
                    <label
                      htmlFor="donate-custom-amount"
                      className="mb-1 block text-sm font-medium text-neutral-700"
                    >
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
                        onChange={(event) =>
                          setCustomAmount(event.target.value)
                        }
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
                      label="Your name (optional)"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                    />
                    <Input
                      label="Your email (optional)"
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
                  <p className="mt-1 text-xs text-neutral-400">
                    Unchecked — your donation appears as Anonymous. No login
                    required.
                  </p>

                  {paymentError && (
                    <p
                      className="mt-3 text-sm font-medium text-red-600"
                      role="alert"
                    >
                      {paymentError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={!formValid}
                    className="mt-6 w-full rounded-full py-4 text-[11px] font-semibold uppercase tracking-[0.24em]"
                  >
                    {paymentState === "submitting"
                      ? "Opening Payment…"
                      : "Support This Mission"}
                  </Button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* ─── DONATION HIGHLIGHTS (real paid donations only) ──────────── */}
        {highlights.length > 0 && (
          <section className="mx-auto mt-14 max-w-5xl px-4 sm:mt-20 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-neutral-200 p-5 sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
                Recent Support
              </p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {highlights.map((donation) => (
                  <div
                    key={donation.id}
                    className="rounded-xl bg-neutral-50 p-4"
                  >
                    <p className="truncate text-sm font-bold text-neutral-900">
                      {donation.donorName}
                    </p>
                    <p className="mt-1 text-sm font-bold text-neutral-900">
                      {formatRupiah(donation.amount)}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                      {formatRelativeTime(donation.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
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
              <ArrowRight
                size={20}
                className="text-neutral-900 transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              to={`/donate/${campaign.id}/updates`}
              className="flex items-center justify-between py-6 border-b border-neutral-200 group hover:opacity-75 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <h3 className="text-lg font-bold uppercase tracking-tight sm:text-xl">
                Kabar Terbaru
              </h3>
              <ArrowRight
                size={20}
                className="text-neutral-900 transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              to={`/donate/${campaign.id}/disbursements`}
              className="flex items-center justify-between py-6 border-b border-neutral-200 group hover:opacity-75 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <h3 className="text-lg font-bold uppercase tracking-tight sm:text-xl">
                Pencairan Dana
              </h3>
              <ArrowRight
                size={20}
                className="text-neutral-900 transition-transform group-hover:translate-x-1"
              />
            </Link>

            <div className="py-6 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex-1">
                <Link
                  to={`/donate/${campaign.id}/donors`}
                  className="group inline-flex items-center justify-between w-full sm:w-auto sm:gap-4 hover:opacity-75 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                >
                  <h3 className="text-lg font-bold uppercase tracking-tight sm:text-xl">
                    Donasi
                  </h3>
                  <ArrowRight
                    size={20}
                    className="text-neutral-900 sm:hidden transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <p className="mt-2 text-sm text-neutral-500 font-medium">
                  {campaign.donorCount.toLocaleString("id-ID")} PEOPLE HAVE
                  SUPPORTED THIS MISSION.
                </p>
                <div className="pt-2">
                  <Link
                    to={`/donate/${campaign.id}/donors`}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-900 hover:opacity-75 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                  >
                    Lihat Semua Donasi{" "}
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
              <Link
                to={`/donate/${campaign.id}/donors`}
                className="hidden sm:inline-block group p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded"
              >
                <ArrowRight
                  size={20}
                  className="text-neutral-900 transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── PAST CAMPAIGNS (history, not donation choices) ──────────── */}
        {pastCampaigns.length > 0 && (
          <section className="mx-auto mt-14 max-w-5xl px-4 sm:mt-20 sm:px-6 lg:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
              Past Campaigns
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {pastCampaigns.map((past) => (
                <Link
                  key={past.id}
                  to={`/donate/campaigns/${past.slug}`}
                  aria-label={`${past.title} — view story`}
                  className="group relative block overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                >
                  {past.coverImage ? (
                    <img
                      src={past.coverImage}
                      alt={past.title}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="aspect-[4/3] w-full bg-neutral-100" />
                  )}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                    Closed
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <h3 className="text-lg font-bold uppercase leading-tight tracking-tight sm:text-xl">
                      {past.title}
                    </h3>
                    <p className="mt-1 text-xs text-white/75">
                      {formatRupiah(past.raised)} raised
                    </p>
                    <span className="mt-3 inline-block rounded-full bg-white px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-900">
                      View Story
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

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
          approved Movement pages. */}
      <div className="mt-16 bg-white sm:mt-20">
        <HomepageFooter />
      </div>
    </div>
  );
}
