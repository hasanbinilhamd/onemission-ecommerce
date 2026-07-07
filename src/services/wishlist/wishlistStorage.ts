import type { Product } from '../../types';

export interface WishlistItemRecord {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  categoryName: string;
  addedAt: string;
}

const GUEST_WISHLIST_STORAGE_KEY = 'onemission-wishlist-guest';

function buildCustomerWishlistStorageKey(customerId: string) {
  return `onemission-wishlist-customer:${customerId}`;
}

function readWishlistStorage(key: string): WishlistItemRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const payload = window.localStorage.getItem(key);
    if (!payload) {
      return [];
    }

    const parsed = JSON.parse(payload);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWishlistStorage(key: string, value: WishlistItemRecord[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function mapProductToWishlistItem(product: Product): WishlistItemRecord {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl || '',
    categoryName: product.category?.name || '',
    addedAt: new Date().toISOString(),
  };
}

export function getGuestWishlistItems() {
  return readWishlistStorage(GUEST_WISHLIST_STORAGE_KEY);
}

export function setGuestWishlistItems(items: WishlistItemRecord[]) {
  writeWishlistStorage(GUEST_WISHLIST_STORAGE_KEY, items);
}

export function clearGuestWishlistItems() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(GUEST_WISHLIST_STORAGE_KEY);
}

export function getCustomerWishlistItems(customerId: string) {
  return readWishlistStorage(buildCustomerWishlistStorageKey(customerId));
}

export function setCustomerWishlistItems(customerId: string, items: WishlistItemRecord[]) {
  writeWishlistStorage(buildCustomerWishlistStorageKey(customerId), items);
}

export function mergeWishlistItems(primary: WishlistItemRecord[], secondary: WishlistItemRecord[]) {
  const merged = new Map<string, WishlistItemRecord>();

  for (const item of [...primary, ...secondary]) {
    if (!merged.has(item.productId)) {
      merged.set(item.productId, item);
    }
  }

  return Array.from(merged.values()).sort(
    (left, right) => new Date(right.addedAt).getTime() - new Date(left.addedAt).getTime(),
  );
}
