import { useEffect, useState } from 'react';
import { ONEMISSION_LOGO_URL, prepareInitialApplicationExperience } from '../../features/homepage/initialHomepageResources';

export function InitialLoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let mounted = true;

    const updateProgress = (_stage: string, value: number) => {
      if (!mounted) return;
      setProgress((current) => Math.max(current, Math.min(100, Math.floor(value))));
    };

    void prepareInitialApplicationExperience(updateProgress)
      .catch(() => {
        updateProgress('ready', 100);
      })
      .finally(() => {
        if (!mounted) return;
        setProgress(100);
        setIsExiting(true);

        if (typeof performance !== 'undefined' && typeof performance.mark === 'function') {
          performance.mark('om_homepage_reveal_ready');
        }
      });

    return () => {
      mounted = false;
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
        {/* <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.36em] text-white/55">
          One Mission
        </p> */}
        <img
          src={ONEMISSION_LOGO_URL}
          alt="ONEMISSION"
          className="mx-auto mt-5 h-auto w-[min(72vw,260px)]"
          draggable={false}
        />
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.22em] text-white/45">
          Preparing your experience
        </p>

        <div className="mt-10" aria-hidden="true">
          <div className="h-[3px] overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-300 ease-out motion-reduce:transition-none"
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
