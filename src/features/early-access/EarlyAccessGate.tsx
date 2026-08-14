import { FormEvent, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../../components/shared';
import { ONEMISSION_LOGO_URL } from '../homepage/initialHomepageResources';
import { verifyEarlyAccessPassword } from '../../services/api/earlyAccessService';

interface EarlyAccessGateProps {
  chapter: string;
  onUnlocked: () => void;
}

export function EarlyAccessGate({ chapter, onUnlocked }: EarlyAccessGateProps) {
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Access password is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await verifyEarlyAccessPassword(password.trim());
      setPassword('');
      onUnlocked();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Access password is invalid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-neutral-950 px-5 text-white"
      style={{
        minHeight: '100dvh',
        paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
      }}
    >
      <section className="w-full max-w-sm text-center" aria-label="Early Access">
        <img src={ONEMISSION_LOGO_URL} alt="ONEMISSION" className="mx-auto h-auto w-[min(70vw,240px)]" draggable={false} />
        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/45">{chapter || 'CHAPTER 01'}</p>
        <h1 className="mt-3 text-[clamp(2rem,11vw,3.8rem)] font-semibold uppercase leading-none tracking-[-0.06em]">
          Early Access
        </h1>
        <p className="mx-auto mt-4 max-w-xs text-sm leading-7 text-white/55">
          Enter the chapter access password shared with registered subscribers.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-3 text-left">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50" htmlFor="early-access-password">
            Access Password
          </label>
          <input
            id="early-access-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-center text-base font-semibold tracking-[0.12em] text-white outline-none transition-colors placeholder:text-white/25 focus:border-white/60"
            placeholder="••••••••"
            autoComplete="one-time-code"
          />
          {errorMessage ? (
            <p className="m-0 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-100">
              {errorMessage}
            </p>
          ) : null}
          <Button type="submit" className="mt-2 h-12 gap-2 rounded-2xl" disabled={isSubmitting}>
            {isSubmitting ? 'Checking...' : 'Enter'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </section>
    </main>
  );
}
