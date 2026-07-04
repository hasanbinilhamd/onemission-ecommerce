import { useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Minus, Plus, ShoppingCart } from 'lucide-react';
import type { Product } from '../types';
import { Button } from '../components/shared';
import { ProductCard } from '../features/catalog/ProductCard';
import { EmptyState } from '../components/shared/EmptyState';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { productService } from '../services/product';
import { formatCurrency } from '../utils/formatting';
import { IMAGE_PLACEHOLDER } from '../app/constants';
import { useCartStore } from '../stores';
import { DURATION, EASING } from '../utils/motion';
import { NavigationThemeProvider, useNavigationTheme } from '../features/navigation';

function AccordionSection({ title, children }: { title: string; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #F3F4F6' }}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          color: '#111827',
          textAlign: 'left',
        }}
      >
        {title}
        <ChevronDown
          size={16}
          color="#9CA3AF"
          style={{
            flexShrink: 0,
            transition: `transform ${DURATION.fast}ms ${EASING.standard}`,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      {isOpen && (
        <div
          style={{
            paddingBottom: '20px',
            fontSize: '14px',
            lineHeight: 1.7,
            color: '#4B5563',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function Gallery({ product }: { product: Product }) {
  const images = product.images?.length
    ? product.images
    : [product.imageUrl ?? IMAGE_PLACEHOLDER];

  const [mainIndex, setMainIndex] = useState(0);
  const mainSrc = images[mainIndex] ?? IMAGE_PLACEHOLDER;

  useEffect(() => {
    setMainIndex(0);
  }, [product.id]);

  return (
    <div>
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '125%',
          overflow: 'hidden',
          borderRadius: '10px',
          backgroundColor: '#F5F5F5',
          marginBottom: '12px',
        }}
      >
        <img
          key={mainSrc}
          src={mainSrc}
          alt={product.name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center bottom',
            animation: 'galleryFadeIn 250ms ease forwards',
          }}
        />
      </div>

      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setMainIndex(index)}
              aria-label={`View image ${index + 1}`}
              style={{
                flexShrink: 0,
                width: '72px',
                height: '72px',
                border: index === mainIndex ? '2px solid #111827' : '2px solid transparent',
                borderRadius: '6px',
                overflow: 'hidden',
                backgroundColor: '#F5F5F5',
                cursor: 'pointer',
                padding: 0,
                transition: 'border-color 150ms ease',
              }}
            >
              <img
                src={src}
                alt={`Thumbnail ${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorSelector({
  colors,
  selected,
  onChange,
}: {
  colors: Array<{ name: string; hex: string }>;
  selected: string;
  onChange: (name: string) => void;
}) {
  if (colors.length === 0) return null;
  return (
    <div style={{ marginBottom: '20px' }}>
      <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 600, color: '#374151', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Color — <span style={{ fontWeight: 400, textTransform: 'none' }}>{selected}</span>
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {colors.map((color) => (
          <button
            key={color.name}
            type="button"
            onClick={() => onChange(color.name)}
            title={color.name}
            aria-label={`Select color ${color.name}`}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: color.hex,
              border: selected === color.name ? '3px solid #111827' : '2px solid #E5E7EB',
              cursor: 'pointer',
              outline: selected === color.name ? '2px solid #fff' : 'none',
              outlineOffset: '-4px',
              transition: 'border-color 150ms ease, transform 150ms ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }}
            onMouseEnter={(event) => { event.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(event) => { event.currentTarget.style.transform = 'scale(1)'; }}
          />
        ))}
      </div>
    </div>
  );
}

function SizeSelector({
  sizes,
  selected,
  onChange,
}: {
  sizes: string[];
  selected: string;
  onChange: (size: string) => void;
}) {
  if (sizes.length === 0) return null;
  return (
    <div style={{ marginBottom: '20px' }}>
      <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 600, color: '#374151', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Size — <span style={{ fontWeight: 400, textTransform: 'none' }}>{selected}</span>
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onChange(size)}
            style={{
              padding: '7px 16px',
              border: selected === size ? '1.5px solid #111827' : '1.5px solid #E5E7EB',
              borderRadius: '6px',
              backgroundColor: selected === size ? '#111827' : '#fff',
              color: selected === size ? '#fff' : '#374151',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}

if (typeof document !== 'undefined') {
  const styleId = 'om-gallery-keyframes';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes galleryFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}

function ProductDetailContent() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromCatalog = location.state?.fromCatalog === true;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const { addItem } = useCartStore();
  const { colors } = useNavigationTheme();

  const loadProduct = useCallback(async () => {
    if (!slug) {
      setProduct(null);
      setRelatedProducts([]);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const detail = await productService.getProductDetail(slug);
      setProduct(detail);

      if (!detail) {
        setRelatedProducts([]);
        return;
      }

      const categoryProducts = await productService.getProducts({
        category: detail.category?.slug,
        limit: 8,
        sort: 'newest',
      });

      const sameCategory = categoryProducts.products.filter((entry) => entry.id !== detail.id);

      if (sameCategory.length >= 4) {
        setRelatedProducts(sameCategory.slice(0, 4));
        return;
      }

      const fallbackProducts = await productService.getProducts({
        limit: 12,
        sort: 'newest',
      });

      const fallback = fallbackProducts.products.filter((entry) => entry.id !== detail.id && !sameCategory.some((item) => item.id === entry.id));
      setRelatedProducts([...sameCategory, ...fallback].slice(0, 4));
    } catch {
      setErrorMessage('Unable to load product details right now. Please try again.');
      setProduct(null);
      setRelatedProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  const uniqueColors = useMemo(() => {
    if (!product?.variants) return [];
    const seen = new Set<string>();
    return product.variants
      .filter((variant) => variant.color && !seen.has(variant.color) && seen.add(variant.color))
      .map((variant) => ({ name: variant.color!, hex: variant.colorHex ?? '#9CA3AF' }));
  }, [product]);

  const uniqueSizes = useMemo(() => {
    if (!product?.variants) return [];
    const seen = new Set<string>();
    return product.variants
      .filter((variant) => variant.size && !seen.has(variant.size) && seen.add(variant.size))
      .map((variant) => variant.size!);
  }, [product]);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    setQty(1);
    setSelectedColor(uniqueColors[0]?.name ?? '');
    setSelectedSize(uniqueSizes[0] ?? '');
  }, [product?.id, uniqueColors, uniqueSizes]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return undefined;

    return product.variants.find((variant) => {
      const colorMatches = selectedColor ? variant.color === selectedColor : true;
      const sizeMatches = selectedSize ? variant.size === selectedSize : true;
      return colorMatches && sizeMatches;
    })
      ?? product.variants.find((variant) => (selectedColor ? variant.color === selectedColor : false))
      ?? product.variants.find((variant) => (selectedSize ? variant.size === selectedSize : false))
      ?? product.variants[0];
  }, [product, selectedColor, selectedSize]);

  const displaySku = selectedVariant?.sku ?? product?.sku;
  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;

  const handleBack = useCallback(() => {
    if (fromCatalog) {
      navigate('/', { state: { restoreCatalog: true } });
      return;
    }

    navigate('/');
  }, [fromCatalog, navigate]);

  const handleRelatedClick = useCallback((nextProduct: Product) => {
    navigate(`/product/${nextProduct.slug}`, { state: { fromCatalog } });
  }, [fromCatalog, navigate]);

  const decrement = useCallback(() => setQty((current) => Math.max(1, current - 1)), []);
  const increment = useCallback(() => setQty((current) => current + 1), []);

  const handleAddToCart = useCallback(() => {
    if (!product) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity: qty,
    });
  }, [addItem, product, qty, selectedColor, selectedSize, selectedVariant]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fff', padding: '24px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <LoadingSkeleton className="h-6 w-32 rounded mb-8" />
          <div className="lg:grid lg:grid-cols-5 lg:gap-12">
            <div className="lg:col-span-3">
              <LoadingSkeleton className="w-full rounded-xl mb-4" rows={1} />
              <div style={{ paddingBottom: '120%', backgroundColor: '#F3F4F6', borderRadius: '10px', marginBottom: '16px' }} />
            </div>
            <div className="lg:col-span-2 mt-8 lg:mt-0">
              <LoadingSkeleton rows={6} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
          <button type="button" onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState
            title="Unable to load product"
            description={errorMessage}
            action={<Button onClick={() => void loadProduct()}>Retry</Button>}
          />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
          <button type="button" onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState title="Product not found" description="This product may have been removed or the link is incorrect." />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #F3F4F6',
          padding: '0 24px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <button
          type="button"
          onClick={handleBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            color: colors.muted,
            padding: '6px 0',
            transition: `color ${DURATION.fast}ms ease`,
          }}
          onMouseEnter={(event) => { event.currentTarget.style.color = colors.foreground; }}
          onMouseLeave={(event) => { event.currentTarget.style.color = colors.muted; }}
        >
          <ArrowLeft size={16} strokeWidth={2} />
          {fromCatalog ? 'Back to Collection' : 'Back'}
        </button>

        <p className="hidden sm:block" style={{ fontSize: '12px', color: colors.muted, flex: 1, textAlign: 'center' }}>
          {product.category?.name ?? 'Products'} / <span style={{ color: colors.foreground }}>{product.name}</span>
        </p>

        <div style={{ width: '120px' }} />
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>
        <div className="lg:grid lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-3" style={{ marginBottom: '32px' }}>
            <Gallery product={product} />
          </div>

          <div className="lg:col-span-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              {product.category && (
                <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF' }}>
                  {product.category.name}
                </span>
              )}
              {displaySku && (
                <span style={{ fontSize: '11px', color: '#D1D5DB' }}>·</span>
              )}
              {displaySku && (
                <span style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'monospace' }}>
                  {displaySku}
                </span>
              )}
            </div>

            <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
              {product.name}
            </h1>

            <p style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 600, color: '#111827' }}>
              {formatCurrency(displayPrice)}
            </p>

            {product.description && (
              <p style={{ margin: '0 0 28px', fontSize: '14px', lineHeight: 1.6, color: '#6B7280' }}>
                {product.description}
              </p>
            )}

            <div style={{ height: '1px', backgroundColor: '#F3F4F6', marginBottom: '24px' }} />

            <ColorSelector colors={uniqueColors} selected={selectedColor} onChange={setSelectedColor} />
            <SizeSelector sizes={uniqueSizes} selected={selectedSize} onChange={setSelectedSize} />

            <div style={{ marginBottom: '24px' }}>
              <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 600, color: '#374151', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Quantity
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={decrement}
                  aria-label="Decrease quantity"
                  disabled={qty <= 1}
                  style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: qty > 1 ? 'pointer' : 'default', color: qty > 1 ? '#374151' : '#D1D5DB', transition: 'color 150ms ease' }}
                >
                  <Minus size={14} strokeWidth={2} />
                </button>
                <span style={{ minWidth: '44px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#111827', borderLeft: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB', height: '40px', lineHeight: '40px' }}>
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={increment}
                  aria-label="Increase quantity"
                  style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#374151', transition: 'color 150ms ease' }}
                >
                  <Plus size={14} strokeWidth={2} />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '15px 24px',
                backgroundColor: '#111827',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                transition: `background-color ${DURATION.fast}ms ease`,
              }}
              onMouseEnter={(event) => { event.currentTarget.style.backgroundColor = '#1F2937'; }}
              onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = '#111827'; }}
            >
              <ShoppingCart size={16} strokeWidth={2} />
              Add to Cart
            </button>

            <p style={{ margin: '12px 0 0', textAlign: 'center', fontSize: '12px', color: '#9CA3AF' }}>
              {product.stockStatus === 'OUT_OF_STOCK'
                ? 'Currently out of stock'
                : 'Free shipping on orders above Rp 300.000'}
            </p>
          </div>
        </div>

        <div style={{ marginTop: '56px', borderTop: '1px solid #F3F4F6', maxWidth: '720px' }}>
          <AccordionSection title="Description">
            <p>{product.longDescription ?? product.description ?? 'No description available.'}</p>
          </AccordionSection>

          <AccordionSection title="Materials">
            <p>{product.materials ?? 'Material information will be added soon.'}</p>
          </AccordionSection>

          <AccordionSection title="Care Instructions">
            <p>{product.care ?? 'Care information will be added soon.'}</p>
          </AccordionSection>

          <AccordionSection title="Shipping Information">
            <p>{product.shipping ?? 'Shipping information will be added soon.'}</p>
          </AccordionSection>
        </div>

        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '72px' }}>
            <h2
              style={{
                margin: '0 0 24px',
                fontSize: '18px',
                fontWeight: 700,
                color: '#111827',
                letterSpacing: '-0.01em',
              }}
            >
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4" style={{ display: 'grid', gap: '20px 16px' }}>
              {relatedProducts.map((entry) => (
                <ProductCard key={entry.id} product={entry} onClick={handleRelatedClick} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductDetailPage() {
  return (
    <NavigationThemeProvider theme="dark">
      <ProductDetailContent />
    </NavigationThemeProvider>
  );
}
