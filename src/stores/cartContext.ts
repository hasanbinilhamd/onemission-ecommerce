import { createContext, useContext } from 'react';
import type { Cart, ResolvedCartItem } from '../types';

export interface AddCartItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CartContextValue {
  cart: Cart;
  cartItems: ResolvedCartItem[];
  isCartReady: boolean;
  isCartRefreshing: boolean;
  hasInvalidItems: boolean;
  refreshCartItems: () => Promise<ResolvedCartItem[]>;
  isMiniCartOpen: boolean;
  isMiniCartVisible: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  setMiniCartVisible: (visible: boolean) => void;
  addItem: (item: AddCartItemInput) => void;
  incrementItem: (productId: string, variantId?: string) => void;
  decrementItem: (productId: string, variantId?: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function useCartStore(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartStore must be used within a CartProvider');
  }
  return context;
}
