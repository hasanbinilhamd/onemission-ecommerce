import type { Product } from '../../types';

// ─── Product Service ──────────────────────────────────────────────────────────
// Placeholder service layer for product data.
// Replace function bodies with real API calls when the backend is connected.

export async function getProducts(): Promise<Product[]> {
  return Promise.resolve([]);
}

export async function getProductBySlug(_slug: string): Promise<Product | null> {
  return Promise.resolve(null);
}

export async function getProductById(_id: string): Promise<Product | null> {
  return Promise.resolve(null);
}

export async function searchProducts(_query: string): Promise<Product[]> {
  return Promise.resolve([]);
}
