import type { ReactNode } from 'react';

interface CheckoutPlaceholderCardProps {
  message: string;
  children?: ReactNode;
}

export function CheckoutPlaceholderCard({ message, children }: CheckoutPlaceholderCardProps) {
  return (
    <div
      aria-disabled="true"
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: '16px',
        padding: '18px',
        backgroundColor: '#F9FAFB',
        color: '#9CA3AF',
        display: 'grid',
        gap: '14px',
      }}
    >
      {children}
      <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: '#6B7280' }}>
        {message}
      </p>
    </div>
  );
}
