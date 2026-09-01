import { Button } from './Button';

/**
 * Shared CMS-driven page states.
 *
 * The CMS/API is the single source of truth for movement content:
 *   loading → skeleton (never dummy content)
 *   success  → real data
 *   empty    → honest empty state
 *   error    → honest error state with retry
 */

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-neutral-100 ${className}`} />;
}

interface CmsStatePanelProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  minHeightClass?: string;
}

export function CmsStatePanel({
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
  minHeightClass = 'min-h-[60vh]',
}: CmsStatePanelProps) {
  return (
    <div
      className={`flex ${minHeightClass} flex-col items-center justify-center px-6 text-center font-['SF-Pro-Display',_sans-serif]`}
    >
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-400">{eyebrow}</p>
      )}
      <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight text-neutral-900 sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-500">{description}</p>
      )}
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onAction}
            className="rounded-full px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.24em]"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
