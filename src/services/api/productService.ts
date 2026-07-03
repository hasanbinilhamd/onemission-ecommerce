import type { Category, Product } from '../../types';
import { productService } from '../product';
import type { ProductCollectionResult, ProductListQuery } from '../product';

export async function getProducts(query: ProductListQuery = {}): Promise<ProductCollectionResult> {
  return productService.getProducts(query);
}

export async function getFeaturedProducts(query: ProductListQuery = {}): Promise<Product[]> {
  return productService.getFeaturedProducts(query);
}

export async function getNewArrivalProducts(query: ProductListQuery = {}): Promise<Product[]> {
  return productService.getNewArrivalProducts(query);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return productService.getProductDetail(slug);
}

export async function getProductById(id: string): Promise<Product | null> {
  return productService.getCachedProductById(id);
}

export async function getCategories(): Promise<Category[]> {
  return productService.getCategories();
}

export async function searchProducts(query: string, options: Omit<ProductListQuery, 'search'> = {}): Promise<Product[]> {
  return productService.searchProducts(query, options);
}
