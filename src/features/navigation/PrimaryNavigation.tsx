import { NavLink } from 'react-router-dom';
import { Home, Flag, ShoppingBag, Book, Heart } from 'lucide-react';
import { ROUTES } from '../../app/config/routes';
import { useNavigationTheme } from './NavigationThemeContext';

/**
 * PrimaryNavigation — movement-level primary navigation.
 *
 * EXACTLY five destinations: HOME | MISSION | SHOP | IMPACT | DONATE.
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
  { label: 'IMPACT', to: ROUTES.IMPACT, icon: Book },
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
        {/* Theme-aware One Mission logo (fixed rendered size, crossfade):
            theme 'light' = transparent surface over a dark hero → WHITE logo
            theme 'dark'  = white surface → BLACK logo */}
        <div className="absolute left-6 top-1/2 h-9 -translate-y-1/2">
          <img
            src="/white_om_logo.png"
            alt="One Mission"
            className="h-full w-auto transition-opacity duration-200"
            style={{ opacity: theme === 'light' ? 1 : 0 }}
          />
          <img
            src="/black_om_logo.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-y-0 left-0 h-full w-auto transition-opacity duration-200"
            style={{ opacity: theme === 'dark' ? 1 : 0 }}
          />
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

      {/* Mobile/tablet: Top logo area (links are in bottom bar) */}
      <div 
        className="fixed top-0 left-0 right-0 z-40 flex lg:hidden items-center px-4 h-16 pointer-events-none"
      >
      
      </div>

      {/* Mobile/tablet: floating glass bottom bar */}
      <nav
        aria-label="Primary"
        className="fixed left-0 right-0 z-40 flex lg:hidden items-center justify-center pointer-events-none"
        style={{
          bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          fontFamily: NAV_FONT_FAMILY,
        }}
      >
        <div 
          className="flex w-full max-w-[400px] p-1.5 pointer-events-auto"
          style={{
            width: 'calc(100% - 32px)',
            margin: '0 auto',
            borderRadius: '9999px',
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(20, 20, 20, 0.40)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: theme === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.65)' 
              : '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: theme === 'dark'
              ? 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 0 0 1px rgba(255,255,255,0.15), 0 12px 35px rgba(0,0,0,0.12)'
              : 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 0 0 1px rgba(255,255,255,0.05), 0 12px 35px rgba(0,0,0,0.3)',
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
                className="flex-1 relative flex flex-col items-center justify-center gap-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                style={({ isActive }) => {
                  // Text & icon color calculation
                  const activeColor = theme === 'dark' ? '#111827' : '#FFFFFF';
                  const inactiveColor = theme === 'dark' ? 'rgba(17,24,39,0.45)' : 'rgba(255,255,255,0.45)';
                  const color = isActive ? activeColor : inactiveColor;
                  
                  return {
                    color,
                    height: '52px',
                    textDecoration: 'none',
                    transition: 'color 200ms ease, background-color 200ms ease',
                    // Very subtle background highlight for active state
                    backgroundColor: isActive 
                      ? (theme === 'dark' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.12)') 
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
