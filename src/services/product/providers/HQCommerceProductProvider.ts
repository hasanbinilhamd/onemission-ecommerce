import { env } from '../../../app/config/env';
import { ProductServiceError } from '../errors';
import {
  mapCommerceCategory,
  mapCommerceProductCard,
  mapCommerceProductDetail,
  mapProductCollectionResult,
} from '../mappers';
import type {
  CommerceCategoryListApiResponse,
  CommerceProductDetailApiResponse,
  CommerceProductListApiResponse,
  ProductCategory,
  ProductCollectionResult,
  ProductDetail,
  ProductListQuery,
  ProductProvider,
} from '../types';

function buildQueryParams(query: object) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    params.set(key, String(value));
  }

  return params;
}

export class HQCommerceProductProvider implements ProductProvider {
  private readonly baseUrl: string;

  constructor() {
    const apiBaseUrl = env.apiBaseUrl.trim().replace(/\/$/, '');
    this.baseUrl = apiBaseUrl ? `${apiBaseUrl}/commerce` : '';
  }

  async getProducts(query: ProductListQuery = {}): Promise<ProductCollectionResult> {
    const response = await this.fetchJson<CommerceProductListApiResponse>('products', query);
    const products = response.data.map(mapCommerceProductCard);
    return mapProductCollectionResult(products, response.pagination, response.filters);
  }

  async getFeaturedProducts(query: ProductListQuery = {}): Promise<ProductCollectionResult> {
    const response = await this.fetchJson<CommerceProductListApiResponse>('products/featured', query);
    const products = response.data.map(mapCommerceProductCard);
    return mapProductCollectionResult(products, response.pagination, response.filters);
  }

  async getNewArrivals(query: ProductListQuery = {}): Promise<ProductCollectionResult> {
    const response = await this.fetchJson<CommerceProductListApiResponse>('products/new-arrivals', query);
    const products = response.data.map(mapCommerceProductCard);
    return mapProductCollectionResult(products, response.pagination, response.filters);
  }

  async searchProducts(query: string, options: Omit<ProductListQuery, 'search'> = {}): Promise<ProductCollectionResult> {
    const response = await this.fetchJson<CommerceProductListApiResponse>('products/search', {
      ...options,
      q: query,
    });
    const products = response.data.map(mapCommerceProductCard);
    return mapProductCollectionResult(products, response.pagination, response.filters);
  }

  async getProductDetail(slug: string): Promise<ProductDetail | null> {
    try {
      const response = await this.fetchJson<CommerceProductDetailApiResponse>(`products/${encodeURIComponent(slug)}`);
      return mapCommerceProductDetail(response.data);
    } catch (error) {
      if (error instanceof ProductServiceError && error.code === 'PRODUCT_NOT_FOUND') {
        return null;
      }

      throw error;
    }
  }

  async getCategories(): Promise<ProductCategory[]> {
    const response = await this.fetchJson<CommerceCategoryListApiResponse>('categories');
    return response.data.map(mapCommerceCategory);
  }

  private async fetchJson<T>(path: string, query: object = {}): Promise<T> {
    if (!this.baseUrl) {
      throw new ProductServiceError(
        'Commerce API base URL is not configured.',
        'PRODUCT_API_CONFIGURATION_MISSING',
        500,
      );
    }

    const queryParams = buildQueryParams(query);
    const url = queryParams.toString()
      ? `${this.baseUrl}/${path}?${queryParams.toString()}`
      : `${this.baseUrl}/${path}`;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.status === 404) {
        throw new ProductServiceError('Product not found.', 'PRODUCT_NOT_FOUND', 404);
      }

      if (!response.ok) {
        throw new ProductServiceError(
          'Commerce product data could not be loaded.',
          'PRODUCT_API_ERROR',
          response.status,
        );
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof ProductServiceError) {
        throw error;
      }

      throw new ProductServiceError(
        'Unable to connect to the Commerce product API.',
        'PRODUCT_NETWORK_ERROR',
        503,
      );
    }
  }
}
