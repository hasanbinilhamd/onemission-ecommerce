import { HomepageFooter } from '../features/footer';

/**
 * HomePage — Phase 1 placeholder for the future Movement Homepage.
 * The ecommerce shopping experience has been moved to /shop.
 */
export function HomePage() {
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
          Movement Home
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-neutral-500">
          The new movement experience is on its way. This page is a Phase 1 placeholder.
        </p>
      </main>
      <HomepageFooter />
    </div>
  );
}
