import { Heart } from 'lucide-react';
import { memo, useEffect, useMemo, useState, type MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { ROUTES } from '../../app/config/routes';
import { IMAGE_PLACEHOLDER } from '../../app/constants';
import { formatCurrency } from '../../utils/formatting';
import { mapProductToWishlistItem, setPendingWishlistItem } from '../../services/wishlist/wishlistStorage';
import { useAuthenticatedCustomer, useWishlist } from '../customer';
import { useMediaQuery } from '../../hooks';

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
  appearance?: 'default' | 'collection' | 'featured';
  imageOnly?: boolean;
}

export const ProductCard = memo(function ProductCard({
  product,
  onClick,
  isNew = false,
  appearance = 'default',
  imageOnly = false,
}: ProductCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthenticatedCustomer();
  const { isWishlisted, toggleItem } = useWishlist();
  const supportsHoverPreview = useMediaQuery('(hover: hover) and (pointer: fine)');
  const wishlisted = isWishlisted(product.id);
  const imageSurfaceBackground = appearance === 'featured'
    ? '#E5E4E2'
    : appearance === 'collection'
      ? '#F3F4F6'
      : '#FFFFFF';

  const [isHovered, setIsHovered] = useState(false);
  const [thumbnailLoadFailed, setThumbnailLoadFailed] = useState(false);
  const [hoverImageReady, setHoverImageReady] = useState(false);

  const thumbnailSrc = useMemo(() => {
    if (thumbnailLoadFailed) {
      return IMAGE_PLACEHOLDER;
    }

    const candidate = String(product.imageUrl || '').trim();
    return candidate || IMAGE_PLACEHOLDER;
  }, [product.imageUrl, thumbnailLoadFailed]);

  const hoverSrc = useMemo(() => {
    const candidate = String(product.hoverImageUrl || '').trim();
    return candidate || thumbnailSrc;
  }, [product.hoverImageUrl, thumbnailSrc]);

  const hasDedicatedHoverImage = useMemo(() => {
    const candidate = String(product.hoverImageUrl || '').trim();
    return Boolean(candidate) && candidate !== thumbnailSrc;
  }, [product.hoverImageUrl, thumbnailSrc]);

  useEffect(() => {
    setIsHovered(false);
    setThumbnailLoadFailed(false);
  }, [product.id, product.imageUrl]);

  useEffect(() => {
    if (!supportsHoverPreview || !hasDedicatedHoverImage) {
      setHoverImageReady(false);
      return undefined;
    }

    setHoverImageReady(false);

    let isActive = true;
    const image = new Image();

    image.onload = () => {
      if (isActive) {
        setHoverImageReady(true);
      }
    };
    image.onerror = () => {
      if (isActive) {
        setHoverImageReady(false);
      }
    };
    image.src = hoverSrc;

    return () => {
      isActive = false;
    };
  }, [hasDedicatedHoverImage, hoverSrc, supportsHoverPreview]);

  const showHoverImage = supportsHoverPreview && isHovered && hoverImageReady && hasDedicatedHoverImage;

  const handleWishlistClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      setPendingWishlistItem(mapProductToWishlistItem(product));
      navigate(ROUTES.LOGIN, {
        state: {
          redirectTo: `${location.pathname}${location.search}${location.hash}`,
          restoreCatalog: location.pathname === ROUTES.HOME,
          toastMessage: 'Please login to save this product to your wishlist.',
        },
      });
      return;
    }

    toggleItem(product);
  };

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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
            backgroundColor: imageSurfaceBackground,
            marginBottom: imageOnly ? 0 : '10px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 320ms cubic-bezier(0.4,0,0.2,1)',
                willChange: 'transform',
              }}
            >
              <img
                src={thumbnailSrc}
                alt={product.name}
                loading="lazy"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center center',
                  opacity: showHoverImage ? 0 : 1,
                  transition: 'opacity 300ms ease',
                }}
                onError={() => {
                  setThumbnailLoadFailed(true);
                }}
              />
              {hasDedicatedHoverImage ? (
                <img
                  src={hoverSrc}
                  alt={product.name}
                  aria-hidden="true"
                  loading="lazy"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center center',
                    opacity: showHoverImage ? 1 : 0,
                    transition: 'opacity 300ms ease',
                    pointerEvents: 'none',
                  }}
                  onError={() => {
                    setHoverImageReady(false);
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>

        <div
          style={{
            opacity: imageOnly ? 0 : 1,
            maxHeight: imageOnly ? 0 : '96px',
            overflow: 'hidden',
            transition: 'opacity 230ms ease-out, max-height 230ms ease-out',
          }}
          className="px-3"
        >
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
        </div>
      </button>

      {!imageOnly ? (
        <button
          type="button"
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          onClick={handleWishlistClick}
          className={`absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${wishlisted ? 'border-black bg-black text-white' : 'border-white/80 bg-white/90 text-neutral-700 hover:bg-white'}`}
        >
          <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      ) : null}
    </div>
  );
});
