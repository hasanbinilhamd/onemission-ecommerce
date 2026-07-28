import type { ReactNode } from 'react';
import { HomepageFooter } from '../footer';
import { TopBackNavigation } from '../navigation';
import { ROUTES } from '../../app/config/routes';

const LEGAL_BACKGROUND = '#FFFFFF';
const LEGAL_TEXT = '#111827';
const LEGAL_MUTED = 'rgba(17,24,39,0.72)';
const LEGAL_BORDER = 'rgba(17,24,39,0.12)';

export function LegalPageLayout({
  title,
  subtitle,
  lastUpdated,
  children,
}: {
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: LEGAL_BACKGROUND }}>
      <TopBackNavigation label="Back to Home" fallbackTo={ROUTES.HOME} />

      <main
        style={{
          padding: '96px 20px 0',
        }}
        className="sm:px-8"
      >
        <div
          style={{
            width: 'min(100%, 1000px)',
            margin: '0 auto',
            paddingBottom: '88px',
            color: LEGAL_TEXT,
          }}
        >
          <header
            style={{
              display: 'grid',
              gap: '18px',
              marginBottom: '48px',
              paddingBottom: '28px',
              borderBottom: `1px solid ${LEGAL_BORDER}`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: LEGAL_MUTED,
              }}
            >
              Legal
            </p>
            <h1
              style={{
                margin: 0,
                fontFamily: "'SF-Pro-Display', sans-serif",
                fontSize: 'clamp(38px, 6vw, 72px)',
                lineHeight: 0.96,
                letterSpacing: '-0.05em',
                fontWeight: 400,
                color: LEGAL_TEXT,
              }}
            >
              {title}
            </h1>
            <p
              style={{
                margin: 0,
                maxWidth: '42rem',
                fontSize: '17px',
                lineHeight: 1.8,
                color: LEGAL_MUTED,
              }}
            >
              {subtitle}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                lineHeight: 1.7,
                color: LEGAL_MUTED,
              }}
            >
              Last Updated: {lastUpdated}
            </p>
          </header>

          <div style={{ display: 'grid', gap: '32px' }}>{children}</div>
        </div>
      </main>

      <HomepageFooter />
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: '14px' }}>
      <h2
        style={{
          margin: 0,
          fontFamily: "'SF-Pro-Display', sans-serif",
          fontSize: 'clamp(24px, 3vw, 32px)',
          lineHeight: 1.08,
          letterSpacing: '-0.03em',
          fontWeight: 500,
          color: LEGAL_TEXT,
        }}
      >
        {title}
      </h2>
      <div style={{ display: 'grid', gap: '14px' }}>{children}</div>
    </section>
  );
}

export function LegalParagraph({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: '16px',
        lineHeight: 1.85,
        color: LEGAL_MUTED,
      }}
    >
      {children}
    </p>
  );
}

export function LegalList({ items }: { items: readonly string[] }) {
  return (
    <ul
      style={{
        margin: 0,
        paddingLeft: '20px',
        display: 'grid',
        gap: '10px',
        color: LEGAL_MUTED,
      }}
    >
      {items.map((item) => (
        <li key={item} style={{ fontSize: '16px', lineHeight: 1.8 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}
