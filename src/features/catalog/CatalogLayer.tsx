import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Product } from '../../types';
import { useDebounce } from '../../hooks';
import { productService } from '../../services/product';
import { FilterDrawer } from './FilterDrawer';
import { DEFAULT_FILTERS, type FilterState } from './filterState';

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

export function CatalogLayer(props: CatalogLayerProps) {
  void props.revealProgress;
  void props.onProductSelect;

  const restoredStateRef = useRef<CatalogLayerState>(readCatalogLayerState());
  const hasHydratedRef = useRef(false);

  const [search] = useState(restoredStateRef.current.search);
  const [activeCategory] = useState<string | null>(restoredStateRef.current.activeCategory);
  const [sort] = useState<SortOption>(restoredStateRef.current.sort);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    colors: [...restoredStateRef.current.filters.colors],
    sizes: [...restoredStateRef.current.filters.sizes],
    minPrice: restoredStateRef.current.filters.minPrice,
    maxPrice: restoredStateRef.current.filters.maxPrice,
  });
  const [visibleCount, setVisibleCount] = useState(restoredStateRef.current.visibleCount);
  const [serverProducts, setServerProducts] = useState<Product[]>([]);
  const [, setCategoryChips] = useState<CategoryChip[]>([ALL_CHIP]);
  const [, setIsLoading] = useState(false);
  const [, setIsLoadingCategories] = useState(false);
  const [, setErrorMessage] = useState<string | null>(null);
  const [, setNewProductIds] = useState<ReadonlySet<string>>(new Set());

  const debouncedSearch = useDebounce(search, 300);

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

  return (
    <section
      id="onemission-vision"
      aria-label="Collection"
      className="flex flex-col items-center justify-center gap-5 sm:gap-14"
      style={{
        minHeight: '100vh',
        backgroundColor: 'rgba(225,225,225,0.5)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
      }}
    >
      <div className="flex flex-col items-center justify-center">
        <p
          className="w-full bold text-center tracking-widest text-3xl sm:text-4xl md:text-7xl"
          style={{
            fontFamily: "'SF-Pro-Display', sans-serif",
            fontWeight: 400,
            color: '#FFF',
            textShadow: '0px 0px 8px rgba(0, 0, 0, 0.5)',
            opacity: 0.95,
            letterSpacing: '-0.04em',
          }}
        >
          <span className="block sm:inline">We are building </span>
          <span className="block sm:inline">a global movement</span>
        </p>
        <p
          className="w-full bold text-center tracking-widest text-3xl sm:text-4xl md:text-7xl"
          style={{
            fontFamily: "'SF-Pro-Display', sans-serif",
            fontWeight: 400,
            color: '#FFF',
            textShadow: '0px 0px 8px rgba(0, 0, 0, 0.5)',
            opacity: 0.95,
            letterSpacing: '-0.04em',
          }}
        >
          <span className="block sm:inline">that empowers </span>
          <span className="block sm:inline">Muslims to live actively</span>
        </p>
        <p
          className="w-full bold text-center tracking-widest mb-2 sm:mb-3 text-3xl sm:text-4xl md:text-7xl"
          style={{
            fontFamily: "'SF-Pro-Display', sans-serif",
            fontWeight: 400,
            color: '#FFF',
            textShadow: '0px 0px 8px rgba(0, 0, 0, 0.5)',
            opacity: 0.95,
            letterSpacing: '-0.04em',
          }}
        >
          <span className="block sm:inline">while staying true </span>
          <span className="block sm:inline">to their <span style={{ fontWeight: 700 }}>values</span>.</span>
        </p>

        <p
          className="w-full bold text-center tracking-widest text-lg sm:text-2xl md:text-4xl"
          style={{
            marginTop: '50px',
            fontFamily: "'SF-Pro-Display', sans-serif",
            fontWeight: 400,
            color: '#FFF',
            textShadow: '0px 0px 8px rgba(0, 0, 0, 0.3)',
            opacity: 0.95,
            letterSpacing: '-0.01em',
          }}
        >
          <span className="block sm:inline">the story begins in Bandung,</span>
          <span className="block sm:inline">Indonesia.</span>
        </p>
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
