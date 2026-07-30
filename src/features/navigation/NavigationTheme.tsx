import { useMemo, type ReactNode } from 'react';
import {
  NavigationThemeContext,
  type NavigationTheme,
  type NavigationThemeValue,
} from './NavigationThemeContext';

const NAVIGATION_THEME_TOKENS: Record<NavigationTheme, NavigationThemeValue['colors']> = {
  light: {
    foreground: '#FFFFFF',
    muted: 'rgba(255,255,255,0.92)',
    badgeBorder: '#FFFFFF',
    surfaceBackground: 'transparent',
    surfaceBorder: 'transparent',
    surfaceShadow: 'none',
  },
  dark: {
    foreground: '#111827',
    muted: 'rgba(17,24,39,0.70)',
    badgeBorder: '#FFFFFF',
    surfaceBackground: '#FFFFFF',
    surfaceBorder: 'rgba(17,24,39,0.06)',
    surfaceShadow: '0 1px 8px rgba(15,23,42,0.04)',
  },
};

export function NavigationThemeProvider({
  theme,
  children,
}: {
  theme: NavigationTheme;
  children: ReactNode;
}) {
  const value = useMemo<NavigationThemeValue>(() => ({
    theme,
    colors: NAVIGATION_THEME_TOKENS[theme],
  }), [theme]);

  return (
    <NavigationThemeContext.Provider value={value}>
      {children}
    </NavigationThemeContext.Provider>
  );
}
