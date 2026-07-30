import type { ReactNode } from 'react';
import { ROUTES } from '../../app/config/routes';
import { TopBackNavigation } from '../navigation';

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
  return (
    <div className="mb-8">
      {showBackToHome ? <TopBackNavigation label="Back to Home" fallbackTo={ROUTES.HOME} /> : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-[720px]">
          <p style={{ margin: '0 0 8px', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600, fontFamily: "'Chakra Petch', sans-serif" }}>
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
