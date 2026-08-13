import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Product } from '../../types';
import { Button } from '../../components/shared';
import { Drawer } from '../../components/shared/Drawer';
import { EmptyState } from '../../components/shared/EmptyState';
import { ProductCardSkeleton } from '../../components/shared/LoadingSkeleton';
import { useDebounce } from '../../hooks';
import { productService } from '../../services/product';
import { ProductCard } from './ProductCard';
import { FilterDrawer } from './FilterDrawer';
import { DEFAULT_FILTERS, type FilterState } from './filterState';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';

type CategoryChip = { id: string | null; name: string };

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest',
  price_asc: 'Price: Low → High',
  price_desc: 'Price: High → Low',
  name_asc: 'Name: A → Z',
  name_desc: 'Name: Z → A',
};

const ALL_CHIP: CategoryChip = { id: null, name: 'All' };
const PAGE_SIZE = 8;
const MAX_REMOTE_LIMIT = 48;

function countActiveFilters(filters: FilterState): number {
  return (
    filters.colors.length
    + filters.sizes.length
    + (filters.minPrice > 0 ? 1 : 0)
    + (filters.maxPrice < 999999 ? 1 : 0)
  );
}

function getCatalogScrollEl(): HTMLElement | null {
  const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-label="Collection"]');
  return (dialog?.lastElementChild as HTMLElement | null) ?? null;
}

function matchesColor(product: Product, colors: string[]): boolean {
  if (colors.length === 0) {
    return true;
  }

  return product.variants?.some((variant) => {
    return Boolean(variant.color) && colors.includes(variant.color!);
  }) ?? false;
}

function matchesSize(product: Product, sizes: string[]): boolean {
  if (sizes.length === 0) {
    return true;
  }

  return product.variants?.some((variant) => {
    return Boolean(variant.size) && sizes.includes(variant.size!);
  }) ?? false;
}

interface CatalogDrawerProps {
  open: boolean;
  openMode?: 'animated' | 'instant';
  onClose: () => void;
  onProductSelect: (slug: string) => void;
}

