import type { Cart, CartItem } from '../../types';

// ─── Cart Service ─────────────────────────────────────────────────────────────
// Placeholder service layer for cart operations.
// Replace function bodies with real API calls or local state logic.

export async function getCart(cartId: string): Promise<Cart | null> {
  void cartId;
  return Promise.resolve(null);
}

export async function addToCart(cartId: string, item: CartItem): Promise<Cart | null> {
  void cartId;
  void item;
  return Promise.resolve(null);
}

export async function removeFromCart(
  cartId: string,
  productId: string,
): Promise<Cart | null> {
  void cartId;
  void productId;
  return Promise.resolve(null);
}

export async function clearCart(cartId: string): Promise<void> {
  void cartId;
  return Promise.resolve();
}
