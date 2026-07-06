import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/config/routes';

const COMMERCE_LOGO_URL = 'https://ik.imagekit.io/edyl3oplm/Onemission/logos/AMAN_ONEMISSION.png?updatedAt=1782542636942';

interface CustomerPageShellProps {
  children: ReactNode;
  maxWidth?: string;
}

interface CustomerPageHeaderProps {
  sectionLabel: string;
  title: string;
  description?: string;
  action?: ReactNode;
  showBackToHome?: boolean;
}

export function CustomerPageShell({ children, maxWidth = '1120px' }: CustomerPageShellProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '104px 24px 60px' }}>
      <div style={{ maxWidth, margin: '0 auto' }}>
        {children}
      </div>
    </div>
  );
}

export function CustomerPageHeader({
  sectionLabel,
  title,
  description,
  action,
  showBackToHome = true,
}: CustomerPageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <Link to={ROUTES.HOME} aria-label="Back to ONEMISSION Commerce homepage" className="inline-flex items-center">
        <img src={COMMERCE_LOGO_URL} alt="ONEMISSION" className="h-8 w-auto sm:h-10" />
      </Link>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-[720px]">
          {showBackToHome ? (
            <button
              type="button"
              onClick={() => navigate(ROUTES.HOME)}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
            >
              <ChevronLeft size={16} />
              Back to Home
            </button>
          ) : null}

          <p style={{ margin: '0 0 8px', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600 }}>
            {sectionLabel}
          </p>
          <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: 1.1, color: '#111827' }}>
            {title}
          </h1>
          {description ? (
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.7, color: '#6B7280' }}>
              {description}
            </p>
          ) : null}
        </div>

        {action}
      </div>
    </div>
  );
}
