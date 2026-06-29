import { useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Drawer, EmptyState, Button } from '../../components/shared';
import { useCartStore } from '../../stores';
import { formatCurrency } from '../../utils/formatting';
import { DURATION } from '../../utils/motion';
import { CartLineItem, summaryLabelStyle, summaryValueStyle } from './CartLineItem';

export function MiniCartDrawer() {
  const navigate = useNavigate();
  const {
    cart,
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
      return;
    }

    const timer = window.setTimeout(() => setMiniCartVisible(false), DURATION.normal);
    return () => window.clearTimeout(timer);
  }, [isMiniCartOpen, setMiniCartVisible]);

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
          ) : (
            cart.items.map((item) => (
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
          <div style={{ borderTop: '1px solid #F3F4F6', padding: '18px 20px 20px', flexShrink: 0, backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <p style={summaryLabelStyle}>Number of Items</p>
              <p style={summaryValueStyle}>{totalItems}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <p style={summaryLabelStyle}>Subtotal</p>
              <p style={{ ...summaryValueStyle, fontSize: '16px' }}>{formatCurrency(subtotal)}</p>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              <Button
                type="button"
                onClick={() => {
                  closeMiniCart();
                  navigate('/cart');
                }}
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
