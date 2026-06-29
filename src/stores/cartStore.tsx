import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Cart, CartItem } from '../types';

interface AddCartItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl?: string;
  color?: string;
  size?: string;
  slug?: string;
}

interface CartContextValue {
  cart: Cart;
  isMiniCartOpen: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  addItem: (item: AddCartItemInput) => void;
  incrementItem: (productId: string, variantId?: string) => void;
  decrementItem: (productId: string, variantId?: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
  totalItems: number;
  subtotal: number;
}

const initialCart: Cart = {
  id: 'local-cart',
  items: [],
  total: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const CartContext = createContext<CartContextValue | null>(null);

function sameLineItem(item: CartItem, productId: string, variantId?: string): boolean {
  return item.productId === productId && (item.variantId ?? '') === (variantId ?? '');
}

function recalculateCart(items: CartItem[], previous: Cart): Cart {
  return {
    ...previous,
    items,
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    updatedAt: new Date().toISOString(),
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(initialCart);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);

  const openMiniCart = useCallback(() => setIsMiniCartOpen(true), []);
  const closeMiniCart = useCallback(() => setIsMiniCartOpen(false), []);

  const addItem = useCallback((item: AddCartItemInput) => {
    setCart(previous => {
      const index = previous.items.findIndex(existing =>
        sameLineItem(existing, item.productId, item.variantId),
      );

      if (index >= 0) {
        const nextItems = previous.items.map((existing, itemIndex) =>
          itemIndex === index
            ? { ...existing, quantity: existing.quantity + item.quantity }
            : existing,
        );
        return recalculateCart(nextItems, previous);
      }

      const nextItems = [...previous.items, item];
      return recalculateCart(nextItems, previous);
    });
    setIsMiniCartOpen(true);
  }, []);

  const incrementItem = useCallback((productId: string, variantId?: string) => {
    setCart(previous => {
      const nextItems = previous.items.map(item =>
        sameLineItem(item, productId, variantId)
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
      return recalculateCart(nextItems, previous);
    });
  }, []);

  const decrementItem = useCallback((productId: string, variantId?: string) => {
    setCart(previous => {
      const nextItems = previous.items.map(item =>
        sameLineItem(item, productId, variantId)
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item,
      );
      return recalculateCart(nextItems, previous);
    });
  }, []);

  const removeItem = useCallback((productId: string, variantId?: string) => {
    setCart(previous => {
      const nextItems = previous.items.filter(item => !sameLineItem(item, productId, variantId));
      return recalculateCart(nextItems, previous);
    });
  }, []);

  const totalItems = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items],
  );

  const subtotal = cart.total;

  const value = useMemo<CartContextValue>(() => ({
    cart,
    isMiniCartOpen,
    openMiniCart,
    closeMiniCart,
    addItem,
    incrementItem,
    decrementItem,
    removeItem,
    totalItems,
    subtotal,
  }), [
    cart,
    isMiniCartOpen,
    openMiniCart,
    closeMiniCart,
    addItem,
    incrementItem,
    decrementItem,
    removeItem,
    totalItems,
    subtotal,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartStore(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartStore must be used within a CartProvider');
  }
  return context;
}
