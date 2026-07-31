import { ChevronLeft } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/config/routes';
import { useNavigationTheme } from './NavigationThemeContext';

interface TopBackNavigationProps {
  label?: string;
  fallbackTo?: string;
  onBack?: () => void;
}

function scrollViewportToTop() {
  if (typeof window === 'undefined') {
    return;
  }

  window.scrollTo({
    left: 0,
    top: 0,
    behavior: 'auto',
  });
}

export function TopBackNavigation({
  label = 'Back',
  fallbackTo = ROUTES.HOME,
  onBack,
}: TopBackNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors } = useNavigationTheme();
  const isBackToHome = useMemo(
    () => label.trim().toLowerCase() === 'back to home',
    [label],
  );

  const handleBack = useCallback(() => {
    if (isBackToHome) {
      if (location.pathname === ROUTES.HOME) {
        scrollViewportToTop();
        return;
      }

      navigate(ROUTES.HOME);
      window.requestAnimationFrame(() => {
        scrollViewportToTop();
      });
      return;
    }

    if (onBack) {
      onBack();
      return;
    }

    if (typeof window !== 'undefined' && window.history.length > 1 && location.key !== 'default') {
      navigate(-1);
      return;
    }

    navigate(fallbackTo, { replace: true });
  }, [fallbackTo, isBackToHome, location.key, location.pathname, navigate, onBack]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        backgroundColor: colors.surfaceBackground,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.surfaceBorder}`,
        boxShadow: colors.surfaceShadow,
      }}
      className="sm:px-8"
    >
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-1.5"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 500,
          color: colors.muted,
          padding: '6px 0',
          lineHeight: 1,
          transition: 'color 150ms ease',
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.color = colors.foreground;
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.color = colors.muted;
        }}
      >
        <ChevronLeft size={16} strokeWidth={2} />
        <span>{label}</span>
      </button>
    </div>
  );
}
