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

export class ProductService {
  private readonly collectionCache = new Map<string, ProductCollectionResult>();
  private readonly collectionPromiseCache = new Map<string, Promise<ProductCollectionResult>>();
  private readonly detailCache = new Map<string, ProductDetail | null>();
  private readonly detailPromiseCache = new Map<string, Promise<ProductDetail | null>>();
  private readonly categoriesCache = new Map<'categories', ProductCategory[]>();
  private readonly categoriesPromiseCache = new Map<'categories', Promise<ProductCategory[]>>();
  private readonly productByIdCache = new Map<string, Product>();
  private readonly productBySlugCache = new Map<string, Product>();

  constructor(private readonly provider: ProductProvider) {}

  private cacheProducts(products: Product[]) {
    for (const product of products) {
      this.productByIdCache.set(product.id, product);
      this.productBySlugCache.set(product.slug, product);
    }
  }

  async getProducts(query: ProductListQuery = {}): Promise<ProductCollectionResult> {
    const cacheKey = buildQueryCacheKey('products', query);
    if (this.collectionCache.has(cacheKey)) {
      return this.collectionCache.get(cacheKey)!;
    }

    if (this.collectionPromiseCache.has(cacheKey)) {
      return this.collectionPromiseCache.get(cacheKey)!;
    }

    const request = this.provider.getProducts(query).then((response) => {
      this.cacheProducts(response.products);
      this.collectionCache.set(cacheKey, response);
      this.collectionPromiseCache.delete(cacheKey);
      return response;
    }).catch((error) => {
      this.collectionPromiseCache.delete(cacheKey);
      throw error;
    });

    this.collectionPromiseCache.set(cacheKey, request);
    return request;
  }

  async getFeaturedProducts(query: ProductListQuery = {}): Promise<ProductSummary[]> {
    const cacheKey = buildQueryCacheKey('featured', query);
    if (this.collectionCache.has(cacheKey)) {
      return this.collectionCache.get(cacheKey)!.products;
    }

    const response = await this.provider.getFeaturedProducts(query);
    this.cacheProducts(response.products);
    this.collectionCache.set(cacheKey, response);
    return response.products;
  }

  async getNewArrivalProducts(query: ProductListQuery = {}): Promise<ProductSummary[]> {
    const cacheKey = buildQueryCacheKey('new-arrivals', query);
    if (this.collectionCache.has(cacheKey)) {
      return this.collectionCache.get(cacheKey)!.products;
    }

    const response = await this.provider.getNewArrivals(query);
    this.cacheProducts(response.products);
    this.collectionCache.set(cacheKey, response);
    return response.products;
  }

  async searchProducts(query: string, options: Omit<ProductListQuery, 'search'> = {}): Promise<ProductSummary[]> {
    const cacheKey = buildQueryCacheKey('search', { query, ...options });
    if (this.collectionCache.has(cacheKey)) {
      return this.collectionCache.get(cacheKey)!.products;
    }

    const response = await this.provider.searchProducts(query, options);
    this.cacheProducts(response.products);
    this.collectionCache.set(cacheKey, response);
    return response.products;
  }

  async getProductDetail(slug: string): Promise<ProductDetail | null> {
    if (this.detailCache.has(slug)) {
      return this.detailCache.get(slug) ?? null;
    }

    if (this.detailPromiseCache.has(slug)) {
      return this.detailPromiseCache.get(slug)!;
    }

    const request = this.provider.getProductDetail(slug).then((response) => {
      if (response) {
        this.detailCache.set(slug, response);
        this.productByIdCache.set(response.id, response);
        this.productBySlugCache.set(response.slug, response);
      } else {
        this.detailCache.set(slug, null);
      }

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
    if (this.categoriesCache.has('categories')) {
      return this.categoriesCache.get('categories')!;
    }

    if (this.categoriesPromiseCache.has('categories')) {
      return this.categoriesPromiseCache.get('categories')!;
    }

    const request = this.provider.getCategories().then((response) => {
      this.categoriesCache.set('categories', response);
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
      const hasLongDescription = typeof cached.longDescription === 'string' && cached.longDescription.length > 0;

      if (hasVariantDetails && hasImages && hasLongDescription) {
        continue;
      }

      detailRequests.push(this.getProductDetail(cached.slug));
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
