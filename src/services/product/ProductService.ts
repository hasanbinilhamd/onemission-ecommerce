import {
  mapProductCategory,
  mapProductDetail,
  mapProductSummary,
} from './mappers';
import type {
  ProductCategory,
  ProductDetail,
  ProductProvider,
  ProductSummary,
} from './types';

/**
 * Application-facing product service.
 *
 * Future ONEMISSION HQ product integration should replace the provider layer
 * only, while catalog and search components continue to depend on this service.
 */
export class ProductService {
  constructor(private readonly provider: ProductProvider) {}

  async getProducts(): Promise<ProductSummary[]> {
    const response = await this.provider.getProducts();
    return response.map(mapProductSummary);
  }

  async getProductDetail(slug: string): Promise<ProductDetail | null> {
    const response = await this.provider.getProductDetail(slug);
    return response ? mapProductDetail(response) : null;
  }

  async getCategories(): Promise<ProductCategory[]> {
    const response = await this.provider.getCategories();
    return response.map(mapProductCategory);
  }
}
