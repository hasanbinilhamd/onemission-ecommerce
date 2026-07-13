import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Product } from '../../types';
import { Button } from '../../components/shared';
import { EmptyState } from '../../components/shared/EmptyState';
import { ProductCardSkeleton } from '../../components/shared/LoadingSkeleton';
import { useDebounce } from '../../hooks';
import { productService } from '../../services/product';
import { ProductCard } from './ProductCard';
import { FilterDrawer, DEFAULT_FILTERS } from './FilterDrawer';
import type { FilterState } from './FilterDrawer';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
type CategoryChip = { id: string | null; name: string };

type CatalogLayerState = {
  search: string;
  activeCategory: string | null;
  sort: SortOption;
  filters: FilterState;
  visibleCount: number;
};

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
const HOME_CATALOG_STATE_KEY = 'om-home-catalog-state';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function countActiveFilters(filters: FilterState): number {
  return (
    filters.colors.length
    + filters.sizes.length
    + (filters.minPrice > 0 ? 1 : 0)
    + (filters.maxPrice < 999999 ? 1 : 0)
  );
}

function matchesColor(product: Product, colors: string[]): boolean {
  if (colors.length === 0) return true;

  return product.variants?.some((variant) => {
    return Boolean(variant.color) && colors.includes(variant.color!);
  }) ?? false;
}

function matchesSize(product: Product, sizes: string[]): boolean {
  if (sizes.length === 0) return true;

  return product.variants?.some((variant) => {
    return Boolean(variant.size) && sizes.includes(variant.size!);
  }) ?? false;
}

function readCatalogLayerState(): CatalogLayerState {
  if (typeof window === 'undefined') {
    return {
      search: '',
      activeCategory: null,
      sort: 'newest',
      filters: { ...DEFAULT_FILTERS, colors: [...DEFAULT_FILTERS.colors], sizes: [...DEFAULT_FILTERS.sizes] },
      visibleCount: PAGE_SIZE,
    };
  }

  try {
    const rawState = window.sessionStorage.getItem(HOME_CATALOG_STATE_KEY);
    if (!rawState) {
      return {
        search: '',
        activeCategory: null,
        sort: 'newest',
        filters: { ...DEFAULT_FILTERS, colors: [...DEFAULT_FILTERS.colors], sizes: [...DEFAULT_FILTERS.sizes] },
        visibleCount: PAGE_SIZE,
      };
    }

    const parsedState = JSON.parse(rawState) as Partial<CatalogLayerState>;
    return {
      search: typeof parsedState.search === 'string' ? parsedState.search : '',
      activeCategory: typeof parsedState.activeCategory === 'string' ? parsedState.activeCategory : null,
      sort: parsedState.sort && parsedState.sort in SORT_LABELS ? parsedState.sort : 'newest',
      filters: {
        colors: Array.isArray(parsedState.filters?.colors) ? parsedState.filters!.colors : [...DEFAULT_FILTERS.colors],
        sizes: Array.isArray(parsedState.filters?.sizes) ? parsedState.filters!.sizes : [...DEFAULT_FILTERS.sizes],
        minPrice: Number.isFinite(parsedState.filters?.minPrice) ? Number(parsedState.filters?.minPrice) : DEFAULT_FILTERS.minPrice,
        maxPrice: Number.isFinite(parsedState.filters?.maxPrice) ? Number(parsedState.filters?.maxPrice) : DEFAULT_FILTERS.maxPrice,
      },
      visibleCount: Number.isFinite(parsedState.visibleCount) && Number(parsedState.visibleCount) > 0
        ? Number(parsedState.visibleCount)
        : PAGE_SIZE,
    };
  } catch {
    return {
      search: '',
      activeCategory: null,
      sort: 'newest',
      filters: { ...DEFAULT_FILTERS, colors: [...DEFAULT_FILTERS.colors], sizes: [...DEFAULT_FILTERS.sizes] },
      visibleCount: PAGE_SIZE,
    };
  }
}

function persistCatalogLayerState(state: CatalogLayerState): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(HOME_CATALOG_STATE_KEY, JSON.stringify(state));
}

interface CatalogLayerProps {
  revealProgress?: number;
  onProductSelect: (slug: string) => void;
}

