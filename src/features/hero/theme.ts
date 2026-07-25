export type HeroTheme = {
  title: string;
  accentColor: string;
};

export const HERO_GRADIENT_TOP = '#0A0A0A' as const;
export const HERO_GRADIENT_MIDDLE = '#536878' as const;
export const HERO_GRADIENT_BOTTOM = '#E5E4E2' as const;

export function createHeroGradient(accentColor: string): string {
  return `linear-gradient(180deg, ${HERO_GRADIENT_TOP} 0%, ${HERO_GRADIENT_MIDDLE} 52%, ${HERO_GRADIENT_BOTTOM} 100%)`;
}

export const HERO_THEMES: readonly HeroTheme[] = [
  { title: 'Theme 1', accentColor: '#536878' },
  { title: 'Theme 2', accentColor: '#53785B' },
  { title: 'Theme 3', accentColor: '#785353' },
  { title: 'Theme 4', accentColor: '#787053' },
] as const;
