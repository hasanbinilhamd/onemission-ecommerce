import { createContext, useContext } from 'react';

export type NavigationTheme = 'light' | 'dark';

export interface NavigationThemeValue {
  theme: NavigationTheme;
  colors: {
    foreground: string;
    muted: string;
    badgeBorder: string;
    surfaceBackground: string;
    surfaceBorder: string;
    surfaceShadow: string;
  };
}

export const NavigationThemeContext = createContext<NavigationThemeValue | null>(null);

export function useNavigationTheme(): NavigationThemeValue {
  const context = useContext(NavigationThemeContext);
  if (!context) {
    throw new Error('useNavigationTheme must be used within a NavigationThemeProvider');
  }
  return context;
}