export function CatalogLayer({ revealProgress = 0, onProductSelect }: CatalogLayerProps) {
  const restoredStateRef = useRef<CatalogLayerState>(readCatalogLayerState());
  const hasHydratedRef = useRef(false);
  const visibleCountRef = useRef(restoredStateRef.current.visibleCount);

  const [search, setSearch] = useState(restoredStateRef.current.search);
  const [activeCategory, setActiveCategory] = useState<string | null>(restoredStateRef.current.activeCategory);
  const [sort, setSort] = useState<SortOption>(restoredStateRef.current.sort);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    colors: [...restoredStateRef.current.filters.colors],
    sizes: [...restoredStateRef.current.filters.sizes],
    minPrice: restoredStateRef.current.filters.minPrice,
    maxPrice: restoredStateRef.current.filters.maxPrice,
  });
  const [visibleCount, setVisibleCount] = useState(restoredStateRef.current.visibleCount);
  const [serverProducts, setServerProducts] = useState<Product[]>([]);
  const [categoryChips, setCategoryChips] = useState<CategoryChip[]>([ALL_CHIP]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newProductIds, setNewProductIds] = useState<ReadonlySet<string>>(new Set());

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    visibleCountRef.current = visibleCount;
  }, [visibleCount]);

  useEffect(() => {
    persistCatalogLayerState({
      search,
      activeCategory,
      sort,
      filters,
      visibleCount,
    });
  }, [activeCategory, filters, search, sort, visibleCount]);

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
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }

    setVisibleCount(PAGE_SIZE);
    setNewProductIds(new Set());
  }, [debouncedSearch, activeCategory, sort, filters]);

  const availableColors = useMemo(() => {
    const values = new Set<string>();
    serverProducts.forEach((product) => {
      product.variants?.forEach((variant) => {
        if (variant.color) values.add(variant.color);
      });
    });

    return Array.from(values.values()).sort((left, right) => left.localeCompare(right));
  }, [serverProducts]);

  const availableSizes = useMemo(() => {
    const values = new Set<string>();
    serverProducts.forEach((product) => {
      product.variants?.forEach((variant) => {
        if (variant.size) values.add(variant.size);
      });
    });

    return Array.from(values.values());
  }, [serverProducts]);

  const filtered = useMemo(() => {
    return serverProducts.filter((product) => {
      if (!matchesColor(product, filters.colors)) return false;
      if (!matchesSize(product, filters.sizes)) return false;
      return true;
    });
  }, [filters.colors, filters.sizes, serverProducts]);

  const controlsRevealProgress = clamp((revealProgress - 0.08) / 0.42, 0, 1);
  const controlsTranslateY = (1 - controlsRevealProgress) * 16;
  const controlsMaxHeight = 140 * controlsRevealProgress;
  const controlsVisibility = controlsRevealProgress > 0.04 ? 'visible' : 'hidden';

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
    window.setTimeout(() => {
      setNewProductIds(new Set(nextPage.map((product) => product.id)));
      setVisibleCount((count) => count + PAGE_SIZE);
      setIsLoading(false);
    }, 220);
  }, [filtered]);

  const handleApplyFilters = useCallback((nextFilters: FilterState) => {
    setFilters(nextFilters);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      ...DEFAULT_FILTERS,
      colors: [...DEFAULT_FILTERS.colors],
      sizes: [...DEFAULT_FILTERS.sizes],
    });
  }, []);

  const handleRetry = useCallback(() => {
    void loadProducts();
  }, [loadProducts]);

  const chipStyle = useCallback((active: boolean): React.CSSProperties => ({
    flexShrink: 0,
    padding: '6px 14px',
    borderRadius: '999px',
    border: active ? '1px solid #111827' : '1px solid #E5E7EB',
    backgroundColor: active ? '#111827' : '#FFFFFF',
    color: active ? '#FFFFFF' : '#374151',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 180ms ease',
    whiteSpace: 'nowrap',
  }), []);

  return (
    <section
      aria-label="Collection"
      style={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backgroundColor: 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: controlsRevealProgress > 0.98 ? '1px solid rgba(229,231,235,0.92)' : '1px solid rgba(229,231,235,0)',
          padding: '14px 20px 12px',
          transition: 'border-color 180ms ease',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingBottom: controlsRevealProgress > 0.04 ? '10px' : '2px',
            transition: 'padding-bottom 220ms ease',
          }}
        >
          <span
            style={{
              width: '64px',
              height: '5px',
              borderRadius: '999px',
              backgroundColor: 'rgba(17,24,39,0.14)',
            }}
          />
        </div>

        <div
          style={{
            overflow: 'hidden',
            maxHeight: `${controlsMaxHeight}px`,
            opacity: controlsRevealProgress,
            transform: `translate3d(0, ${controlsTranslateY}px, 0)`,
            transition: 'max-height 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease, transform 220ms ease',
            pointerEvents: controlsRevealProgress > 0.08 ? 'auto' : 'none',
            visibility: controlsVisibility,
            willChange: 'max-height, opacity, transform',
          }}
        >
          <div
            style={{
              position: 'relative',
              marginBottom: '14px',
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Search products…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search products"
              style={{
                width: '100%',
                padding: '11px 12px 11px 36px',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 150ms ease',
              }}
              onFocus={(event) => { event.currentTarget.style.borderColor = '#111827'; }}
              onBlur={(event) => { event.currentTarget.style.borderColor = '#E5E7EB'; }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px', flex: 1, overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
              {categoryChips.map((category) => (
                <button
                  key={category.id ?? 'all'}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  style={chipStyle(activeCategory === category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              aria-label="Sort products"
              disabled={isLoadingCategories}
              style={{
                flexShrink: 0,
                padding: '7px 10px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                outline: 'none',
                backgroundColor: '#FFFFFF',
              }}
            >
              {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              aria-label="Open filters"
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                border: activeFilterCount > 0 ? '1px solid #111827' : '1px solid #E5E7EB',
                borderRadius: '8px',
                backgroundColor: activeFilterCount > 0 ? '#111827' : '#FFFFFF',
                color: activeFilterCount > 0 ? '#FFFFFF' : '#374151',
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
      </div>

      <div style={{ padding: controlsRevealProgress > 0.15 ? '20px 20px 56px' : '12px 20px 56px', transition: 'padding 220ms ease' }}>
        {!isLoading && !errorMessage && (
          <p
            style={{
              margin: '0 0 18px',
              fontSize: '12px',
              color: '#9CA3AF',
              opacity: controlsRevealProgress,
              transform: `translate3d(0, ${controlsTranslateY * 0.7}px, 0)`,
              transition: 'opacity 220ms ease, transform 220ms ease',
              pointerEvents: 'none',
            }}
          >
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
                  appearance="collection"
                />
              ))}
            </div>

            {hasMore && (
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
                  onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor = '#111827';
                    event.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor = 'transparent';
                    event.currentTarget.style.color = '#111827';
                  }}
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
    </section>
  );
}
