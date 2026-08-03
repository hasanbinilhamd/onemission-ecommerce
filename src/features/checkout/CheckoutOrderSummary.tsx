import type { ReactNode } from 'react';
import { IMAGE_PLACEHOLDER } from '../../app/constants';
import { useCartStore, useCheckoutStore } from '../../stores';
import type { PromotionResult } from '../../types';
import { formatCurrency } from '../../utils/formatting';

interface CheckoutOrderSummaryProps {
  className?: string;
  discountAmount?: number;
  shippingCostOverride?: number;
  totalOverride?: number;
  promotionTitle?: string;
  totalSavings?: number;
  promotionResult?: PromotionResult | null;
  voucherSlot?: ReactNode;
}

export function CheckoutOrderSummary({
  className = '',
  discountAmount = 0,
  shippingCostOverride,
  totalOverride,
  promotionTitle = '',
  promotionResult = null,
  voucherSlot,
}: CheckoutOrderSummaryProps) {
  const { cart, cartItems, subtotal, totalItems } = useCartStore();
  const { checkout } = useCheckoutStore();
  const shippingCost = promotionResult?.finalShipping ?? shippingCostOverride ?? checkout.shipping.selectedRate?.cost ?? 0;
  const total = promotionResult?.finalTotal ?? totalOverride ?? (subtotal - discountAmount + shippingCost);

  return (
    <aside className={className} style={{ alignSelf: 'start' }}>
      <div style={{ border: '1px solid #E5E7EB', borderRadius: '20px', padding: '20px', backgroundColor: '#FFFFFF' }}>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600, fontFamily: "'Chakra Petch', sans-serif" }}>
            Summary
          </p>
          <h2 style={{ margin: 0, fontSize: '22px', lineHeight: 1.2, color: '#111827' }}>
            Order Summary
          </h2>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827' }}>Products</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
              {totalItems} item{totalItems === 1 ? '' : 's'}
            </p>
          </div>

          <div style={{ display: 'grid', gap: '14px' }}>
            {cartItems.map((item) => (
              <div
                key={`${item.productId}-${item.variantId ?? 'default'}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '72px minmax(0, 1fr)',
                  gap: '14px',
                  alignItems: 'start',
                }}
              >
                <div
                  style={{
                    width: '72px',
                    height: '92px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    backgroundColor: '#F0F0F0',
                  }}
                >
                  <img
                    src={item.imageUrl ?? IMAGE_PLACEHOLDER}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom' }}
                  />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, fontWeight: 600, color: '#111827' }}>
                      {item.name}
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, fontWeight: 600, color: '#111827', textAlign: 'right' }}>
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gap: '4px' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                      Quantity: {item.quantity}
                    </p>
                    {item.color && (
                      <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                        Color: {item.color}
                      </p>
                    )}
                    {item.size && (
                      <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                        Size: {item.size}
                      </p>
                    )}
                    <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                      Unit Price: {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {cart.items.length > 0 && cartItems.length === 0 && (
              <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF' }}>
                Loading product details...
              </p>
            )}
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: '#F3F4F6', marginBottom: '20px' }} />

        <div style={{ display: 'grid', gap: '14px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Subtotal</p>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827' }}>{formatCurrency(subtotal)}</p>
          </div>
          {voucherSlot ? (
            <div style={{ margin: '2px 0 4px' }}>{voucherSlot}</div>
          ) : null}
          {promotionTitle ? (
            <div style={{ display: 'grid', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Promotion</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#111827', textAlign: 'right', fontWeight: 600 }}>{promotionTitle}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Discount</p>
                <p style={{ margin: 0, fontSize: '13px', color: discountAmount > 0 ? '#15803D' : '#111827', textAlign: 'right', fontWeight: 600 }}>
                  {discountAmount > 0 ? `- ${formatCurrency(discountAmount)}` : formatCurrency(0)}
                </p>
              </div>
            </div>
          ) : null}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Shipping</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#111827', textAlign: 'right', fontWeight: shippingCost > 0 ? 600 : 500 }}>
              {checkout.shipping.selectedRate || shippingCostOverride !== undefined ? formatCurrency(shippingCost) : 'Select a courier'}
            </p>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: '#F3F4F6', marginBottom: '20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827' }}>Total</p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>{formatCurrency(total)}</p>
        </div>
      </div>
    </aside>
  );
}
