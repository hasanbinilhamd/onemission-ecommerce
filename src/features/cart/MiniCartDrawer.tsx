import { useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Drawer, EmptyState, Button } from '../../components/shared';
import { useCartStore } from '../../stores';
import { formatCurrency } from '../../utils/formatting';
import { DURATION } from '../../utils/motion';
import { CartLineItem } from './CartLineItem';
import { summaryLabelStyle, summaryValueStyle } from './cartSummaryStyles';

export function MiniCartDrawer() {
  const navigate = useNavigate();
  const {
    cart,
    cartItems,
    isCartReady,
    isCartRefreshing,
    hasInvalidItems,
    refreshCartItems,
    isMiniCartOpen,
    closeMiniCart,
    setMiniCartVisible,
    incrementItem,
    decrementItem,
    removeItem,
    totalItems,
    subtotal,
  } = useCartStore();

  const isEmpty = cart.items.length === 0;

  useEffect(() => {
    if (isMiniCartOpen) {
      setMiniCartVisible(true);
      void refreshCartItems();
      return;
    }

    const timer = window.setTimeout(() => setMiniCartVisible(false), DURATION.normal);
    return () => window.clearTimeout(timer);
  }, [isMiniCartOpen, refreshCartItems, setMiniCartVisible]);

  return (
    <Drawer
      open={isMiniCartOpen}
      onClose={closeMiniCart}
      position="right"
      width="md"
      title="Mini Cart"
      mobileFullScreen
    >
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        <div style={{ flex: 1 }}>
          {isEmpty ? (
            <div style={{ padding: '12px 20px 24px' }}>
              <EmptyState
                icon={<ShoppingCart size={34} />}
                title="Your cart is empty"
                description="Add something you love, then come back here to review it."
                action={
                  <Button type="button" variant="secondary" onClick={closeMiniCart}>
                    Continue Shopping
                  </Button>
                }
              />
            </div>
          ) : !isCartReady || isCartRefreshing || (cart.items.length > 0 && cartItems.length === 0) ? (
            <div style={{ padding: '16px 20px', fontSize: '14px', color: '#6B7280' }}>
              Refreshing cart availability...
            </div>
          ) : (
            cartItems.map((item) => (
              <CartLineItem
                key={`${item.productId}-${item.variantId ?? 'default'}`}
                item={item}
                onIncrement={incrementItem}
                onDecrement={decrementItem}
                onRemove={removeItem}
                compact
              />
            ))
          )}
        </div>

        {!isEmpty && (
          <div style={{ position: 'sticky', bottom: 0, borderTop: '1px solid #F3F4F6', padding: '18px 20px max(20px, env(safe-area-inset-bottom))', flexShrink: 0, backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <p style={summaryLabelStyle}>Number of Items</p>
              <p style={summaryValueStyle}>{totalItems}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <p style={summaryLabelStyle}>Subtotal</p>
              <p style={{ ...summaryValueStyle, fontSize: '16px' }}>{formatCurrency(subtotal)}</p>
            </div>
            {hasInvalidItems && (
              <p style={{ margin: '0 0 14px', fontSize: '13px', lineHeight: 1.6, color: '#B91C1C' }}>
                Some products are no longer available. Please review your cart.
              </p>
            )}
            <div style={{ display: 'grid', gap: '10px' }}>
              <Button
                type="button"
                onClick={() => {
                  closeMiniCart();
                  navigate('/checkout');
                }}
                disabled={hasInvalidItems || isCartRefreshing}
              >
                Checkout
              </Button>
              <Button type="button" variant="secondary" onClick={closeMiniCart}>
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
