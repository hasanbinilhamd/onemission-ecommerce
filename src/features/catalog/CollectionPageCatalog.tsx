import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Product } from '../../types';
import { Button } from '../../components/shared';
import { EmptyState } from '../../components/shared/EmptyState';
import { ProductCardSkeleton } from '../../components/shared/LoadingSkeleton';
import { useDebounce } from '../../hooks';
import { productService } from '../../services/product';
import { ProductCard } from './ProductCard';
import { FilterDrawer } from './FilterDrawer';
import { DEFAULT_FILTERS, type FilterState } from './filterState';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
type CategoryChip = { id: string | null; name: string };
type GridMode = 1 | 2 | 3;

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
const GRID_MODE_STORAGE_KEY = 'collection-grid-mode';
const GRID_MODE_OPTIONS: Array<{ mode: GridMode; label: string; iconColumns: number }> = [
  { mode: 1, label: '3 columns', iconColumns: 1 },
  { mode: 2, label: '4 columns', iconColumns: 2 },
  { mode: 3, label: '6 columns', iconColumns: 3 },
];
const GRID_MODE_CLASSES: Record<GridMode, string> = {
  1: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 md:gap-y-7 gap-x-0',
  2: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-5 md:gap-y-7 gap-x-0',
  3: 'grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1',
};

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

function hasVariantFilterData(product: Product): boolean {
  return product.variants?.some((variant) => Boolean(variant.color || variant.size)) ?? false;
}

async function loadVariantFilterDetails(products: Product[]): Promise<Product[]> {
  return Promise.all(products.map(async (product) => {
    if (!product.hasVariants || hasVariantFilterData(product)) {
      return product;
    }

    try {
      const detail = await productService.getProductDetail(product.slug);
      if (!detail || !hasVariantFilterData(detail)) {
        return product;
      }

      return {
        ...product,
        variants: detail.variants,
      };
    } catch {
      return product;
    }
  }));
}

function getDefaultGridMode(): GridMode {
  if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
    return 2;
  }

  return 1;
}

function readStoredGridMode(): GridMode {
  if (typeof window === 'undefined') {
    return 1;
  }

  const storedValue = Number(window.localStorage.getItem(GRID_MODE_STORAGE_KEY));
  return storedValue === 1 || storedValue === 2 || storedValue === 3
    ? storedValue
    : getDefaultGridMode();
}

interface CollectionPageCatalogProps {
  onProductSelect: (slug: string) => void;
  collectionDescription?: string;
  mode?: 'standalone' | 'homepage';
}

