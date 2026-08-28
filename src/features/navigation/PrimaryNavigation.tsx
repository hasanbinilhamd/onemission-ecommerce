import { NavLink } from 'react-router-dom';
import { Home, Flag, ShoppingBag, Book, Heart } from 'lucide-react';
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
  { label: 'HOME', to: ROUTES.HOME, icon: Home },
  { label: 'MISSION', to: ROUTES.MISSION, icon: Flag },
  { label: 'SHOP', to: ROUTES.SHOP, icon: ShoppingBag },
  { label: 'IMPACT', to: ROUTES.JOURNAL, icon: Book },
  { label: 'DONATE', to: ROUTES.DONATE, icon: Heart },
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
        <div className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center">
          <NavLink to={ROUTES.HOME} aria-label="One Mission">
            <img
              src={theme === 'dark' ? '/black_om_logo.png' : '/white_om_logo.png'}
              alt="One Mission"
              className="h-[18px] w-auto transition-opacity duration-200"
            />
          </NavLink>
        </div>

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
        className="fixed inset-x-0 bottom-0 z-40 flex lg:hidden items-center"
        style={{
          fontFamily: NAV_FONT_FAMILY,
          backgroundColor: colors.surfaceBackground,
          borderTop: `1px solid ${colors.surfaceBorder}`,
          boxShadow: colors.surfaceShadow,
          paddingBottom: 'env(safe-area-inset-bottom)',
          height: 'calc(60px + env(safe-area-inset-bottom))',
        }}
      >
        {PRIMARY_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className="flex-1 flex flex-col items-center justify-center h-full gap-[4px]"
              style={({ isActive }) => ({
                color: isActive ? colors.foreground : colors.muted,
                textDecoration: 'none',
                transition: 'color 150ms ease',
              })}
            >
              <Icon size={20} strokeWidth={2} />
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  lineHeight: 1,
                  marginTop: '2px',
                }}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
