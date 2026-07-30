import type { Category, Product } from '../../types';
import type {
  ProductCategory,
  ProductCollectionResult,
  ProductDetail,
  ProductListQuery,
  ProductProvider,
  ProductSummary,
} from './types';

function buildQueryCacheKey(prefix: string, query: object) {
  return `${prefix}:${JSON.stringify(query)}`;
}

type TimedCacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const COLLECTION_CACHE_TTL_MS = 30_000;
const DETAIL_CACHE_TTL_MS = 60_000;
const CATEGORY_CACHE_TTL_MS = 5 * 60_000;
const SEARCH_CACHE_TTL_MS = 30_000;

export class ProductService {
  private readonly collectionPromiseCache = new Map<string, Promise<ProductCollectionResult>>();
  private readonly collectionResponseCache = new Map<string, TimedCacheEntry<ProductCollectionResult>>();
  private readonly searchPromiseCache = new Map<string, Promise<ProductSummary[]>>();
  private readonly searchResponseCache = new Map<string, TimedCacheEntry<ProductSummary[]>>();
  private readonly detailPromiseCache = new Map<string, Promise<ProductDetail | null>>();
  private readonly detailResponseCache = new Map<string, TimedCacheEntry<ProductDetail | null>>();
  private readonly categoriesPromiseCache = new Map<'categories', Promise<ProductCategory[]>>();
  private readonly categoriesResponseCache = new Map<'categories', TimedCacheEntry<ProductCategory[]>>();
  private readonly productByIdCache = new Map<string, Product>();
  private readonly productBySlugCache = new Map<string, Product>();

  constructor(private readonly provider: ProductProvider) {}

  private cacheProducts(products: Product[]) {
    for (const product of products) {
      this.productByIdCache.set(product.id, product);
      this.productBySlugCache.set(product.slug, product);
    }
  }

  private getCachedValue<T>(cache: Map<string, TimedCacheEntry<T>> | Map<'categories', TimedCacheEntry<T>>, key: string | 'categories'): T | undefined {
    const cached = cache.get(key as never);
    if (!cached) {
      return undefined;
    }

    if (cached.expiresAt <= Date.now()) {
      cache.delete(key as never);
      return undefined;
    }

    return cached.value;
  }

