import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { productService } from '../services/product';
import type { Cart, CartItem, ResolvedCartItem } from '../types';

const LOCAL_CART_STORAGE_KEY = 'onemission-commerce-cart';

interface AddCartItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

interface CartContextValue {
  cart: Cart;
  cartItems: ResolvedCartItem[];
  isCartReady: boolean;
  isMiniCartOpen: boolean;
  isMiniCartVisible: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  setMiniCartVisible: (visible: boolean) => void;
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
    total: 0,
    updatedAt: new Date().toISOString(),
  };
}

function readStoredCart(): Cart {
  if (typeof window === 'undefined') {
    return initialCart;
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_CART_STORAGE_KEY);
    if (!raw) {
      return initialCart;
    }

    const parsed = JSON.parse(raw) as Partial<Cart>;
    const items = Array.isArray(parsed.items)
      ? parsed.items
        .filter((item): item is CartItem => Boolean(item && typeof item.productId === 'string'))
        .map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1,
        }))
      : [];

    return {
      ...initialCart,
      ...parsed,
      items,
      total: 0,
    };
  } catch {
    window.localStorage.removeItem(LOCAL_CART_STORAGE_KEY);
    return initialCart;
  }
}

function resolveCartLineItem(item: CartItem): ResolvedCartItem | null {
  const product = productService.getCachedProductById(item.productId);
  if (!product) {
    return null;
  }

  const selectedVariant = item.variantId
    ? product.variants?.find((variant) => variant.id === item.variantId)
    : undefined;

  const fallbackVariant = product.variants?.[0];
  const activeVariant = selectedVariant ?? fallbackVariant;
  const price = activeVariant?.price ?? product.price;
  const imageUrl = activeVariant?.imageUrl ?? product.imageUrl;
  const stock = activeVariant?.stock ?? product.currentStock ?? 0;
  const available = activeVariant?.available ?? stock > 0;
  const weight = activeVariant?.weight ?? product.weight ?? 0;

  return {
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
    name: product.name,
    price,
    imageUrl,
    color: activeVariant?.color,
    size: activeVariant?.size,
    slug: product.slug,
    categoryName: product.category?.name,
    sku: activeVariant?.sku ?? product.sku,
    weight,
    available,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(initialCart);
  const [cartItems, setCartItems] = useState<ResolvedCartItem[]>([]);
  const [isCartReady, setIsCartReady] = useState(false);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [isMiniCartVisible, setIsMiniCartVisible] = useState(false);

  useEffect(() => {
    setCart(readStoredCart());
    setIsCartReady(true);
  }, []);

  useEffect(() => {
    if (!isCartReady || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(LOCAL_CART_STORAGE_KEY, JSON.stringify({
      ...cart,
      total: 0,
      items: cart.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    }));
  }, [cart, isCartReady]);

  useEffect(() => {
    if (!isCartReady) {
      return;
    }

    let isActive = true;

    const hydrateCartItems = async () => {
      if (cart.items.length === 0) {
        if (isActive) {
          setCartItems([]);
        }
        return;
      }

      await productService.ensureProductDetailsLoadedByIds(cart.items.map((item) => item.productId));

      if (!isActive) {
        return;
      }

      const resolvedItems = cart.items
        .map(resolveCartLineItem)
        .filter((item): item is ResolvedCartItem => Boolean(item));

      setCartItems(resolvedItems);
    };

    void hydrateCartItems();

    return () => {
      isActive = false;
    };
  }, [cart.items, isCartReady]);

  const openMiniCart = useCallback(() => {
    setIsMiniCartOpen(true);
    setIsMiniCartVisible(true);
  }, []);
  const closeMiniCart = useCallback(() => setIsMiniCartOpen(false), []);
  const setMiniCartVisible = useCallback((visible: boolean) => setIsMiniCartVisible(visible), []);

  const addItem = useCallback((item: AddCartItemInput) => {
    setCart((previous) => {
      const index = previous.items.findIndex((existing) => sameLineItem(existing, item.productId, item.variantId));

      if (index >= 0) {
        const nextItems = previous.items.map((existing, itemIndex) => (
          itemIndex === index
            ? { ...existing, quantity: existing.quantity + item.quantity }
            : existing
        ));
        return recalculateCart(nextItems, previous);
      }

      const nextItems = [
        ...previous.items,
        {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        },
      ];
      return recalculateCart(nextItems, previous);
    });
    setIsMiniCartOpen(true);
    setIsMiniCartVisible(true);
  }, []);

  const incrementItem = useCallback((productId: string, variantId?: string) => {
    setCart((previous) => {
      const nextItems = previous.items.map((item) => (
        sameLineItem(item, productId, variantId)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      return recalculateCart(nextItems, previous);
    });
  }, []);

  const decrementItem = useCallback((productId: string, variantId?: string) => {
    setCart((previous) => {
      const nextItems = previous.items.map((item) => (
        sameLineItem(item, productId, variantId)
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      ));
      return recalculateCart(nextItems, previous);
    });
  }, []);

  const removeItem = useCallback((productId: string, variantId?: string) => {
    setCart((previous) => {
      const nextItems = previous.items.filter((item) => !sameLineItem(item, productId, variantId));
      return recalculateCart(nextItems, previous);
    });
  }, []);

  const totalItems = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items],
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [cartItems],
  );

  const value = useMemo<CartContextValue>(() => ({
    cart,
    cartItems,
    isCartReady,
    isMiniCartOpen,
    isMiniCartVisible,
    openMiniCart,
    closeMiniCart,
    setMiniCartVisible,
    addItem,
    incrementItem,
    decrementItem,
    removeItem,
    totalItems,
    subtotal,
  }), [
    cart,
    cartItems,
    isCartReady,
    isMiniCartOpen,
    isMiniCartVisible,
    openMiniCart,
    closeMiniCart,
    setMiniCartVisible,
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
