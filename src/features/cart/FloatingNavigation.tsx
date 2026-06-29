import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../stores';
import { useNavigationTheme } from '../navigation';
import { SearchTrigger } from '../search';

export function FloatingNavigation() {
  const { totalItems, openMiniCart, isMiniCartVisible } = useCartStore();
  const { colors } = useNavigationTheme();

  if (isMiniCartVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 140,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
      className="sm:right-8"
    >
      <SearchTrigger />
      <button
        type="button"
        onClick={openMiniCart}
        aria-label={`Open cart${totalItems > 0 ? ` with ${totalItems} item${totalItems > 1 ? 's' : ''}` : ''}`}
        style={{
          border: 'none',
          background: 'none',
          color: colors.foreground,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: '8px',
          lineHeight: 1,
          position: 'relative',
        }}
      >
        <ShoppingCart size={typeof window !== 'undefined' && window.innerWidth < 640 ? 18 : 20} strokeWidth={2} />
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
              border: `2px solid ${colors.badgeBorder}`,
              lineHeight: 1,
            }}
          >
            {totalItems}
          </span>
        )}
      </button>
    </div>
  );
}
