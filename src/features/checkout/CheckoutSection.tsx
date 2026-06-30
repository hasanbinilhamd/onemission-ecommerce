import type { ReactNode } from 'react';

interface CheckoutSectionProps {
  stepLabel: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function CheckoutSection({ stepLabel, title, description, children }: CheckoutSectionProps) {
  const headingId = `${stepLabel}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <section
      aria-labelledby={headingId}
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: '20px',
        padding: '24px',
        backgroundColor: '#FFFFFF',
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: '12px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#9CA3AF',
            fontWeight: 600,
          }}
        >
          {stepLabel}
        </p>
        <h2 id={headingId} style={{ margin: '0 0 8px', fontSize: '22px', lineHeight: 1.2, color: '#111827' }}>
          {title}
        </h2>
        {description && (
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: '#6B7280' }}>
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}
