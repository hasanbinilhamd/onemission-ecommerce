import { ChevronLeft } from 'lucide-react';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/config/routes';
import { useNavigationTheme } from './NavigationTheme';

interface TopBackNavigationProps {
  label?: string;
  fallbackTo?: string;
  onBack?: () => void;
}

export function TopBackNavigation({
  label = 'Back',
  fallbackTo = ROUTES.HOME,
  onBack,
}: TopBackNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors } = useNavigationTheme();

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }

    if (typeof window !== 'undefined' && window.history.length > 1 && location.key !== 'default') {
      navigate(-1);
      return;
    }

    navigate(fallbackTo, { replace: true });
  }, [fallbackTo, location.key, navigate, onBack]);

  return (
    <button
      type="button"
      onClick={handleBack}
      className="fixed left-4 top-4 z-50 inline-flex items-center gap-1.5 sm:left-8"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 500,
        color: colors.muted,
        padding: '8px 0',
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
  );
}
