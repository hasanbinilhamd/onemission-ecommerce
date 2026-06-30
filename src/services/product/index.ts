import { serviceLayerConfig } from '../config';
import { ProductService } from './ProductService';
import { FutureHQProductProvider } from './providers/FutureHQProductProvider';
import { MockProductProvider } from './providers/MockProductProvider';
import type { ProductProvider } from './types';

function createProductProvider(): ProductProvider {
  if (serviceLayerConfig.providers.product === 'future-hq') {
    return new FutureHQProductProvider();
  }

  return new MockProductProvider();
}

export const productService = new ProductService(createProductProvider());

export { ProductService } from './ProductService';
export type {
  ProductCategory,
  ProductDetail,
  ProductProvider,
  ProductSummary,
  ProductVariant,
} from './types';
