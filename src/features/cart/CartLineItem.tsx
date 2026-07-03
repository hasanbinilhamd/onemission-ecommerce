import { memo, useEffect, useMemo, useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { IMAGE_PLACEHOLDER } from '../../app/constants';
import { productService } from '../../services/product';
import { formatCurrency } from '../../utils/formatting';
import type { CartItem, Product } from '../../types';

const lineMetaTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '12px',
  color: '#6B7280',
  lineHeight: 1.5,
};

export const summaryLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '13px',
  color: '#6B7280',
};

export const summaryValueStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '14px',
  fontWeight: 600,
  color: '#111827',
};

interface CartLineItemProps {
  item: CartItem;
  onIncrement: (productId: string, variantId?: string) => void;
  onDecrement: (productId: string, variantId?: string) => void;
  onRemove: (productId: string, variantId?: string) => void;
  showCategory?: boolean;
  showSku?: boolean;
  compact?: boolean;
}

export const CartLineItem = memo(function CartLineItem({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  showCategory = false,
  showSku = false,
  compact = false,
}: CartLineItemProps) {
  const [product, setProduct] = useState<Product | null>(() => {
    return productService.getCachedProductById(item.productId)
      ?? (item.slug ? productService.getCachedProductBySlug(item.slug) : null);
  });

  useEffect(() => {
    let isActive = true;

    const cached = productService.getCachedProductById(item.productId)
      ?? (item.slug ? productService.getCachedProductBySlug(item.slug) : null);
    if (cached) {
      setProduct(cached);
      return undefined;
    }

    if (!item.slug) {
      return undefined;
    }

    void productService.getProductDetail(item.slug).then((response) => {
      if (isActive) {
        setProduct(response);
      }
    }).catch(() => {
      if (isActive) {
        setProduct(null);
      }
    });

    return () => {
      isActive = false;
    };
  }, [item.productId, item.slug]);

  const lineTotal = useMemo(() => item.price * item.quantity, [item.price, item.quantity]);
  const displaySku = product?.variants?.find((variant) => variant.id === item.variantId)?.sku ?? product?.sku;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: compact ? '88px 1fr' : '112px 1fr',
        gap: compact ? '14px' : '18px',
        padding: compact ? '16px 20px' : '20px 0',
        borderBottom: '1px solid #F3F4F6',
      }}
    >
      <div
        style={{
          width: compact ? '88px' : '112px',
          height: compact ? '110px' : '140px',
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
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: compact ? '8px' : '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 6px', fontSize: compact ? '14px' : '16px', fontWeight: 600, color: '#111827', lineHeight: 1.4 }}>
              {item.name}
            </p>
            {showCategory && product?.category?.name && <p style={lineMetaTextStyle}>Category: {product.category.name}</p>}
            {item.color && <p style={lineMetaTextStyle}>Color: {item.color}</p>}
            {item.size && <p style={lineMetaTextStyle}>Size: {item.size}</p>}
            {showSku && displaySku && <p style={lineMetaTextStyle}>SKU: {displaySku}</p>}
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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
            <button
              type="button"
              aria-label={`Decrease quantity for ${item.name}`}
              onClick={() => onDecrement(item.productId, item.variantId)}
              disabled={item.quantity <= 1}
              style={{
                width: compact ? '36px' : '40px',
                height: compact ? '36px' : '40px',
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
            <span style={{ minWidth: compact ? '40px' : '44px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#111827' }}>
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label={`Increase quantity for ${item.name}`}
              onClick={() => onIncrement(item.productId, item.variantId)}
              style={{
                width: compact ? '36px' : '40px',
                height: compact ? '36px' : '40px',
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
            <p style={{ margin: '2px 0 0', fontSize: compact ? '14px' : '16px', fontWeight: 600, color: '#111827' }}>
              {formatCurrency(lineTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
