import { ProductService } from './ProductService';
import { HQCommerceProductProvider } from './providers/HQCommerceProductProvider';

export const productService = new ProductService(new HQCommerceProductProvider());

export { ProductService } from './ProductService';
export { ProductServiceError, isProductNetworkError, isProductNotFoundError } from './errors';
export type {
  ProductCategory,
  ProductCollectionResult,
  ProductDetail,
  ProductListFilters,
  ProductListPagination,
  ProductListQuery,
  ProductProvider,
  ProductSortOption,
  ProductSummary,
  ProductVariant,
} from './types';
