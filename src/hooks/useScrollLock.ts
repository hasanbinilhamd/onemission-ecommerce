import { useEffect } from 'react';

/**
 * useScrollLock
 *
 * When `locked` is true:
 *   - Saves the current scroll position.
 *   - Freezes body scroll by fixing its position.
 *   - Restores the previous scroll position when `locked` becomes false.
 *
 * This approach avoids layout shift on scrollbar-visible browsers.
 */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    const scrollY = window.scrollY;
    const { style } = document.body;

    const prev = {
      overflow: style.overflow,
      position: style.position,
      top: style.top,
      width: style.width,
    };

    style.overflow = 'hidden';
    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.width = '100%';

    return () => {
      style.overflow = prev.overflow;
      style.position = prev.position;
      style.top = prev.top;
      style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}
