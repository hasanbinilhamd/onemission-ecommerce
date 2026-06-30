export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  color?: string;
  colorHex?: string;
  size?: string;
  stock: number;
  price: number;
}

export interface ProductSummary {
  id: string;
  sku?: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: ProductCategory;
  tags?: string[];
}

export interface ProductDetail extends ProductSummary {
  longDescription?: string;
  images?: string[];
  variants?: ProductVariant[];
  materials?: string;
  care?: string;
  shipping?: string;
}

export interface ProductProviderCategoryDto {
  category_id: string;
  category_name: string;
  category_slug: string;
  category_description?: string;
}

export interface ProductProviderVariantDto {
  variant_id: string;
  variant_sku: string;
  color?: string;
  color_hex?: string;
  size?: string;
  stock: number;
  price: number;
}

export interface ProductProviderProductDto {
  product_id: string;
  sku?: string;
  product_name: string;
  product_slug: string;
  product_description?: string;
  long_description?: string;
  price: number;
  image_url?: string;
  image_gallery?: string[];
  category?: ProductProviderCategoryDto;
  variants?: ProductProviderVariantDto[];
  tags?: string[];
  materials?: string;
  care?: string;
  shipping?: string;
}

export interface ProductProvider {
  getProducts(): Promise<ProductProviderProductDto[]>;
  getProductDetail(slug: string): Promise<ProductProviderProductDto | null>;
  getCategories(): Promise<ProductProviderCategoryDto[]>;
}
