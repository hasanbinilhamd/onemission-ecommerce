import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '../../types';
import {
  clearGuestWishlistItems,
  clearPendingWishlistItem,
  getCustomerWishlistItems,
  getGuestWishlistItems,
  getPendingWishlistItem,
  mapProductToWishlistItem,
  mergeWishlistItems,
  setCustomerWishlistItems,
  setGuestWishlistItems,
  type WishlistItemRecord,
} from '../../services/wishlist/wishlistStorage';
import { useAuthenticatedCustomer } from './useAuthenticatedCustomer';
import { WishlistContext, type WishlistContextValue } from './WishlistContext';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthenticatedCustomer();
  const [items, setItems] = useState<WishlistItemRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      const guestItems = getGuestWishlistItems();
      const storedItems = getCustomerWishlistItems(user.id);
      const pendingWishlistItem = getPendingWishlistItem();
      const mergedItems = mergeWishlistItems(
        storedItems,
        pendingWishlistItem ? [pendingWishlistItem, ...guestItems] : guestItems,
      );
      setCustomerWishlistItems(user.id, mergedItems);
      clearGuestWishlistItems();
      clearPendingWishlistItem();
      setItems(mergedItems);
      setIsLoading(false);
      return;
    }

    setItems(getGuestWishlistItems());
    setIsLoading(false);
  }, [user?.id]);

  const persistItems = useCallback((nextItems: WishlistItemRecord[]) => {
    if (user?.id) {
      setCustomerWishlistItems(user.id, nextItems);
    } else {
      setGuestWishlistItems(nextItems);
    }

    setItems(nextItems);
  }, [user?.id]);

  const addItem = useCallback((product: Product) => {
    const nextItem = mapProductToWishlistItem(product);
    const nextItems = mergeWishlistItems([nextItem], items);
    persistItems(nextItems);
  }, [items, persistItems]);

  const removeItem = useCallback((productId: string) => {
    const nextItems = items.filter((item) => item.productId !== productId);
    persistItems(nextItems);
  }, [items, persistItems]);

  const toggleItem = useCallback((product: Product) => {
    const exists = items.some((item) => item.productId === product.id);
    if (exists) {
      removeItem(product.id);
      return;
    }

    addItem(product);
  }, [addItem, items, removeItem]);

  const clearWishlist = useCallback(() => {
    persistItems([]);
  }, [persistItems]);

  const isWishlisted = useCallback((productId: string) => (
    items.some((item) => item.productId === productId)
  ), [items]);

  const value = useMemo<WishlistContextValue>(() => ({
    items,
    isLoading,
    addItem,
    removeItem,
    toggleItem,
    isWishlisted,
    clearWishlist,
  }), [addItem, clearWishlist, isLoading, isWishlisted, items, removeItem, toggleItem]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

