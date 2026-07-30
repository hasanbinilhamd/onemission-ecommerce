import { createContext, useContext } from 'react';
import type { Product } from '../../types';
import type { WishlistItemRecord } from '../../services/wishlist/wishlistStorage';

export interface WishlistContextValue {
  items: WishlistItemRecord[];
  isLoading: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const WishlistContext = createContext<WishlistContextValue | null>(null);

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }

  return context;
}
