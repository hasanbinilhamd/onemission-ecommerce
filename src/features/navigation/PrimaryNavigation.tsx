import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../app/config/routes';
import { useNavigationTheme } from './NavigationThemeContext';

/**
 * Brand/home link only. Hide the legacy desktop and mobile menu bars while
 * keeping search, cart and account utilities independent.
 */
export function PrimaryNavigation() {
  const { pathname } = useLocation();
  const { theme } = useNavigationTheme();

  // The root Entry Gateway has its own centered brand logo.
  if (pathname === ROUTES.HOME) return null;

  return (
    <Link
      to={ROUTES.HOME}
      aria-label="ONEMISSION — back to the entry gateway"
      className="fixed left-4 top-3 z-[60] inline-flex h-10 max-w-[44vw] items-center rounded-lg px-1.5 no-underline sm:left-6 sm:px-2"
      style={{
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.96)' : 'transparent',
        transition: 'background-color 220ms ease',
      }}
    >
      <span className="relative block h-7 w-[116px] sm:h-8 sm:w-[146px]">
        <img
          src="/white_om_logo.png"
          alt="ONEMISSION"
          className="absolute inset-0 h-full w-full object-contain object-left transition-opacity duration-200"
          style={{ opacity: theme === 'light' ? 1 : 0 }}
        />
        <img
          src="/black_om_logo.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain object-left transition-opacity duration-200"
          style={{ opacity: theme === 'dark' ? 1 : 0 }}
        />
      </span>
    </Link>
  );
}
