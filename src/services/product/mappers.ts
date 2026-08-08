import type { Category, Product, ProductGalleryItem, ProductShowcaseItem, Variant } from '../../types';
import type {
  CommerceCategoryApiDto,
  CommerceProductCardApiDto,
  CommerceProductDetailApiDto,
  CommerceProductGalleryItemApiDto,
  CommerceProductVariantApiDto,
  ProductCollectionResult,
  ProductListFilters,
  ProductListPagination,
} from './types';

const COLOR_HEX_MAP: Record<string, string> = {
  black: '#1C1C1C',
  white: '#F0F0F0',
  grey: '#9CA3AF',
  gray: '#9CA3AF',
  coral: '#F97316',
  blue: '#4B83C7',
  'steel blue': '#4B83C7',
  onyx: '#1C1C1C',
  natural: '#F0EBE3',
  chalk: '#F5F2EA',
  midnight: '#0B0C10',
  multi: '#6366F1',
};

function resolveColorHex(color?: string): string | undefined {
  if (!color) {
    return undefined;
  }

  return COLOR_HEX_MAP[color.trim().toLowerCase()] ?? '#9CA3AF';
}

export function mapCommerceCategory(dto: CommerceCategoryApiDto): Category {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    imageUrl: dto.thumbnail,
    productCount: dto.productCount,
  };
}

export function mapCommerceProductVariant(dto: CommerceProductVariantApiDto): Variant {
  return {
    id: dto.id,
    sku: dto.sku,
    color: dto.attributes.color,
    colorHex: resolveColorHex(dto.attributes.color),
    size: dto.attributes.size,
    stock: dto.stock,
    price: dto.price,
    weight: dto.weight,
    imageUrl: dto.image,
    available: dto.available,
    variantName: dto.variantName,
  };
}

export function mapCommerceProductGalleryItem(dto: CommerceProductGalleryItemApiDto): ProductGalleryItem {
  return {
    id: dto.id,
    mediaType: dto.mediaType,
    mediaUrl: dto.mediaUrl,
    sortOrder: dto.sortOrder,
  };
}

export function mapCommerceProductShowcaseItem(dto: {
  id: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  sortOrder: number;
  active?: boolean;
}): ProductShowcaseItem {
  return {
    id: dto.id,
    mediaType: dto.mediaType,
    mediaUrl: dto.mediaUrl,
    sortOrder: dto.sortOrder,
    active: dto.active ?? true,
  };
}

function buildCategoryFromName(name: string): Category {
  const slug = String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return {
    id: slug,
    name,
    slug,
  };
}

export function mapCommerceProductCard(dto: CommerceProductCardApiDto): Product {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    description: dto.shortDescription,
    shortDescription: dto.shortDescription,
    price: dto.price,
    compareAtPrice: dto.compareAtPrice,
    discountPercentage: dto.discountPercentage,
    currency: dto.currency,
    imageUrl: dto.thumbnail,
    hoverImageUrl: dto.hoverImage || dto.thumbnail,
    images: [dto.thumbnail],
    category: buildCategoryFromName(dto.category),
    stockStatus: dto.stockStatus,
    featured: dto.featured,
    newArrival: dto.newArrival,
    hasVariants: dto.hasVariants,
    minimumPrice: dto.minimumPrice,
    maximumPrice: dto.maximumPrice,
    averageRating: dto.averageRating,
    rating: dto.averageRating ?? dto.rating,
    reviewCount: dto.reviewCount,
  };
}

export function mapCommerceProductDetail(dto: CommerceProductDetailApiDto): Product {
  const galleryItems = Array.isArray(dto.galleryMedia) && dto.galleryMedia.length > 0
    ? dto.galleryMedia.map(mapCommerceProductGalleryItem)
    : dto.gallery.map((mediaUrl, index) => ({
        id: `${dto.id}-gallery-${index + 1}`,
        mediaType: 'image' as const,
        mediaUrl,
        sortOrder: index + 1,
      }));

  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    description: dto.shortDescription,
    shortDescription: dto.shortDescription,
    longDescription: dto.description,
    materials: dto.materials,
    care: dto.careInstructions,
    shipping: dto.shippingInformation,
    sizeGuideImageUrl: dto.sizeGuideImageUrl,
    price: dto.price,
    compareAtPrice: dto.compareAtPrice,
    discountPercentage: dto.discountPercentage,
    currency: dto.currency,
    imageUrl: dto.thumbnail,
    hoverImageUrl: dto.hoverImage || dto.thumbnail,
    averageRating: dto.averageRating,
    rating: dto.averageRating ?? dto.rating,
    reviewCount: dto.reviewCount,
    images: galleryItems.filter((item) => item.mediaType === 'image').map((item) => item.mediaUrl),
    galleryItems,
    productShowcaseItems: Array.isArray(dto.productShowcaseItems)
      ? dto.productShowcaseItems.map(mapCommerceProductShowcaseItem)
      : [],
    category: {
      id: dto.category.id,
      name: dto.category.name,
      slug: dto.category.slug,
    },
    variants: dto.availableVariants.map(mapCommerceProductVariant),
    stockStatus: dto.stockStatus,
    featured: dto.featured,
    newArrival: dto.newArrival,
    hasVariants: dto.hasVariants,
    minimumPrice: dto.minimumPrice,
    maximumPrice: dto.maximumPrice,
    currentStock: dto.currentStock,
    weight: dto.weight,
  };
}

export function mapProductCollectionResult(
  products: Product[],
  pagination: ProductListPagination,
  filters: ProductListFilters,
): ProductCollectionResult {
  return {
    products,
    pagination,
    filters,
  };
}
