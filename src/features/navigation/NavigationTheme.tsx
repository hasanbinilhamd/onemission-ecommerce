import { createContext, useContext, useMemo, type ReactNode } from 'react';

export type NavigationTheme = 'light' | 'dark';

interface NavigationThemeValue {
  theme: NavigationTheme;
  colors: {
    foreground: string;
    muted: string;
    badgeBorder: string;
  };
}

const NAVIGATION_THEME_TOKENS: Record<NavigationTheme, NavigationThemeValue['colors']> = {
  light: {
    foreground: '#FFFFFF',
    muted: 'rgba(255,255,255,0.92)',
    badgeBorder: '#FFFFFF',
  },
  dark: {
    foreground: '#111827',
    muted: '#374151',
    badgeBorder: '#FFFFFF',
  },
};

const NavigationThemeContext = createContext<NavigationThemeValue | null>(null);

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

export function useNavigationTheme(): NavigationThemeValue {
  const context = useContext(NavigationThemeContext);
  if (!context) {
    throw new Error('useNavigationTheme must be used within a NavigationThemeProvider');
  }
  return context;
}
