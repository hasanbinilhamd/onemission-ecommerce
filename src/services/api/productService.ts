import type { Product } from '../../types';

// ─── Product Service ──────────────────────────────────────────────────────────
// Placeholder service layer for product data.
// Replace function bodies with real API calls when the backend is connected.

export async function getProducts(): Promise<Product[]> {
  return Promise.resolve([]);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  void slug;
  return Promise.resolve(null);
}

export async function getProductById(id: string): Promise<Product | null> {
  void id;
  return Promise.resolve(null);
}

export async function searchProducts(query: string): Promise<Product[]> {
  void query;
  return Promise.resolve([]);
}
