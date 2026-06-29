import { useState, useEffect, useMemo } from 'react';
import type { Product } from '../../types';
import { Drawer } from '../../components/shared/Drawer';
import { EmptyState } from '../../components/shared/EmptyState';
import { ProductCardSkeleton } from '../../components/shared/LoadingSkeleton';
import { useDebounce } from '../../hooks';
import { MOCK_PRODUCTS } from '../../mocks/products';
import { MOCK_CATEGORIES } from '../../mocks/categories';
import { ProductCard } from './ProductCard';
import { FilterDrawer, DEFAULT_FILTERS } from './FilterDrawer';
import type { FilterState } from './FilterDrawer';

// ─── Types ────────────────────────────────────────────────────────────────────

type SortOption = 'newest' | 'best_selling' | 'price_asc' | 'price_desc';

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest',
  best_selling: 'Best Selling',
  price_asc: 'Price: Low → High',
  price_desc: 'Price: High → Low',
};

const PAGE_SIZE = 8;

// ─── Props ────────────────────────────────────────────────────────────────────

interface CatalogDrawerProps {
  open: boolean;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type CategoryChip = { id: string | null; name: string };

const ALL_CHIP: CategoryChip = { id: null, name: 'All' };

function countActiveFilters(f: FilterState): number {
  return f.colors.length + f.sizes.length + (f.minPrice > 0 ? 1 : 0) + (f.maxPrice < 999999 ? 1 : 0);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CatalogDrawer({ open, onClose }: CatalogDrawerProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // Simulate loading + reset state when drawer opens/closes
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      const t = setTimeout(() => setIsLoading(false), 700);
      return () => clearTimeout(t);
    } else {
      setSearch('');
      setActiveCategory(null);
      setSort('newest');
      setVisibleCount(PAGE_SIZE);
      setSelectedProduct(null);
      setFilterOpen(false);
    }
  }, [open]);

  // Reset visible count when filter/search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearch, activeCategory, sort, filters]);

  // ─── Derived data ────────────────────────────────────────────────────────────

  const categoryChips: CategoryChip[] = useMemo(
    () => [ALL_CHIP, ...MOCK_CATEGORIES.map(c => ({ id: c.id, name: c.name }))],
    [],
  );

  const filtered = useMemo(() => {
    let list = [...MOCK_PRODUCTS];

    // Category
    if (activeCategory !== null) {
      list = list.filter(p => p.category?.id === activeCategory);
    }

    // Search
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some(tag => tag.includes(q)),
      );
    }

    // Filters
    if (filters.colors.length > 0) {
      list = list.filter(p =>
        filters.colors.some(c => p.tags?.includes(c.toLowerCase())),
      );
    }
    if (filters.sizes.length > 0) {
      list = list.filter(p =>
        p.variants?.some(v => filters.sizes.includes(v.size ?? '')),
      );
    }
    if (filters.minPrice > 0) {
      list = list.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice < 999999) {
      list = list.filter(p => p.price <= filters.maxPrice);
    }

    // Sort
    switch (sort) {
      case 'price_asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'best_selling':
        list.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        break;
    }

    return list;
  }, [activeCategory, debouncedSearch, sort, filters]);

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const activeFilterCount = countActiveFilters(filters);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount(c => c + PAGE_SIZE);
      setIsLoading(false);
    }, 400);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleDismissNotice = () => {
    setSelectedProduct(null);
  };

  const handleApplyFilters = (f: FilterState) => {
    setFilters(f);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // ─── Styles ───────────────────────────────────────────────────────────────────

  const chipStyle = (active: boolean): React.CSSProperties => ({
    flexShrink: 0,
    padding: '5px 14px',
    borderRadius: '20px',
    border: active ? '1px solid #111827' : '1px solid #E5E7EB',
    backgroundColor: active ? '#111827' : '#fff',
    color: active ? '#fff' : '#374151',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 150ms ease',
    whiteSpace: 'nowrap' as const,
  });

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <Drawer open={open} onClose={onClose} position="left" width="full" title="Collection">

      {/* ── Sticky toolbar ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: '#fff',
          borderBottom: '1px solid #F3F4F6',
          padding: '12px 20px',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search products"
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 150ms ease',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#111827'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
          />
        </div>

        {/* Category chips + Sort + Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Category chips (scrollable) */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              flex: 1,
              overflowX: 'auto',
              paddingBottom: '2px',
              scrollbarWidth: 'none',
            }}
          >
            {categoryChips.map(cat => (
              <button
                key={cat.id ?? 'all'}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                style={chipStyle(activeCategory === cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            aria-label="Sort products"
            style={{
              flexShrink: 0,
              padding: '6px 8px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '12px',
              cursor: 'pointer',
              outline: 'none',
              backgroundColor: '#fff',
            }}
          >
            {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* Filter button */}
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            aria-label="Open filters"
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              border: activeFilterCount > 0 ? '1px solid #111827' : '1px solid #E5E7EB',
              borderRadius: '8px',
              backgroundColor: activeFilterCount > 0 ? '#111827' : '#fff',
              color: activeFilterCount > 0 ? '#fff' : '#374151',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
        </div>
      </div>

      {/* ── Content area ───────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 20px 40px' }}>

        {/* Product count */}
        {!isLoading && (
          <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#9CA3AF' }}>
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
          </p>
        )}

        {/* Product Detail coming-soon notice */}
        {selectedProduct && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '20px',
              padding: '14px 16px',
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
            }}
          >
            <div>
              <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                {selectedProduct.name}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                Product Detail will be available in the next sprint.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDismissNotice}
              aria-label="Dismiss notice"
              style={{
                flexShrink: 0,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: '#9CA3AF',
                fontSize: '16px',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" style={{ gap: '16px', display: 'grid' }}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <EmptyState
            title="No products found"
            description="Try adjusting your search, category, or filters to find what you're looking for."
          />
        )}

        {/* Product grid */}
        {!isLoading && filtered.length > 0 && (
          <>
            <div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              style={{ display: 'grid', gap: '20px 16px' }}
            >
              {visibleProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={handleProductClick}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && !isLoading && (
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button
                  type="button"
                  onClick={handleLoadMore}
                  style={{
                    padding: '11px 40px',
                    border: '1px solid #111827',
                    borderRadius: '4px',
                    backgroundColor: 'transparent',
                    color: '#111827',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'background-color 150ms ease, color 150ms ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#111827';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#111827';
                  }}
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Drawer (bottom sheet, nested) */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </Drawer>
  );
}
