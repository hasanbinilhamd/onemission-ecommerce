import { memo } from 'react';
import type { Product } from '../../types';
import { formatCurrency } from '../../utils/formatting';
import { IMAGE_PLACEHOLDER } from '../../app/constants';

// ─── Keyframe injection (once at module load) ─────────────────────────────────
// Injects a CSS @keyframes rule into the document head the first time this
// module is evaluated — safe to call at module scope.
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  /** When true, the card plays a fade-in entrance animation. */
  isNew?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ProductCard — memoised so unchanged cards don't re-render on Load More.
 *
 * Image strategy: objectFit = 'contain' + objectPosition = 'center bottom'
 * ensures the full product (head-to-toe for apparel / full figurine body)
 * is always visible regardless of the source image's aspect ratio. A light
 * neutral background fills the unused space consistently across all cards.
 */
export const ProductCard = memo(function ProductCard({
  product,
  onClick,
  isNew = false,
}: ProductCardProps) {
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
        // Entrance animation for newly loaded cards only
        animation: isNew ? 'cardFadeSlideIn 350ms ease forwards' : undefined,
      }}
    >
      {/* ── Image ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '133%', // 3 : 4 fixed aspect ratio — equal card heights
          overflow: 'hidden',
          borderRadius: '6px',
          // Light neutral background for contain — consistent across all products
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
            // contain: always shows the full product; never crops
            objectFit: 'contain',
            // bottom-anchor keeps feet at the card base (natural for apparel/figurines)
            objectPosition: 'center bottom',
            // Subtle hover zoom — applied to img, not the container, to avoid
            // overflow artefacts during the contain layout
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

      {/* ── Category label ── */}
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

      {/* ── Name ── */}
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

      {/* ── Price ── */}
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
});
