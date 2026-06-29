import type { Product } from '../../types';
import { formatCurrency } from '../../utils/formatting';
import { IMAGE_PLACEHOLDER } from '../../app/constants';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
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
      {/* Image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '133%', // 3:4 aspect ratio
          overflow: 'hidden',
          borderRadius: '6px',
          backgroundColor: '#F9FAFB',
          marginBottom: '10px',
        }}
      >
        <img
          src={product.imageUrl ?? IMAGE_PLACEHOLDER}
          alt={product.name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
            transition: 'transform 300ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />
      </div>

      {/* Category label */}
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

      {/* Name */}
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

      {/* Price */}
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
  );
}
