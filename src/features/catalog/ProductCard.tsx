import { Heart } from 'lucide-react';
import { memo } from 'react';
import type { Product } from '../../types';
import { formatCurrency } from '../../utils/formatting';
import { IMAGE_PLACEHOLDER } from '../../app/constants';
import { useWishlist } from '../customer';

if (typeof document !== 'undefined') {
  const STYLE_ID = 'om-product-card-keyframes';
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      @keyframes cardFadeSlideIn {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
}

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  isNew?: boolean;
}

export const ProductCard = memo(function ProductCard({
  product,
  onClick,
  isNew = false,
}: ProductCardProps) {
  const { isWishlisted, toggleItem } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  return (
    <div
      style={{
        width: '100%',
        textAlign: 'left',
        position: 'relative',
        animation: isNew ? 'cardFadeSlideIn 350ms ease forwards' : undefined,
      }}
    >
      <button
        type="button"
        onClick={() => onClick(product)}
        style={{
          all: 'unset',
          cursor: 'pointer',
          display: 'block',
          width: '100%',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingBottom: '133%',
            overflow: 'hidden',
            borderRadius: '6px',
            backgroundColor: '#F5F5F5',
            marginBottom: '10px',
          }}
        >
          <img
            src={product.imageUrl ?? IMAGE_PLACEHOLDER}
            alt={product.name}
            loading="lazy"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center bottom',
              transition: 'transform 320ms cubic-bezier(0.4,0,0.2,1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          />
        </div>

        {product.category && (
          <p
            style={{
              margin: '0 0 3px',
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#9CA3AF',
            }}
          >
            {product.category.name}
          </p>
        )}

        <p
          style={{
            margin: '0 0 4px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#111827',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </p>

        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: '#374151',
            fontWeight: 500,
          }}
        >
          {formatCurrency(product.price)}
        </p>
      </button>

      <button
        type="button"
        aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleItem(product);
        }}
        className={`absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${wishlisted ? 'border-black bg-black text-white' : 'border-white/80 bg-white/90 text-neutral-700 hover:bg-white'}`}
      >
        <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
});
