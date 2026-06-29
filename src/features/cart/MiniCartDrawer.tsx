import { memo, useMemo } from 'react';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Drawer, EmptyState, Button } from '../../components/shared';
import { useCartStore } from '../../stores';
import { formatCurrency } from '../../utils/formatting';
import { IMAGE_PLACEHOLDER } from '../../app/constants';

const lineMetaTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '12px',
  color: '#6B7280',
  lineHeight: 1.5,
};

const summaryLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '13px',
  color: '#6B7280',
};

const summaryValueStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '14px',
  fontWeight: 600,
  color: '#111827',
};

const CartLineItem = memo(function CartLineItem({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  item: {
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    name: string;
    imageUrl?: string;
    color?: string;
    size?: string;
  };
  onIncrement: (productId: string, variantId?: string) => void;
  onDecrement: (productId: string, variantId?: string) => void;
  onRemove: (productId: string, variantId?: string) => void;
}) {
  const lineTotal = useMemo(() => item.price * item.quantity, [item.price, item.quantity]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: '14px', padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
      <div
        style={{
          width: '88px',
          height: '110px',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#F5F5F5',
        }}
      >
        <img
          src={item.imageUrl ?? IMAGE_PLACEHOLDER}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom' }}
        />
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 600, color: '#111827', lineHeight: 1.4 }}>
              {item.name}
            </p>
            {item.color && <p style={lineMetaTextStyle}>Color: {item.color}</p>}
            {item.size && <p style={lineMetaTextStyle}>Size: {item.size}</p>}
            <p style={lineMetaTextStyle}>Unit Price: {formatCurrency(item.price)}</p>
          </div>

          <button
            type="button"
            aria-label={`Remove ${item.name} from cart`}
            onClick={() => onRemove(item.productId, item.variantId)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
            <button
              type="button"
              aria-label={`Decrease quantity for ${item.name}`}
              onClick={() => onDecrement(item.productId, item.variantId)}
              disabled={item.quantity <= 1}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'none',
                color: item.quantity <= 1 ? '#D1D5DB' : '#374151',
                cursor: item.quantity <= 1 ? 'default' : 'pointer',
              }}
            >
              <Minus size={14} />
            </button>
            <span style={{ minWidth: '40px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#111827' }}>
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label={`Increase quantity for ${item.name}`}
              onClick={() => onIncrement(item.productId, item.variantId)}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'none',
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} />
            </button>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>Line Total</p>
            <p style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              {formatCurrency(lineTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export function MiniCartDrawer() {
  const {
    cart,
    isMiniCartOpen,
    closeMiniCart,
    incrementItem,
    decrementItem,
    removeItem,
    totalItems,
    subtotal,
  } = useCartStore();

  const isEmpty = cart.items.length === 0;

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
                icon={<ShoppingBag size={34} />}
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
            cart.items.map(item => (
              <CartLineItem
                key={`${item.productId}-${item.variantId ?? 'default'}`}
                item={item}
                onIncrement={incrementItem}
                onDecrement={decrementItem}
                onRemove={removeItem}
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
                onClick={() => window.alert('Checkout will be available in the next sprint.')}
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
