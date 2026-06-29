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
        top: '24px',
        right: '16px',
        zIndex: 80,
        border: 'none',
        background: 'none',
        color: '#FFFFFF',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: '8px',
        lineHeight: 1,
      }}
      className="sm:right-8"
    >
      <ShoppingBag size={24} strokeWidth={2} />
      {totalItems > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '0px',
            right: '0px',
            minWidth: '18px',
            height: '18px',
            padding: '0 5px',
            borderRadius: '9999px',
            backgroundColor: '#F4845F',
            color: '#111827',
            fontSize: '10px',
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
