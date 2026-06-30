import { AlertCircle } from 'lucide-react';
import { Button } from '../../components/shared';

interface CheckoutErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function CheckoutErrorState({ message, onRetry }: CheckoutErrorStateProps) {
  return (
    <div
      role="alert"
      style={{
        border: '1px solid #FECACA',
        borderRadius: '16px',
        padding: '16px',
        backgroundColor: '#FEF2F2',
        display: 'grid',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <AlertCircle size={16} color="#DC2626" aria-hidden="true" style={{ marginTop: '2px', flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: '#991B1B' }}>
          {message}
        </p>
      </div>

      {onRetry && (
        <div>
          <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
