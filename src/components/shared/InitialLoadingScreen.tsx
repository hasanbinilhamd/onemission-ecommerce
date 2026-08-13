import { useEffect, useRef, useState } from 'react';

function getInitialReadinessPromise(): Promise<unknown> {
  const nextPaint = new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  const fontsReady = typeof document !== 'undefined' && 'fonts' in document
    ? document.fonts.ready.catch(() => undefined)
    : Promise.resolve();

  return Promise.all([nextPaint, fontsReady]);
}

export function InitialLoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const readyRef = useRef(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    let currentProgress = 0;
    const startedAt = performance.now();

    void getInitialReadinessPromise().then(() => {
      if (!mounted) return;
      readyRef.current = true;
    });

    const animate = (timestamp: number) => {
      if (!mounted) return;

      const elapsed = Math.max(0, timestamp - startedAt);
      const boundedTarget = Math.min(92, 16 + (1 - Math.exp(-elapsed / 720)) * 76);
      const target = readyRef.current ? 100 : boundedTarget;
      const smoothing = readyRef.current ? 0.34 : 0.08;

      currentProgress += (target - currentProgress) * smoothing;

      if (readyRef.current && currentProgress >= 99.35) {
        currentProgress = 100;
        setProgress(100);
        setIsExiting(true);
        return;
      }

      setProgress((previous) => Math.max(previous, Math.min(99, Math.floor(currentProgress))));
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      mounted = false;
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  if (isHidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-950 px-6 text-white transition-opacity duration-[420ms] ease-out motion-reduce:duration-[1ms] ${isExiting ? 'opacity-0' : 'opacity-100'}`}
      style={{
        minHeight: '100vh',
        height: '100dvh',
        paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading OneMission experience"
      onTransitionEnd={() => {
        if (isExiting) setIsHidden(true);
      }}
    >
      <div className="w-full max-w-[360px] text-center">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.36em] text-white/55">
          One Mission
        </p>
        <h1 className="mt-4 text-[clamp(2.35rem,12vw,4.5rem)] font-semibold leading-none tracking-[-0.07em] text-white">
          ONEMISSION
        </h1>
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.22em] text-white/45">
          Preparing your experience
        </p>

        <div className="mt-10" aria-hidden="true">
          <div className="h-[3px] overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-150 ease-out motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
            <span>Loading</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
