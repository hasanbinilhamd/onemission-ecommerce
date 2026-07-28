import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

type ScrollPosition = {
  x: number;
  y: number;
};

export function RouteScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollPositionsRef = useRef<Record<string, ScrollPosition>>({});
  const previousKeyRef = useRef(location.key);
  const previousPathnameRef = useRef(location.pathname);

  useEffect(() => {
    if (typeof window === 'undefined' || !('scrollRestoration' in window.history)) {
      return undefined;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const previousKey = previousKeyRef.current;
    scrollPositionsRef.current[previousKey] = {
      x: window.scrollX,
      y: window.scrollY,
    };

    const shouldPreserveHomeRestore = Boolean(
      (location.state as { restoreCatalog?: boolean } | null | undefined)?.restoreCatalog,
    );

    if (navigationType === 'POP') {
      const storedPosition = scrollPositionsRef.current[location.key];
      if (storedPosition) {
        window.scrollTo({
          left: storedPosition.x,
          top: storedPosition.y,
          behavior: 'auto',
        });
      } else {
        window.scrollTo({
          left: window.scrollX,
          top: 0,
          behavior: 'auto',
        });
      }
    } else if (previousPathnameRef.current !== location.pathname && !shouldPreserveHomeRestore) {
      window.scrollTo({
        left: window.scrollX,
        top: 0,
        behavior: 'auto',
      });
    }

    previousKeyRef.current = location.key;
    previousPathnameRef.current = location.pathname;
  }, [location.key, location.pathname, location.state, navigationType]);

  return null;
}
