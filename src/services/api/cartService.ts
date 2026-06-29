import type { Cart, CartItem } from '../../types';

// ─── Cart Service ─────────────────────────────────────────────────────────────
// Placeholder service layer for cart operations.
// Replace function bodies with real API calls or local state logic.

export async function getCart(_cartId: string): Promise<Cart | null> {
  return Promise.resolve(null);
}

export async function addToCart(_cartId: string, _item: CartItem): Promise<Cart | null> {
  return Promise.resolve(null);
}

export async function removeFromCart(
  _cartId: string,
  _productId: string,
): Promise<Cart | null> {
  return Promise.resolve(null);
}

export async function clearCart(_cartId: string): Promise<void> {
  return Promise.resolve();
}
