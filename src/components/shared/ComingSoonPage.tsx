import type { ReactNode } from 'react';

/**
 * ComingSoonPage — reusable editorial "section being prepared" state.
 *
 * A deliberate, premium One Mission state (NOT an error/maintenance page):
 * calm, minimal, editorial. Used by Mission, Impact, and Donate when the
 * CMS sets Page Availability = COMING_SOON.
 */

interface ComingSoonPageProps {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function ComingSoonPage({ eyebrow, title, description, children }: ComingSoonPageProps) {
  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif] text-neutral-900">
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-24 text-center sm:pt-28">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-500 sm:text-base">
            {description}
          </p>
        )}
        {children}
      </main>
    </div>
  );
}

/**
 * PageAvailabilityGate — reusable availability switch.
 *   AVAILABLE    → renders the actual page
 *   COMING_SOON  → renders the provided Coming Soon presentation
 */
export function PageAvailabilityGate({
  availability,
  comingSoon,
  children,
}: {
  availability: string | null | undefined;
  comingSoon: ReactNode;
  children: ReactNode;
}) {
  if (availability === 'COMING_SOON') {
    return <>{comingSoon}</>;
  }

  return <>{children}</>;
}
