import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { ROUTES } from '../../app/config/routes';
import { EmptyState } from '../../components/shared/EmptyState';
import { ProductCardSkeleton } from '../../components/shared/LoadingSkeleton';
import { ProductCard } from '../catalog';
import { productService } from '../../services/product';
import { FEATURED_PRODUCTS, type FeaturedProduct } from './featuredProducts';

const FEATURED_PRODUCTS_LIMIT = 4;
const FEATURED_SECTION_BACKGROUND = '#FFFFFF';
const FEATURED_SECTION_TEXT = '#111827';
const FEATURED_SECTION_MUTED = 'rgba(17,24,39,0.66)';
const FEATURED_SECTION_BORDER = 'rgba(17,24,39,0.24)';
const FEATURED_SECTION_BUTTON_HOVER = 'rgba(17,24,39,0.06)';

interface FeaturedProductsSectionProps {
  onProductSelect: (slug: string) => void;
  items?: readonly FeaturedProduct[];
}

function mapFeaturedProducts(config: readonly FeaturedProduct[]): Product[] {
  return config
    .filter((item) => item.enabled)
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .reduce<Product[]>((products, item) => {
      const product = productService.getCachedProductById(item.productId);
      if (!product) {
        return products;
      }

      products.push({
        ...product,
        imageUrl: item.imageOverride || product.imageUrl,
        name: item.titleOverride || product.name,
        description: item.subtitleOverride || product.description,
        shortDescription: item.subtitleOverride || product.shortDescription,
      });

      return products;
    }, []);
}

export function FeaturedProductsSection({
  onProductSelect,
  items = FEATURED_PRODUCTS,
}: FeaturedProductsSectionProps) {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const enabledItems = useMemo(() => {
    return items
      .filter((item) => item.enabled)
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .slice(0, FEATURED_PRODUCTS_LIMIT);
  }, [items]);

  useEffect(() => {
    const sectionElement = sectionRef.current;
    if (!sectionElement || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    observer.observe(sectionElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadFeaturedProducts = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        await productService.ensureProductsLoaded(enabledItems.map((item) => item.productId));
        const products = mapFeaturedProducts(enabledItems);

        if (isCancelled) {
          return;
        }

        setFeaturedProducts(products);
      } catch {
        if (isCancelled) {
          return;
        }

        setErrorMessage('Unable to load featured products right now. Please try again.');
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadFeaturedProducts();

    return () => {
      isCancelled = true;
    };
  }, [enabledItems]);

  const handleSeeMore = useCallback(() => {
    navigate(ROUTES.COLLECTION);
  }, [navigate]);

  const mobileScrollerStyles = useMemo(() => ({
    msOverflowStyle: 'none' as const,
    scrollbarWidth: 'none' as const,
  }), []);

  return (
    <section
      id="featured-products-section"
      ref={sectionRef}
      aria-label="Featured products"
      style={{
        position: 'relative',
        backgroundColor: FEATURED_SECTION_BACKGROUND,
        color: FEATURED_SECTION_TEXT,
        padding: '0 0 clamp(80px, 10vw, 128px)',
        overflow: 'hidden',
      }}
    >
      <style>
        {`
          .featured-products-mobile-scroll::-webkit-scrollbar {
            display: none;
            width: 0;
            height: 0;
          }
        `}
      </style>

      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 clamp(20px, 4vw, 48px)',
          boxSizing: 'border-box',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 28px, 0)',
          transition: 'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'opacity, transform',
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: '12px',
            justifyItems: 'center',
            textAlign: 'center',
            marginBottom: 'clamp(32px, 5vw, 52px)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              fontFamily: "'Chakra-petch', sans-serif",
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: FEATURED_SECTION_MUTED,
            }}
          >
            Featured Products
          </p>
          <h2
            style={{
              margin: 0,
              fontFamily: "'SF-Pro-Display', sans-serif",
              fontSize: 'clamp(34px, 5vw, 68px)',
              lineHeight: 0.98,
              letterSpacing: '-0.04em',
              fontWeight: 400,
              maxWidth: '800px',
              color: FEATURED_SECTION_TEXT,
            }}
          >
            Purpose Meets <span style={{ fontWeight: 700 }}>Performance</span>.
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4" style={{ display: 'grid', gap: '24px 18px' }}>
            {Array.from({ length: FEATURED_PRODUCTS_LIMIT }).map((_, index) => <ProductCardSkeleton key={index} />)}
          </div>
        ) : null}

        {!isLoading && errorMessage ? (
          <EmptyState
            title="Unable to load featured products"
            description={errorMessage}
          />
        ) : null}

        {!isLoading && !errorMessage && featuredProducts.length === 0 ? (
          <EmptyState
            title="Featured products are coming soon"
            description="Check back soon for selected pieces from the latest ONEMISSION collection."
          />
        ) : null}

        {!isLoading && !errorMessage && featuredProducts.length > 0 ? (
          <>
            <div
              className="featured-products-mobile-scroll flex gap-4 overflow-x-auto pb-2 sm:hidden"
              style={{
                ...mobileScrollerStyles,
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="min-w-0 flex-[0_0_78%]"
                  style={{
                    scrollSnapAlign: 'start',
                    scrollSnapStop: 'always',
                  }}
                >
                  <ProductCard product={product} onClick={() => onProductSelect(product.slug)} appearance="featured" />
                </div>
              ))}
            </div>

            <div className="hidden sm:grid sm:grid-cols-2 xl:grid-cols-4" style={{ gap: '24px 18px' }}>
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onClick={() => onProductSelect(product.slug)} />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'clamp(36px, 5vw, 56px)' }}>
              <button
                type="button"
                onClick={handleSeeMore}
                style={{
                  minWidth: '180px',
                  padding: '14px 28px',
                  borderRadius: '999px',
                  border: `1px solid ${FEATURED_SECTION_BORDER}`,
                  backgroundColor: 'transparent',
                  color: FEATURED_SECTION_TEXT,
                  fontSize: '14px',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1), background-color 220ms cubic-bezier(0.22, 1, 0.36, 1), border-color 220ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform = 'translate3d(0, -2px, 0)';
                  event.currentTarget.style.backgroundColor = FEATURED_SECTION_BUTTON_HOVER;
                  event.currentTarget.style.borderColor = 'rgba(17,24,39,0.42)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = 'translate3d(0, 0, 0)';
                  event.currentTarget.style.backgroundColor = 'transparent';
                  event.currentTarget.style.borderColor = FEATURED_SECTION_BORDER;
                }}
              >
                See More
              </button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
