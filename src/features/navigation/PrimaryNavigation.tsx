import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../../app/config/routes";
import { useNavigationTheme } from "./NavigationThemeContext";

/**
 * Brand/home link only. Hide the legacy desktop and mobile menu bars while
 * keeping search, cart and account utilities independent.
 */
export function PrimaryNavigation() {
  const { pathname } = useLocation();
  const { theme, colors } = useNavigationTheme();

  // The root Entry Gateway has its own centered brand logo.
  if (pathname === ROUTES.HOME) return null;

  return (
    <Link
      to={ROUTES.HOME}
      aria-label="ONEMISSION — back to the entry gateway"
      className="fixed left-6 top-3 z-[60] inline-flex items-center justify-center gap-1 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        padding: theme === "dark" ? "6px 8px" : 0,
        borderRadius: "9999px",
        backgroundColor: colors.surfaceBackground,
        border:
          theme === "dark"
            ? `1px solid ${colors.surfaceBorder}`
            : "1px solid transparent",
        boxShadow: colors.surfaceShadow,
        transition:
          "background-color 220ms ease, border-color 220ms ease, box-shadow 220ms ease, padding 220ms ease",
      }}
    >
      <span className="relative block h-9 w-[116px] sm:w-[146px]">
        <img
          src="/white_om_logo.png"
          alt="ONEMISSION"
          className="absolute inset-0 h-full w-full object-contain object-left transition-opacity duration-200"
          style={{ opacity: theme === "light" ? 1 : 0 }}
        />
        <img
          src="/black_om_logo.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain object-left transition-opacity duration-200"
          style={{ opacity: theme === "dark" ? 1 : 0 }}
        />
      </span>
    </Link>
  );
}