export function CollectionPageCatalog({ onProductSelect, collectionDescription = '', mode = 'standalone' }: CollectionPageCatalogProps) {
  const visibleCountRef = useRef(PAGE_SIZE);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    colors: [...DEFAULT_FILTERS.colors],
    sizes: [...DEFAULT_FILTERS.sizes],
  });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [serverProducts, setServerProducts] = useState<Product[]>([]);
  const [categoryChips, setCategoryChips] = useState<CategoryChip[]>([ALL_CHIP]);
  const [isLoading, setIsLoading] = useState(false);
  const [, setIsLoadingCategories] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newProductIds, setNewProductIds] = useState<ReadonlySet<string>>(new Set());
  const [gridMode, setGridMode] = useState<GridMode>(readStoredGridMode);
  const [modelViewEnabled, setModelViewEnabled] = useState(false);

  const isHomepageMode = mode === 'homepage';
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    visibleCountRef.current = visibleCount;
  }, [visibleCount]);

  useEffect(() => {
    window.localStorage.setItem(GRID_MODE_STORAGE_KEY, String(gridMode));
  }, [gridMode]);

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

      const productsWithVariantFilters = await loadVariantFilterDetails(response.products);
      setServerProducts(productsWithVariantFilters);
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
    setVisibleCount(PAGE_SIZE);
    setNewProductIds(new Set());
  }, [debouncedSearch, activeCategory, sort, filters]);

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
      if (!matchesColor(product, filters.colors)) return false;
      if (!matchesSize(product, filters.sizes)) return false;
      return true;
    });
  }, [filters.colors, filters.sizes, serverProducts]);

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const activeFilterCount = countActiveFilters(filters);
  const gridClassName = GRID_MODE_CLASSES[gridMode];

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
      aria-label={isHomepageMode ? "Homepage collection products" : "Collection page catalog"}
      style={{
        maxWidth: '100%',
        margin: '0 auto',
        padding: isHomepageMode ? 'clamp(28px, 5vw, 56px) 0px 72px' : '20px 0px 72px',
        boxSizing: 'border-box',
        backgroundColor: '#FFFFFF',
      }}
      className="sm:px-8"
    >
      {!isHomepageMode ? (
        <div className="px-5 mb-3 sm:mb-5">
          <p
            style={{
              margin: '0 0 5px',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            Collection
          </p>
          {collectionDescription ? (
            <p
              style={{
                fontSize: '12px',
                lineHeight: 1.7,
                color: '#4B5563',
              }}
              className="max-w-full sm:max-w-[80%]"
            >
              {collectionDescription}
            </p>
          ) : null}
        </div>
      ) : null}

      <div style={{ marginBottom: isHomepageMode ? '22px' : '28px' }} className="px-5">
        {!isHomepageMode ? (
          <div style={{ position: 'relative', marginBottom: '14px' }}>
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
                height: 'clamp(40px, 4.2vw, 44px)',
                padding: '0 12px 0 36px',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 150ms ease',
                backgroundColor: '#FFFFFF',
              }}
              onFocus={(event) => {
                event.currentTarget.style.borderColor = '#111827';
              }}
              onBlur={(event) => {
                event.currentTarget.style.borderColor = '#E5E7EB';
              }}
            />
          </div>
        ) : null}

        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '2px',
            scrollbarWidth: 'none',
            marginBottom: '14px',
          }}
        >
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

        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-x-3 gap-y-2">
          <div
            role="group"
            aria-label="Product grid layout"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {GRID_MODE_OPTIONS.map((option) => {
              const active = gridMode === option.mode;
              return (
                <button
                  key={option.mode}
                  type="button"
                  aria-label={option.label}
                  aria-pressed={active}
                  onClick={() => setGridMode(option.mode)}
                  style={{
                    // border: active ? '1px solid #111827' : '1px solid #E5E7EB',
                    // borderRadius: '8px',
                    // backgroundColor: active ? '#111827' : '#FFFFFF',
                    color: active ? '#374151' : '#aaaaaa',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 180ms ease, color 180ms ease, border-color 180ms ease',
                  }}
                  className="w-6 h-6 md:w-7 md:h-7"
                >
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${option.iconColumns}, 4px)`,
                      gap: '3px',
                    }}
                  >
                    {Array.from({ length: option.iconColumns }).map((_, index) => (
                      <span key={index} style={{ width: '4px', height: '12px', borderRadius: '1px', backgroundColor: 'currentColor' }} />
                    ))}
                  </span>
                </button>
              );
            })}

            <div className='sm:flex hidden ml-2' style={{ alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>Model</span>
              <button
                type="button"
                role="switch"
                aria-label="Model"
                aria-checked={modelViewEnabled}
                onClick={() => setModelViewEnabled((current) => !current)}
                style={{
                  width: '30px',
                  height: '16px',
                  border: modelViewEnabled ? '1px solid #111827' : '1px solid #D1D5DB',
                  borderRadius: '999px',
                  backgroundColor: modelViewEnabled ? '#111827' : '#FFFFFF',
                  padding: '2px',
                  cursor: 'pointer',
                  transition: 'background-color 160ms ease, border-color 160ms ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: modelViewEnabled ? 'flex-end' : 'flex-start',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '999px',
                    backgroundColor: modelViewEnabled ? '#FFFFFF' : '#9CA3AF',
                    transition: 'background-color 160ms ease',
                  }}
                />
              </button>
            </div>
          </div>

          <div className='flex sm:hidden' style={{ alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>Model</span>
            <button
              type="button"
              role="switch"
              aria-label="Model"
              aria-checked={modelViewEnabled}
              onClick={() => setModelViewEnabled((current) => !current)}
              style={{
                width: '30px',
                height: '16px',
                border: modelViewEnabled ? '1px solid #111827' : '1px solid #D1D5DB',
                borderRadius: '999px',
                backgroundColor: modelViewEnabled ? '#111827' : '#FFFFFF',
                padding: '2px',
                cursor: 'pointer',
                transition: 'background-color 160ms ease, border-color 160ms ease',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: modelViewEnabled ? 'flex-end' : 'flex-start',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '999px',
                  backgroundColor: modelViewEnabled ? '#FFFFFF' : '#9CA3AF',
                  transition: 'background-color 160ms ease',
                }}
              />
            </button>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-2">
            
            
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              aria-label="Open filter and sort"
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                height: '30px',
                padding: '6px 10px',
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
              Filter & Sort{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
          </div>
        </div>
      </div>

      {!isLoading && !errorMessage ? (
        <p style={{ margin: '0 20px 20px', fontSize: '12px', color: '#9CA3AF' }}>
          {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
        </p>
      ) : null}

      {isLoading ? (
        <div className={gridClassName} style={{ display: 'grid', transition: 'all 280ms ease-out' }}>
          {Array.from({ length: PAGE_SIZE }).map((_, index) => <ProductCardSkeleton key={index} />)}
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <EmptyState
          title="Unable to load products"
          description={errorMessage}
          action={<Button onClick={handleRetry}>Retry</Button>}
        />
      ) : null}

      {!isLoading && !errorMessage && filtered.length === 0 ? (
        <EmptyState title="No products found" description="Try adjusting your search, category, or filters." />
      ) : null}

      {!isLoading && !errorMessage && visibleProducts.length > 0 ? (
        <>
          <div className={gridClassName} style={{ display: 'grid', transition: 'all 280ms ease-out' }}>
            {visibleProducts.map((product) => (
              <div key={product.id} style={{ minWidth: 0, transition: 'all 280ms ease-out' }}>
                <ProductCard
                  product={product}
                  onClick={handleProductClick}
                  isNew={newProductIds.has(product.id)}
                  appearance="collection"
                  imageOnly={gridMode === 3}
                  modelViewEnabled={modelViewEnabled}
                />
              </div>
            ))}
          </div>

          {hasMore ? (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button
                type="button"
                onClick={handleLoadMore}
                style={{
                  padding: '11px 40px',
                  border: '1px solid #111827',
                  borderRadius: '999px',
                  backgroundColor: 'transparent',
                  color: '#111827',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease, color 150ms ease, transform 150ms ease',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor = '#111827';
                  event.currentTarget.style.color = '#FFFFFF';
                  event.currentTarget.style.transform = 'translate3d(0, -2px, 0)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor = 'transparent';
                  event.currentTarget.style.color = '#111827';
                  event.currentTarget.style.transform = 'translate3d(0, 0, 0)';
                }}
              >
                Load More
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        availableColors={availableColors}
        availableSizes={availableSizes}
        sort={sort}
        sortOptions={(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([value, label]) => ({ value, label }))}
        onSortChange={(value) => setSort(value as SortOption)}
      />
    </section>
  );
}