  private setCachedValue<T>(cache: Map<string, TimedCacheEntry<T>> | Map<'categories', TimedCacheEntry<T>>, key: string | 'categories', value: T, ttlMs: number) {
    cache.set(key as never, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  async getProducts(query: ProductListQuery = {}): Promise<ProductCollectionResult> {
    const cacheKey = buildQueryCacheKey('products', query);
    const cachedResponse = this.getCachedValue(this.collectionResponseCache, cacheKey);

    if (cachedResponse !== undefined) {
      return cachedResponse;
    }

    if (this.collectionPromiseCache.has(cacheKey)) {
      return this.collectionPromiseCache.get(cacheKey)!;
    }

    const request = this.provider.getProducts(query).then((response) => {
      this.cacheProducts(response.products);
      this.setCachedValue(this.collectionResponseCache, cacheKey, response, COLLECTION_CACHE_TTL_MS);
      this.collectionPromiseCache.delete(cacheKey);
      return response;
    }).catch((error) => {
      this.collectionPromiseCache.delete(cacheKey);
      throw error;
    });

    this.collectionPromiseCache.set(cacheKey, request);
    return request;
  }

  async getNewArrivalProducts(query: ProductListQuery = {}): Promise<ProductSummary[]> {
    const response = await this.provider.getNewArrivals(query);
    this.cacheProducts(response.products);
    return response.products;
  }

  async searchProducts(query: string, options: Omit<ProductListQuery, 'search'> = {}): Promise<ProductSummary[]> {
    const cacheKey = buildQueryCacheKey('search-products', {
      query,
      ...options,
    });
    const cachedResponse = this.getCachedValue(this.searchResponseCache, cacheKey);

    if (cachedResponse !== undefined) {
      return cachedResponse;
    }

    if (this.searchPromiseCache.has(cacheKey)) {
      return this.searchPromiseCache.get(cacheKey)!;
    }

    const request = this.provider.searchProducts(query, options).then((response) => {
      this.cacheProducts(response.products);
      this.setCachedValue(this.searchResponseCache, cacheKey, response.products, SEARCH_CACHE_TTL_MS);
      this.searchPromiseCache.delete(cacheKey);
      return response.products;
    }).catch((error) => {
      this.searchPromiseCache.delete(cacheKey);
      throw error;
    });

    this.searchPromiseCache.set(cacheKey, request);
    return request;
  }

  async getProductDetail(slug: string, { force = false }: { force?: boolean } = {}): Promise<ProductDetail | null> {
    if (!force) {
      const cachedResponse = this.getCachedValue(this.detailResponseCache, slug);
      if (cachedResponse !== undefined) {
        return cachedResponse;
      }

      if (this.detailPromiseCache.has(slug)) {
        return this.detailPromiseCache.get(slug)!;
      }
    }

    const request = this.provider.getProductDetail(slug).then((response) => {
      if (response) {
        this.productByIdCache.set(response.id, response);
        this.productBySlugCache.set(response.slug, response);
      }

      this.setCachedValue(this.detailResponseCache, slug, response, DETAIL_CACHE_TTL_MS);
      this.detailPromiseCache.delete(slug);
      return response;
    }).catch((error) => {
      this.detailPromiseCache.delete(slug);
      throw error;
    });

    this.detailPromiseCache.set(slug, request);
    return request;
  }

  async getCategories(): Promise<Category[]> {
    const cachedResponse = this.getCachedValue(this.categoriesResponseCache, 'categories');
    if (cachedResponse !== undefined) {
      return cachedResponse;
    }

    if (this.categoriesPromiseCache.has('categories')) {
      return this.categoriesPromiseCache.get('categories')!;
    }

    const request = this.provider.getCategories().then((response) => {
      this.setCachedValue(this.categoriesResponseCache, 'categories', response, CATEGORY_CACHE_TTL_MS);
      this.categoriesPromiseCache.delete('categories');
      return response;
    }).catch((error) => {
      this.categoriesPromiseCache.delete('categories');
      throw error;
    });

    this.categoriesPromiseCache.set('categories', request);
    return request;
  }

  async ensureProductsLoaded(productIds: string[]): Promise<void> {
    const pendingIds = new Set(productIds.filter((id) => !this.productByIdCache.has(id)));
    if (pendingIds.size === 0) {
      return;
    }

    let page = 1;
    let hasNextPage = true;

    while (hasNextPage && pendingIds.size > 0) {
      const response = await this.getProducts({ page, limit: 48, sort: 'newest' });
      response.products.forEach((product) => {
        if (pendingIds.has(product.id)) {
          pendingIds.delete(product.id);
        }
      });

      hasNextPage = response.pagination.hasNextPage;
      page += 1;
    }
  }

  async ensureProductDetailsLoadedByIds(productIds: string[]): Promise<void> {
    await this.ensureProductsLoaded(productIds);

    const detailRequests: Promise<unknown>[] = [];

    for (const productId of productIds) {
      const cached = this.productByIdCache.get(productId);
      if (!cached?.slug) {
        continue;
      }

      const hasVariantDetails = Array.isArray(cached.variants) && cached.variants.length > 0;
      const hasImages = Array.isArray(cached.images) && cached.images.length > 0;
      const hasLongDescription = typeof cached.longDescription === 'string';

      if (hasVariantDetails && hasImages && hasLongDescription) {
        continue;
      }

      detailRequests.push(this.getProductDetail(cached.slug));
    }

    await Promise.all(detailRequests);
  }

  async refreshProductDetailsByIds(productIds: string[]): Promise<void> {
    await this.ensureProductsLoaded(productIds);

    const detailRequests: Promise<unknown>[] = [];

    for (const productId of productIds) {
      const cached = this.productByIdCache.get(productId);
      if (!cached?.slug) {
        continue;
      }

      detailRequests.push(this.getProductDetail(cached.slug, { force: true }));
    }

    await Promise.all(detailRequests);
  }

  getCachedProductById(id: string): Product | null {
    return this.productByIdCache.get(id) ?? null;
  }

  getCachedProductBySlug(slug: string): Product | null {
    return this.productBySlugCache.get(slug) ?? null;
  }
}
