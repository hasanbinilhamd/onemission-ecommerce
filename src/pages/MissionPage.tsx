import { HomepageFooter } from '../features/footer';

/**
 * MissionPage — Phase 1 placeholder.
 * Final movement content (mission, vote, mission board, real impact)
 * arrives in a later phase.
 */
export function MissionPage() {
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
          Mission
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-neutral-500">
          The movement experience is on its way. This page is a Phase 1 placeholder.
        </p>
      </main>
      <HomepageFooter />
    </div>
  );
}
