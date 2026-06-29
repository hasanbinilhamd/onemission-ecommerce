// ─── Shared TypeScript models ─────────────────────────────────────────────────
// Minimal placeholder interfaces — expand as each feature module is implemented.

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface Variant {
  id: string;
  sku: string;
  color?: string;
  size?: string;
  stock: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: Category;
  variants?: Variant[];
  tags?: string[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl?: string;
}

export interface Cart {
  id: string;
  customerId?: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}
