import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../stores';

export function CartButton() {
  const { totalItems, openMiniCart } = useCartStore();

  return (
    <button
      type="button"
      onClick={openMiniCart}
      aria-label={`Open cart${totalItems > 0 ? ` with ${totalItems} item${totalItems > 1 ? 's' : ''}` : ''}`}
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        zIndex: 70,
        width: '56px',
        height: '56px',
        borderRadius: '9999px',
        border: 'none',
        backgroundColor: '#111827',
        color: '#FFFFFF',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 10px 24px rgba(17,24,39,0.24)',
      }}
    >
      <ShoppingBag size={22} strokeWidth={2} />
      {totalItems > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-3px',
            right: '-3px',
            minWidth: '22px',
            height: '22px',
            padding: '0 6px',
            borderRadius: '9999px',
            backgroundColor: '#F4845F',
            color: '#111827',
            fontSize: '11px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #FFFFFF',
            lineHeight: 1,
          }}
        >
          {totalItems}
        </span>
      )}
    </button>
  );
}
