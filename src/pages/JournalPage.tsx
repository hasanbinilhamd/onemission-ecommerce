import { HomepageFooter } from '../features/footer';

/**
 * JournalPage — Phase 1 placeholder.
 * Editorial content (stories, athletes, community, philosophy, mission updates)
 * arrives in a later phase.
 */
export function JournalPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        fontFamily: "'SF-Pro-Display', sans-serif",
      }}
    >
      <main
        className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center"
        style={{ paddingTop: '96px', paddingBottom: '112px' }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
          One Mission
        </p>
        <h1 className="text-4xl font-bold uppercase tracking-[-0.04em] text-neutral-900 sm:text-6xl">
          Journal
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-neutral-500">
          Stories, athletes, and community updates are on their way. This page is a Phase 1 placeholder.
        </p>
      </main>
      <HomepageFooter />
    </div>
  );
}
