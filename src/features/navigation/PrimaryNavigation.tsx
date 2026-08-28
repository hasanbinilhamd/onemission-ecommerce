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

      {/* Mobile/tablet: Top logo area (links are in bottom bar) */}
      <div 
        className="fixed top-0 left-0 right-0 z-40 flex lg:hidden items-center px-4 h-16 pointer-events-none"
      >
      
      </div>

      {/* Mobile/tablet: floating glass bottom bar */}
      <nav
        aria-label="Primary"
        className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden items-center justify-center px-4 pb-[env(safe-area-inset-bottom,16px)] pointer-events-none"
        style={{
          fontFamily: NAV_FONT_FAMILY,
        }}
      >
        <div 
          className="flex w-full max-w-[400px] h-[64px] rounded-[24px] pointer-events-auto"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(20, 20, 20, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: theme === 'dark' 
              ? '1px solid rgba(0,0,0,0.08)' 
              : '1px solid rgba(255,255,255,0.12)',
            boxShadow: theme === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.08)'
              : '0 8px 32px rgba(0,0,0,0.3)',
            transition: 'background-color 240ms ease, border-color 240ms ease, box-shadow 240ms ease',
          }}
        >
          {PRIMARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className="flex-1 relative flex flex-col items-center justify-center h-full gap-1 rounded-[20px]"
                style={({ isActive }) => {
                  // Text & icon color calculation
                  const activeColor = theme === 'dark' ? '#111827' : '#FFFFFF';
                  const inactiveColor = theme === 'dark' ? 'rgba(17,24,39,0.45)' : 'rgba(255,255,255,0.45)';
                  const color = isActive ? activeColor : inactiveColor;
                  
                  return {
                    color,
                    textDecoration: 'none',
                    transition: 'color 200ms ease, background-color 200ms ease',
                    // Very subtle background highlight for active state
                    backgroundColor: isActive 
                      ? (theme === 'dark' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.1)') 
                      : 'transparent',
                  };
                }}
              >
                <Icon size={20} strokeWidth={2.2} />
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    lineHeight: 1,
                  }}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
