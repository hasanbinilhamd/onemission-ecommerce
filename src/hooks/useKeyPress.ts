import { useEffect } from 'react';

/**
 * useKeyPress
 *
 * Calls `callback` whenever the specified `key` is pressed.
 * Only active when `enabled` is true (defaults to true).
 *
 * @example
 * useKeyPress('Escape', onClose, isOpen);
 */
export function useKeyPress(key: string, callback: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === key) callback();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, enabled]);
}
