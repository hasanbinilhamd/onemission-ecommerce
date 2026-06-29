import { useNavigate } from 'react-router-dom';
import { Button } from '../components/shared';
import { NavigationThemeProvider } from '../features/navigation';

function CheckoutPageContent() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '520px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 12px', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600 }}>
          Checkout
        </p>
        <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 5vw, 40px)', color: '#111827' }}>
          Checkout will be implemented in the next sprint.
        </h1>
        <p style={{ margin: '0 0 24px', fontSize: '14px', lineHeight: 1.7, color: '#6B7280' }}>
          Your cart is saved locally for this session. Continue reviewing products or return to the shopping cart while Checkout is being prepared.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button type="button" onClick={() => navigate('/cart')}>
            Back to Cart
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CheckoutPage() {
  return (
    <NavigationThemeProvider theme="dark">
      <CheckoutPageContent />
    </NavigationThemeProvider>
  );
}
