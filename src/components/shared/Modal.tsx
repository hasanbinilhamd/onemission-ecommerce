import { useId, type ReactNode } from 'react';
import { useFocusTrap, useKeyPress, useScrollLock } from '../../hooks';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  footer?: ReactNode;
  maxWidthClassName?: string;
}

export function Modal({
  open,
  onClose,
  children,
  title,
  footer,
  maxWidthClassName = 'max-w-md',
}: ModalProps) {
  const titleId = useId();
  const containerRef = useFocusTrap<HTMLDivElement>(open);

  useScrollLock(open);
  useKeyPress('Escape', onClose, open);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-4 sm:px-6 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={containerRef}
        tabIndex={-1}
        className={`relative z-10 flex max-h-[calc(100vh-2rem)] w-full min-w-0 flex-col overflow-hidden rounded-lg bg-white shadow-xl outline-none ${maxWidthClassName}`}
        style={{
          width: 'calc(100vw - 2rem)',
          maxHeight: 'calc(100dvh - 2rem)',
        }}
      >
        <div className="flex flex-shrink-0 items-start gap-4 border-b border-neutral-100 px-4 py-4 sm:px-6">
          {title ? (
            <h2 id={titleId} className="m-0 min-w-0 flex-1 break-words text-lg font-semibold leading-6 text-neutral-900">
              {title}
            </h2>
          ) : (
            <div className="min-w-0 flex-1" />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="-mr-2 -mt-2 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="4" y1="4" x2="14" y2="14" />
              <line x1="14" y1="4" x2="4" y2="14" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>

        {footer ? (
          <div
            className="flex flex-shrink-0 flex-col gap-3 border-t border-neutral-100 bg-white px-4 pb-4 pt-4 sm:flex-row sm:justify-end sm:px-6 [&>button]:w-full sm:[&>button]:w-auto"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
