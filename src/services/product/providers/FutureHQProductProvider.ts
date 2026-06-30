import type {
  ProductProvider,
  ProductProviderCategoryDto,
  ProductProviderProductDto,
} from '../types';

/**
 * Future ONEMISSION HQ integration point.
 *
 * Implement HQ-specific product, category and detail endpoints inside this
 * provider only. Catalog-related UI should remain unchanged because it should
 * communicate through ProductService.
 */
export class FutureHQProductProvider implements ProductProvider {
  async getProducts(): Promise<ProductProviderProductDto[]> {
    throw new Error('FutureHQProductProvider is not implemented in this sprint.');
  }

  async getProductDetail(slug: string): Promise<ProductProviderProductDto | null> {
    void slug;
    throw new Error('FutureHQProductProvider is not implemented in this sprint.');
  }

  async getCategories(): Promise<ProductProviderCategoryDto[]> {
    throw new Error('FutureHQProductProvider is not implemented in this sprint.');
  }
}
