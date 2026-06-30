import { MOCK_CATEGORIES } from '../../../mocks/categories';
import { MOCK_PRODUCTS } from '../../../mocks/products';
import type {
  ProductProvider,
  ProductProviderCategoryDto,
  ProductProviderProductDto,
  ProductProviderVariantDto,
} from '../types';

function toCategoryDto(): ProductProviderCategoryDto[] {
  return MOCK_CATEGORIES.map((category) => ({
    category_id: category.id,
    category_name: category.name,
    category_slug: category.slug,
    category_description: category.description,
  }));
}

function toVariantDto(variants: typeof MOCK_PRODUCTS[number]['variants']): ProductProviderVariantDto[] | undefined {
  return variants?.map((variant) => ({
    variant_id: variant.id,
    variant_sku: variant.sku,
    color: variant.color,
    color_hex: variant.colorHex,
    size: variant.size,
    stock: variant.stock,
    price: variant.price,
  }));
}

function toProductDto(): ProductProviderProductDto[] {
  return MOCK_PRODUCTS.map((product) => ({
    product_id: product.id,
    sku: product.sku,
    product_name: product.name,
    product_slug: product.slug,
    product_description: product.description,
    long_description: product.longDescription,
    price: product.price,
    image_url: product.imageUrl,
    image_gallery: product.images,
    category: product.category
      ? {
          category_id: product.category.id,
          category_name: product.category.name,
          category_slug: product.category.slug,
          category_description: product.category.description,
        }
      : undefined,
    variants: toVariantDto(product.variants),
    tags: product.tags,
    materials: product.materials,
    care: product.care,
    shipping: product.shipping,
  }));
}

export class MockProductProvider implements ProductProvider {
  async getProducts(): Promise<ProductProviderProductDto[]> {
    return Promise.resolve(toProductDto());
  }

  async getProductDetail(slug: string): Promise<ProductProviderProductDto | null> {
    const product = toProductDto().find((item) => item.product_slug === slug) ?? null;
    return Promise.resolve(product);
  }

  async getCategories(): Promise<ProductProviderCategoryDto[]> {
    return Promise.resolve(toCategoryDto());
  }
}
