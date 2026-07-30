import { ShoppingCart } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, EmptyState } from '../components/shared';
import { CartLineItem } from '../features/cart/CartLineItem';
import { summaryLabelStyle, summaryValueStyle } from '../features/cart/cartSummaryStyles';
import { useCartStore } from '../stores';
import { formatCurrency } from '../utils/formatting';
import { NavigationThemeProvider } from '../features/navigation';

function CartPageContent() {
  const navigate = useNavigate();
  const {
    cart,
    cartItems,
    isCartReady,
    isCartRefreshing,
    hasInvalidItems,
    refreshCartItems,
    incrementItem,
    decrementItem,
    removeItem,
    subtotal,
  } = useCartStore();

  const isEmpty = cart.items.length === 0;

  useEffect(() => {
    if (!isEmpty) {
      void refreshCartItems();
    }
  }, [isEmpty, refreshCartItems]);

  if (isEmpty) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fff', padding: '120px 24px 60px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <EmptyState
            icon={<ShoppingCart size={40} />}
            title="Your shopping cart is empty."
            description="Browse the latest ONEMISSION collection and add your favorite pieces to continue."
            action={
              <Button type="button" onClick={() => navigate('/')}>
                Continue Shopping
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', padding: '104px 24px 60px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600, fontFamily: "'Chakra Petch', sans-serif" }}>
            Cart Review
          </p>
          <h1 style={{ margin: 0, fontSize: 'clamp(28px, 5vw, 40px)', color: '#111827', lineHeight: 1.1 }}>
            Shopping Cart
          </h1>
        </div>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10" style={{ display: 'grid', gap: '32px' }}>
          <section>
            <div style={{ borderTop: '1px solid #F3F4F6' }}>
              {!isCartReady || isCartRefreshing || (cart.items.length > 0 && cartItems.length === 0) ? (
                <p style={{ margin: '20px 0', fontSize: '14px', color: '#6B7280' }}>Refreshing cart availability...</p>
              ) : (
                cartItems.map((item) => (
                  <CartLineItem
                    key={`${item.productId}-${item.variantId ?? 'default'}`}
                    item={item}
                    onIncrement={incrementItem}
                    onDecrement={decrementItem}
                    onRemove={removeItem}
                    showCategory
                    showSku
                  />
                ))
              )}
            </div>
          </section>

          <aside>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px', position: 'sticky', top: '96px' }}>
              <h2 style={{ margin: '0 0 18px', fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                Order Summary
              </h2>

              <div style={{ display: 'grid', gap: '14px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <p style={summaryLabelStyle}>Subtotal</p>
                  <p style={summaryValueStyle}>{formatCurrency(subtotal)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <p style={summaryLabelStyle}>Estimated Shipping</p>
                  <p style={{ ...summaryLabelStyle, textAlign: 'right' }}>Calculated during Checkout</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <p style={summaryLabelStyle}>Estimated Tax</p>
                  <p style={{ ...summaryLabelStyle, textAlign: 'right' }}>Calculated during Checkout</p>
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: '#F3F4F6', marginBottom: '20px' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827' }}>Total</p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>{formatCurrency(subtotal)}</p>
              </div>

              {hasInvalidItems && (
                <p style={{ margin: '0 0 16px', fontSize: '13px', lineHeight: 1.6, color: '#B91C1C' }}>
                  Some products are no longer available. Please update your cart before continuing.
                </p>
              )}

              <div style={{ display: 'grid', gap: '10px' }}>
                <Button type="button" onClick={() => navigate('/checkout')} disabled={hasInvalidItems || isCartRefreshing}>
                  Proceed to Checkout
                </Button>
                <Button type="button" variant="secondary" onClick={() => navigate('/')}>
                  Continue Shopping
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function CartPage() {
  return (
    <NavigationThemeProvider theme="dark">
      <CartPageContent />
    </NavigationThemeProvider>
  );
}
