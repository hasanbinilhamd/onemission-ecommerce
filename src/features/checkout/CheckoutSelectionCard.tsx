import { CheckCircle2 } from 'lucide-react';

interface CheckoutSelectionCardProps {
  label: string;
  description?: string;
  meta?: string;
  priceText?: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export function CheckoutSelectionCard({
  label,
  description,
  meta,
  priceText,
  selected,
  disabled = false,
  onSelect,
}: CheckoutSelectionCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onSelect}
      style={{
        width: '100%',
        textAlign: 'left',
        border: selected ? '1px solid #111827' : '1px solid #E5E7EB',
        borderRadius: '16px',
        padding: '18px',
        backgroundColor: disabled ? '#F9FAFB' : '#FFFFFF',
        opacity: disabled ? 0.65 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease',
        boxShadow: selected ? '0 0 0 2px rgba(17,24,39,0.08)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600, lineHeight: 1.4, color: '#111827' }}>
            {label}
          </p>
          {description && (
            <p style={{ margin: '0 0 4px', fontSize: '13px', lineHeight: 1.6, color: '#6B7280' }}>
              {description}
            </p>
          )}
          {meta && (
            <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.6, color: '#9CA3AF' }}>
              {meta}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {priceText && (
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              {priceText}
            </p>
          )}
          {selected ? (
            <CheckCircle2 size={18} color="#16A34A" aria-hidden="true" />
          ) : (
            <span
              aria-hidden="true"
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '9999px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
              }}
            />
          )}
        </div>
      </div>
    </button>
  );
}
