import type {
  ProductCategory,
  ProductDetail,
  ProductProviderCategoryDto,
  ProductProviderProductDto,
  ProductProviderVariantDto,
  ProductSummary,
  ProductVariant,
} from './types';

export function mapProductCategory(dto: ProductProviderCategoryDto): ProductCategory {
  return {
    id: dto.category_id,
    name: dto.category_name,
    slug: dto.category_slug,
    description: dto.category_description,
  };
}

export function mapProductVariant(dto: ProductProviderVariantDto): ProductVariant {
  return {
    id: dto.variant_id,
    sku: dto.variant_sku,
    color: dto.color,
    colorHex: dto.color_hex,
    size: dto.size,
    stock: dto.stock,
    price: dto.price,
  };
}

export function mapProductSummary(dto: ProductProviderProductDto): ProductSummary {
  return {
    id: dto.product_id,
    sku: dto.sku,
    name: dto.product_name,
    slug: dto.product_slug,
    description: dto.product_description,
    price: dto.price,
    imageUrl: dto.image_url,
    category: dto.category ? mapProductCategory(dto.category) : undefined,
    tags: dto.tags,
  };
}

export function mapProductDetail(dto: ProductProviderProductDto): ProductDetail {
  const summary = mapProductSummary(dto);

  return {
    ...summary,
    longDescription: dto.long_description,
    images: dto.image_gallery,
    variants: dto.variants?.map(mapProductVariant),
    materials: dto.materials,
    care: dto.care,
    shipping: dto.shipping,
  };
}