export function CatalogDrawer({ open, openMode = 'animated', onClose, onProductSelect }: CatalogDrawerProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [serverProducts, setServerProducts] = useState<Product[]>([]);
  const [categoryChips, setCategoryChips] = useState<CategoryChip[]>([ALL_CHIP]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newProductIds, setNewProductIds] = useState<ReadonlySet<string>>(new Set());

  const visibleCountRef = useRef(visibleCount);
  const savedScrollRef = useRef(0);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    visibleCountRef.current = visibleCount;
  }, [visibleCount]);

  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);

    try {
      const categories = await productService.getCategories();
      setCategoryChips([
        ALL_CHIP,
        ...categories.map((category) => ({
          id: category.slug,
          name: category.name,
        })),
      ]);
    } catch {
      setCategoryChips([ALL_CHIP]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await productService.getProducts({
        page: 1,
        limit: MAX_REMOTE_LIMIT,
        search: debouncedSearch || undefined,
        category: activeCategory || undefined,
        sort,
        minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
        maxPrice: filters.maxPrice < 999999 ? filters.maxPrice : undefined,
      });

      setServerProducts(response.products);
    } catch {
      setErrorMessage('Unable to load products right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, debouncedSearch, filters.maxPrice, filters.minPrice, sort]);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      setNewProductIds(new Set());
      void loadCategories();
      void loadProducts();
    } else {
      const scrollEl = getCatalogScrollEl();
      if (scrollEl) savedScrollRef.current = scrollEl.scrollTop;
      setFilterOpen(false);
    }
  }, [loadCategories, loadProducts, open]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setNewProductIds(new Set());
  }, [debouncedSearch, activeCategory, sort, filters]);

  useEffect(() => {
    if (open && !isLoading && savedScrollRef.current > 0) {
      const timer = setTimeout(() => {
        const scrollEl = getCatalogScrollEl();
        if (scrollEl) {
          scrollEl.scrollTop = savedScrollRef.current;
        }
      }, 60);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [isLoading, open]);

  const availableColors = useMemo(() => {
    const values = new Set<string>();
    serverProducts.forEach((product) => {
      product.variants?.forEach((variant) => {
        if (variant.color) {
          values.add(variant.color);
        }
      });
    });

    return Array.from(values.values()).sort((left, right) => left.localeCompare(right));
  }, [serverProducts]);

  const availableSizes = useMemo(() => {
    const values = new Set<string>();
    serverProducts.forEach((product) => {
      product.variants?.forEach((variant) => {
        if (variant.size) {
          values.add(variant.size);
        }
      });
    });

    return Array.from(values.values());
  }, [serverProducts]);

  const filtered = useMemo(() => {
    return serverProducts.filter((product) => {
      if (!matchesColor(product, filters.colors)) {
        return false;
      }

      if (!matchesSize(product, filters.sizes)) {
        return false;
      }

      return true;
    });
  }, [filters.colors, filters.sizes, serverProducts]);

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const activeFilterCount = countActiveFilters(filters);

  const handleProductClick = useCallback((product: Product) => {
    onProductSelect(product.slug);
  }, [onProductSelect]);

  const handleLoadMore = useCallback(() => {
    const currentCount = visibleCountRef.current;
    const nextPage = filtered.slice(currentCount, currentCount + PAGE_SIZE);
    setIsLoading(true);
    setTimeout(() => {
      setNewProductIds(new Set(nextPage.map((product) => product.id)));
      setVisibleCount((count) => count + PAGE_SIZE);
      setIsLoading(false);
    }, 250);
  }, [filtered]);

  const handleApplyFilters = useCallback((nextFilters: FilterState) => {
    setFilters(nextFilters);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleRetry = useCallback(() => {
    void loadProducts();
  }, [loadProducts]);

  const chipStyle = useCallback((active: boolean): React.CSSProperties => ({
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
  }), []);

  return (
    <Drawer
      open={open}
      openMode={openMode}
      onClose={onClose}
      position="bottom"
      width="full"
      title="Collection"
      overlayColor="rgba(8, 15, 26, 0.22)"
      overlayOpacity={0.72}
      panelStyleOverrides={{
        maxHeight: 'min(88dvh, 980px)',
        borderRadius: '28px 28px 0 0',
        boxShadow: '0 -20px 60px rgba(0,0,0,0.24)',
      }}
    >
      <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#fff', borderBottom: '1px solid #F3F4F6', padding: '12px 20px' }}>
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search products"
            style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 150ms ease' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#111827'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px', flex: 1, overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
            {categoryChips.map((category) => (
              <button key={category.id ?? 'all'} type="button" onClick={() => setActiveCategory(category.id)} style={chipStyle(activeCategory === category.id)}>
                {category.name}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            aria-label="Sort products"
            disabled={isLoadingCategories}
            style={{ flexShrink: 0, padding: '6px 8px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', outline: 'none', backgroundColor: '#fff' }}
          >
            {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            aria-label="Open filters"
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', border: activeFilterCount > 0 ? '1px solid #111827' : '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: activeFilterCount > 0 ? '#111827' : '#fff', color: activeFilterCount > 0 ? '#fff' : '#374151', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 150ms ease' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
        </div>
      </div>

      <div style={{ padding: '16px 20px 48px' }}>
        {!isLoading && !errorMessage && (
          <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#9CA3AF' }}>
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
          </p>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" style={{ display: 'grid', gap: '20px 16px' }}>
            {Array.from({ length: PAGE_SIZE }).map((_, index) => <ProductCardSkeleton key={index} />)}
          </div>
        )}

        {!isLoading && errorMessage && (
          <EmptyState
            title="Unable to load products"
            description={errorMessage}
            action={<Button onClick={handleRetry}>Retry</Button>}
          />
        )}

        {!isLoading && !errorMessage && filtered.length === 0 && (
          <EmptyState title="No products found" description="Try adjusting your search, category, or filters." />
        )}

        {!isLoading && !errorMessage && visibleProducts.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" style={{ display: 'grid', gap: '20px 16px' }}>
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={handleProductClick}
                  isNew={newProductIds.has(product.id)}
                />
              ))}
            </div>

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button
                  type="button"
                  onClick={handleLoadMore}
                  style={{ padding: '11px 40px', border: '1px solid #111827', borderRadius: '4px', backgroundColor: 'transparent', color: '#111827', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background-color 150ms ease, color 150ms ease' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#111827'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#111827'; }}
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        availableColors={availableColors}
        availableSizes={availableSizes}
      />
    </Drawer>
  );
}
