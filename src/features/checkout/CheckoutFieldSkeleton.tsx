export function CheckoutFieldSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse" style={{ display: 'grid', gap: '8px' }}>
      <div style={{ width: '34%', height: '14px', borderRadius: '9999px', backgroundColor: '#E5E7EB' }} />
      <div style={{ width: '100%', height: '40px', borderRadius: '8px', backgroundColor: '#E5E7EB' }} />
    </div>
  );
}
