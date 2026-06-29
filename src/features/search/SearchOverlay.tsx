import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState, Button } from '../../components/shared';
import { Overlay } from '../../components/shared';
import { useKeyPress, useMediaQuery, useScrollLock } from '../../hooks';
import { DURATION, EASING } from '../../utils/motion';
import { MOCK_PRODUCTS } from '../../mocks/products';
import type { Product } from '../../types';
import { useSearchStore } from '../../stores';
import { SearchInput } from './SearchInput';
import { RecentSearches } from './RecentSearches';
import { TrendingSearches } from './TrendingSearches';
import { PopularProducts } from './PopularProducts';
import { SearchResults } from './SearchResults';

const POPULAR_PRODUCTS = MOCK_PRODUCTS.slice(0, 4);

function matchesSearch(product: Product, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return (
    product.name.toLowerCase().includes(normalized) ||
    product.sku?.toLowerCase().includes(normalized) ||
    product.category?.name.toLowerCase().includes(normalized)
  ) ?? false;
}

export function SearchOverlay() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 639px)');
  const {
    isSearchOpen,
    query,
    recentSearches,
    closeSearch,
    setQuery,
    submitRecentSearch,
    clearQuery,
  } = useSearchStore();

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useScrollLock(isSearchOpen);
  useKeyPress('Escape', closeSearch, isSearchOpen && !isMobile);

  useEffect(() => {
    if (isSearchOpen) {
      setMounted(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    }

    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), DURATION.normal);
    return () => window.clearTimeout(timer);
  }, [isSearchOpen]);

  const trimmedQuery = query.trim();

  const results = useMemo(
    () => MOCK_PRODUCTS.filter((product) => matchesSearch(product, trimmedQuery)),
    [trimmedQuery],
  );

  const handleSelectProduct = (product: Product) => {
    if (trimmedQuery) submitRecentSearch(trimmedQuery);
    closeSearch();
    navigate(`/product/${product.slug}`, { state: { fromCatalog: false } });
  };

  const handleSelectSearch = (value: string) => {
    submitRecentSearch(value);
  };

  if (!mounted) return null;

  return (
    <>
      <Overlay visible={visible} onClick={closeSearch} zIndex={120} className="backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 130,
          display: 'flex',
          justifyContent: 'center',
          padding: isMobile ? 'max(20px, env(safe-area-inset-top)) 16px max(20px, env(safe-area-inset-bottom))' : '48px 24px',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: isMobile ? '100%' : '1120px',
            height: isMobile ? '100%' : 'auto',
            maxHeight: isMobile ? '100%' : 'calc(100vh - 96px)',
            backgroundColor: 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(229,231,235,0.9)',
            borderRadius: isMobile ? '24px' : '28px',
            overflow: 'hidden',
            transform: visible ? 'translate3d(0,0,0)' : 'translate3d(0,10px,0)',
            opacity: visible ? 1 : 0,
            transition: `opacity ${DURATION.normal}ms ${EASING.standard}, transform ${DURATION.normal}ms ${EASING.standard}`,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 32px 80px rgba(17,24,39,0.18)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: isMobile ? '18px 18px 12px' : '24px 24px 16px', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ flex: 1 }}>
              <SearchInput value={query} onChange={setQuery} onClear={clearQuery} autoFocus={isSearchOpen} />
            </div>
            <button
              type="button"
              onClick={closeSearch}
              aria-label="Close search"
              style={{
                border: 'none',
                background: 'none',
                color: '#6B7280',
                width: '40px',
                height: '40px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '18px' : '24px' }}>
            {trimmedQuery ? (
              results.length > 0 ? (
                <div style={{ display: 'grid', gap: '20px', animation: 'searchFade 180ms ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
                      {results.length} result{results.length > 1 ? 's' : ''} for “{trimmedQuery}”
                    </p>
                    <Button type="button" variant="ghost" onClick={() => submitRecentSearch(trimmedQuery)}>
                      Save Search
                    </Button>
                  </div>
                  <SearchResults products={results} onSelect={handleSelectProduct} />
                </div>
              ) : (
                <EmptyState
                  icon={<Search size={34} />}
                  title="No products found."
                  description="Try a different keyword or clear the current search."
                  action={
                    <Button type="button" variant="secondary" onClick={clearQuery}>
                      Clear Search
                    </Button>
                  }
                />
              )
            ) : (
              <div style={{ display: 'grid', gap: '28px' }}>
                <RecentSearches items={recentSearches} onSelect={handleSelectSearch} />
                <TrendingSearches onSelect={handleSelectSearch} />
                <PopularProducts products={POPULAR_PRODUCTS} onSelect={handleSelectProduct} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6B7280', fontSize: '13px' }}>
                  <ArrowRight size={14} />
                  Search by name, SKU, or category.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
