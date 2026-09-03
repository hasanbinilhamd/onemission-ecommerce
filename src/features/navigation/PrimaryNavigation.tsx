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

      {/* Mobile/tablet: simple fixed full-width bottom bar (Shopee-like).
          White, rectangular, attached to the bottom edge; safe-area aware.
          Item content (icons, labels, colors, active treatment) is unchanged. */}
      <nav
        aria-label="Primary"
        className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden"
        style={{
          fontFamily: NAV_FONT_FAMILY,
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid rgba(17, 24, 39, 0.08)',
          borderBottom: 'none',
          borderRadius: 0,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {PRIMARY_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className="flex-1 relative flex flex-col items-center justify-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
              style={({ isActive }) => {
                // Solid white bar → items use the dark ink treatment on
                // every page (the light/white variant belonged to the old
                // translucent pill surface).
                const activeColor = '#111827';
                const inactiveColor = 'rgba(17, 24, 39, 0.45)';
                const color = isActive ? activeColor : inactiveColor;

                return {
                  color,
                  height: '52px',
                  textDecoration: 'none',
                  transition: 'color 200ms ease, background-color 200ms ease',
                  backgroundColor: isActive
                    ? 'rgba(17, 24, 39, 0.04)'
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
      </nav>
    </>
  );
}

