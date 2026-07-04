// ─── Shared TypeScript models ─────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
}

export interface Variant {
  id: string;
  sku: string;
  color?: string;
  /** Hex value for colour swatch rendering. */
  colorHex?: string;
  size?: string;
  stock: number;
  price: number;
  weight?: number;
  imageUrl?: string;
  available?: boolean;
  variantName?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  /** One-line teaser shown on cards and in catalog. */
  description?: string;
  shortDescription?: string;
  /** Longer marketing copy shown on Product Detail. */
  longDescription?: string;
  price: number;
  compareAtPrice?: number | null;
  discountPercentage?: number;
  currency?: string;
  imageUrl?: string;
  /** Ordered gallery images — first is the main image shown in catalog. */
  images?: string[];
  category?: Category;
  variants?: Variant[];
  tags?: string[];
  /** Display SKU shown on the Product Detail page. */
  sku?: string;
  materials?: string;
  care?: string;
  shipping?: string;
  stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK';
  featured?: boolean;
  newArrival?: boolean;
  hasVariants?: boolean;
  minimumPrice?: number;
  maximumPrice?: number;
  rating?: number | null;
  reviewCount?: number;
  currentStock?: number;
  weight?: number;
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
}

export interface ResolvedCartItem extends CartItem {
  name: string;
  price: number;
  imageUrl?: string;
  color?: string;
  size?: string;
  slug?: string;
  categoryName?: string;
  sku?: string;
  weight?: number;
  available: boolean;
  availableStock: number;
  inventoryStatus: 'IN_STOCK' | 'OUT_OF_STOCK';
  isInvalid: boolean;
  validationMessage?: string;
}

export interface Cart {
  id: string;
  customerId?: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutContactInformation {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface CheckoutShippingAddress {
  country: string;
  provinceId: string;
  province: string;
  cityId: string;
  city: string;
  districtId: string;
  district: string;
  postalCode: string;
  streetAddress: string;
}

export interface ShippingProvince {
  id: string;
  name: string;
}

export interface ShippingCity {
  id: string;
  provinceId: string;
  name: string;
}

export interface ShippingDistrict {
  id: string;
  cityId: string;
  name: string;
  postalCode: string;
}

export interface ShippingRate {
  id: string;
  courierCode: string;
  courierName: string;
  serviceName: string;
  estimatedDelivery: string;
  cost: number;
  logoText: string;
}

export interface ShippingRateRequest {
  country: string;
  province: string;
  provinceId?: string;
  city: string;
  cityId?: string;
  district: string;
  districtId?: string;
  postalCode: string;
  weightGrams?: number;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

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
