// ─── Shared custom React hooks ────────────────────────────────────────────────

import { useState, useEffect } from 'react';

// ─── Inline utility hooks ─────────────────────────────────────────────────────

/** Debounce a rapidly-changing value (e.g. search input). */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/** Track whether the viewport matches a CSS media query. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Simple boolean toggle. */
export function useToggle(initial = false): [boolean, () => void] {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue((v) => !v);
  return [value, toggle];
}

// ─── Motion / Navigation hooks ────────────────────────────────────────────────

export { useFocusTrap } from './useFocusTrap';
export { useScrollLock } from './useScrollLock';
export { useKeyPress } from './useKeyPress';
