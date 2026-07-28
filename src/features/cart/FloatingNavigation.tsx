import { ShoppingCart } from 'lucide-react';
import { AccountMenu } from '../customer/AccountMenu';
import { useCartStore } from '../../stores';
import { useNavigationTheme } from '../navigation';
import { SearchTrigger } from '../search';

export function FloatingNavigation() {
  const { totalItems, openMiniCart, isMiniCartVisible } = useCartStore();
  const { theme, colors } = useNavigationTheme();

  if (isMiniCartVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: theme === 'dark' ? '6px 8px' : 0,
        borderRadius: '9999px',
        backgroundColor: colors.surfaceBackground,
        border: theme === 'dark' ? `1px solid ${colors.surfaceBorder}` : '1px solid transparent',
        boxShadow: colors.surfaceShadow,
        transition: 'background-color 220ms ease, border-color 220ms ease, box-shadow 220ms ease, padding 220ms ease',
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
      <AccountMenu />
    </div>
  );
}
