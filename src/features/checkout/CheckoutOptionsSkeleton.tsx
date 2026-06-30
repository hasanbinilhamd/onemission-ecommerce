export function CheckoutOptionsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="animate-pulse" style={{ display: 'grid', gap: '14px' }}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          style={{
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            padding: '18px',
            backgroundColor: '#FFFFFF',
            display: 'grid',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'grid', gap: '8px', flex: 1 }}>
              <div style={{ width: '30%', height: '22px', borderRadius: '9999px', backgroundColor: '#E5E7EB' }} />
              <div style={{ width: '48%', height: '14px', borderRadius: '9999px', backgroundColor: '#E5E7EB' }} />
              <div style={{ width: '42%', height: '12px', borderRadius: '9999px', backgroundColor: '#E5E7EB' }} />
            </div>
            <div style={{ width: '72px', height: '18px', borderRadius: '9999px', backgroundColor: '#E5E7EB' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
