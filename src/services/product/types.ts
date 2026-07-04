import type { Category, Product } from '../../types';

export type ProductCategory = Category;
export type ProductSummary = Product;
export type ProductDetail = Product;
export type ProductVariant = NonNullable<Product['variants']>[number];

export type ProductSortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: ProductSortOption;
  featured?: boolean;
  newArrival?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface ProductListPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductListFilters {
  page: number;
  limit: number;
  search: string;
  category: string;
  sort: ProductSortOption;
  featured: boolean | null;
  newArrival: boolean | null;
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean | null;
}

export interface ProductCollectionResult {
  products: ProductSummary[];
  pagination: ProductListPagination;
  filters: ProductListFilters;
}

export interface CommerceCategoryApiDto {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  productCount: number;
}

export interface CommerceProductCardApiDto {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  thumbnail: string;
  price: number;
  compareAtPrice: number | null;
  discountPercentage: number;
  currency: string;
  category: string;
  rating: number | null;
  reviewCount: number;
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK';
  featured: boolean;
  newArrival: boolean;
  hasVariants: boolean;
  minimumPrice: number;
  maximumPrice: number;
}

export interface CommerceProductVariantApiDto {
  id: string;
  sku: string;
  variantName: string;
  attributes: {
    color?: string;
    size?: string;
  };
  price: number;
  stock: number;
  weight: number;
  image: string;
  available: boolean;
}

export interface CommerceProductDetailApiDto {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  gallery: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  price: number;
  compareAtPrice: number | null;
  discountPercentage: number;
  currency: string;
  minimumPrice: number;
  maximumPrice: number;
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK';
  currentStock: number;
  featured: boolean;
  newArrival: boolean;
  hasVariants: boolean;
  availableVariants: CommerceProductVariantApiDto[];
  availableSizes: string[];
  availableColors: string[];
  weight: number;
  seo: {
    slug: string;
  };
}

export interface CommerceProductListApiResponse {
  data: CommerceProductCardApiDto[];
  pagination: ProductListPagination;
  filters: ProductListFilters;
}

export interface CommerceProductDetailApiResponse {
  data: CommerceProductDetailApiDto;
}

export interface CommerceCategoryListApiResponse {
  data: CommerceCategoryApiDto[];
}

export interface ProductProvider {
  getProducts(query?: ProductListQuery): Promise<ProductCollectionResult>;
  getNewArrivals(query?: ProductListQuery): Promise<ProductCollectionResult>;
  searchProducts(query: string, options?: Omit<ProductListQuery, 'search'>): Promise<ProductCollectionResult>;
  getProductDetail(slug: string): Promise<ProductDetail | null>;
  getCategories(): Promise<ProductCategory[]>;
}
