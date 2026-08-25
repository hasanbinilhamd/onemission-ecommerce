import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../app/config/routes';
import { useNavigationTheme } from './NavigationThemeContext';

/**
 * PrimaryNavigation — movement-level primary navigation.
 *
 * EXACTLY five destinations: HOME | MISSION | SHOP | JOURNAL | DONATE.
 * Mounted only on the marketing/movement pages (see MovementLayout).
 *
 * Desktop (lg+): fixed top bar, centered links, theme-aware.
 * Mobile (<lg): fixed bottom bar so all five destinations stay reachable
 * without colliding with the existing top utilities (FloatingNavigation).
 *
 * Reuses the existing NavigationTheme tokens and SF Pro Display typography —
 * no new design system.
 */

const PRIMARY_NAV_ITEMS = [
  { label: 'HOME', to: ROUTES.HOME },
  { label: 'MISSION', to: ROUTES.MISSION },
  { label: 'SHOP', to: ROUTES.SHOP },
  { label: 'JOURNAL', to: ROUTES.JOURNAL },
  { label: 'DONATE', to: ROUTES.DONATE },
] as const;

const NAV_FONT_FAMILY = "'SF-Pro-Display', sans-serif";

export function PrimaryNavigation() {
  const { theme, colors } = useNavigationTheme();

  return (
    <>
      {/* Desktop: fixed top bar, centered primary links */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 top-0 z-40 hidden lg:flex h-16 items-center justify-center gap-8"
        style={{
          fontFamily: NAV_FONT_FAMILY,
          backgroundColor: theme === 'dark' ? colors.surfaceBackground : 'transparent',
          borderBottom: theme === 'dark' ? `1px solid ${colors.surfaceBorder}` : '1px solid transparent',
          boxShadow: theme === 'dark' ? colors.surfaceShadow : 'none',
          transition: 'background-color 220ms ease, border-color 220ms ease, box-shadow 220ms ease',
        }}
      >
        {PRIMARY_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            style={({ isActive }) => ({
              color: isActive ? colors.foreground : colors.muted,
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.18em',
              lineHeight: 1,
              textDecoration: 'none',
              padding: '8px 2px',
              borderBottom: `1px solid ${isActive ? colors.foreground : 'transparent'}`,
              transition: 'color 150ms ease, border-color 150ms ease',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Mobile/tablet: fixed bottom bar, five equal destinations */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 flex lg:hidden"
        style={{
          fontFamily: NAV_FONT_FAMILY,
          backgroundColor: colors.surfaceBackground,
          borderTop: `1px solid ${colors.surfaceBorder}`,
          boxShadow: colors.surfaceShadow,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {PRIMARY_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className="flex-1 text-center"
            style={({ isActive }) => ({
              color: isActive ? colors.foreground : colors.muted,
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              lineHeight: 1,
              textDecoration: 'none',
              padding: '15px 4px 14px',
              transition: 'color 150ms ease',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
