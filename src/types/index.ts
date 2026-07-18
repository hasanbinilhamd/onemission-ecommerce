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

export interface CustomerAddress {
  id: string;
  customerId: string;
  recipientName: string;
  phoneNumber: string;
  provinceId: string;
  province: string;
  cityId: string;
  city: string;
  districtId: string;
  district: string;
  postalCode: string;
  streetAddress: string;
  notes?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface CommerceCheckoutSessionItem {
  id: string;
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  variantName: string;
  productImage: string;
  weight: number;
  currency: string;
  quantity: number;
  qty: number;
  price: number;
  subtotal: number;
}

export interface CommerceCheckoutSessionDetail {
  id: string;
  checkoutNumber: string;
  status: string;
  customer: {
    id: string;
    customerCode: string;
    customerName: string;
    email: string;
    phone: string;
  };
  salesChannel: {
    id: string;
    channelCode: string;
    channelName: string;
  };
  currency: string;
  items: CommerceCheckoutSessionItem[];
  shipping: {
    recipientName: string;
    phone: string;
    originDistrict: string;
    destinationDistrict: string;
    courier: string;
    service: string;
    description: string;
    estimatedDelivery: string;
    shippingCost: number;
    address: {
      provinceId: string;
      province: string;
      cityId: string;
      city: string;
      districtId: string;
      district: string;
      postalCode: string;
      streetAddress: string;
    };
  };
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    shippingCost: number;
    tax: number;
    grandTotal: number;
    currency: string;
  };
  processing: {
    processingKey: string | null;
    processingStartedAt: string | null;
  };
  paymentAttemptId: string;
  paymentAttempt: {
    id: string;
    attemptNumber: string;
    provider: string;
    providerReference: string;
    providerTransactionId: string;
    snapToken: string;
    snapRedirectUrl: string;
    status: string;
    paymentMethod: string;
    grossAmount: number;
    currency: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommerceCheckoutHistoryItem {
  id: string;
  checkoutNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  grandTotal: number;
  currency: string;
  itemCount: number;
  paymentAttemptId: string;
  paymentAttemptStatus: string;
  paymentMethod: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommerceCheckoutHistoryResponse {
  data: CommerceCheckoutHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CommercePaymentAttemptDetail {
  id: string;
  attemptNumber: string;
  checkoutSessionId: string;
  provider: string;
  providerReference: string;
  providerTransactionId?: string;
  snapToken?: string;
  snapRedirectUrl?: string;
  status: string;
  grossAmount: number;
  currency: string;
  paymentType: string;
  paymentMethod?: string;
  issuer: string;
  acquirer: string;
  fraudStatus: string;
  transactionTime?: string | null;
  settlementTime?: string | null;
  providerPayload?: unknown;
  expiresAt?: string;
  orderId: string;
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

export type CommerceOrderPaymentStatus = 'CREATED' | 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'UNKNOWN' | string;
export type CommerceOrderFulfillmentStatus = 'WAITING_PAYMENT' | 'READY_FOR_FULFILLMENT' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | string;

export interface CommerceOrderListItem {
  id: string;
  orderNumber: string;
  publicOrderNumber: string;
  orderDate: string;
  customerName: string;
  totalAmount: number;
  paymentStatus: CommerceOrderPaymentStatus;
  status: string;
  fulfillmentStatus: CommerceOrderFulfillmentStatus;
  fulfillmentStatusLabel: CommerceOrderFulfillmentStatus;
  courier: string;
  totalItems: number;
  returnRequest?: CommerceOrderReturnRequest | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommerceOrderListPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CommerceOrderListResponse {
  data: CommerceOrderListItem[];
  pagination: CommerceOrderListPagination;
}

export interface CommerceOrderShippingAddress {
  recipientName: string;
  recipientPhone: string;
  address: string;
  originDistrict: string;
  destinationDistrict: string;
  courier: string;
  courierService: string;
  shippingDescription: string;
  estimatedDelivery: string;
  provinceId: string;
  provinceName: string;
  cityId: string;
  cityName: string;
  districtId: string;
  districtName: string;
  postalCode: string;
  streetAddress: string;
  shippingCost: number;
}

export interface CommerceOrderPaymentSummary {
  id: string;
  attemptNumber: string;
  provider: string;
  providerReference: string;
  providerTransactionId?: string;
  paymentMethod: string;
  issuer: string;
  acquirer: string;
  transactionTime?: string;
  settlementTime?: string;
  grossAmount: number;
  currency: string;
  status: CommerceOrderPaymentStatus;
  expiresAt?: string;
}

export interface CommerceOrderShipment {
  courier: string;
  service: string;
  trackingNumber: string;
  shippingDate: string | null;
}

export interface CommerceOrderProduct {
  id: string;
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  variantName: string;
  productImage: string;
  price: number;
  weight: number;
  quantity: number;
  subtotal: number;
  currency: string;
}

export interface CommerceOrderTimelineEntry {
  id: string;
  eventName: string;
  updatedBy: string;
  notes: string;
  timestamp: string;
  createdAt: string;
}

export interface CommerceRefundTimelineEntry {
  status: string;
  label: string;
  timestamp: string;
  notes: string;
}

export interface CommerceRefundAttempt {
  id: string;
  attemptNumber: number;
  gatewayName: string;
  status: string;
  refundKey: string;
  midtransRefundId: string;
  transactionId: string;
  httpStatus: number | null;
  statusCode: string;
  statusMessage: string;
  requestBody?: unknown;
  responseBody?: unknown;
  responseAt: string | null;
  failureSource: string;
  failureReason: string;
  failureCode: string;
  failureDisplayMessage: string;
  retryAvailable: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommerceOrderReturnRequest {
  id: string;
  orderId: string;
  customerId: string;
  requestType: string;
  previousOrderStatus?: string;
  previousFulfillmentStatus?: string;
  reason: string;
  description: string;
  status: string;
  rejectReason: string;
  refundStatus: string;
  refundReference: string;
  refundKey?: string;
  refundAmount: number;
  refundProvider: string;
  refundProviderId: string;
  refundFailureReason?: string;
  refundFailureSource?: string;
  failureDisplayMessage?: string;
  retryAvailable?: boolean;
  retryCount?: number;
  refundAttempts?: CommerceRefundAttempt[];
  refundMetadata?: unknown;
  attachments: string[];
  requestedAt: string;
  approvedAt: string | null;
  completedAt: string | null;
  refundRequestedAt: string | null;
  refundApprovedAt: string | null;
  refundProcessingAt: string | null;
  refundCompletedAt: string | null;
  lastRefundAttemptAt?: string | null;
  rejectedAt: string | null;
  timeline: CommerceRefundTimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CommerceOrderDetail {
  id: string;
  orderNumber: string;
  publicOrderNumber: string;
  checkoutSessionId: string;
  paymentAttemptId: string;
  paymentReference: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  salesChannelId: string;
  salesChannelCode: string;
  salesChannelName: string;
  shipping: CommerceOrderShippingAddress;
  payment: CommerceOrderPaymentSummary | null;
  status: string;
  fulfillmentStatus: CommerceOrderFulfillmentStatus;
  fulfillmentStatusLabel: CommerceOrderFulfillmentStatus;
  shipment: CommerceOrderShipment;
  currency: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  grandTotal: number;
  items: CommerceOrderProduct[];
  timeline: CommerceOrderTimelineEntry[];
  returnRequest: CommerceOrderReturnRequest | null;
  actions: {
    canCancel: boolean;
    canRequestReturn: boolean;
  };
  returnPolicy: {
    returnWindowDays: number;
    deliveredAt: string | null;
    returnWindowEndsAt: string | null;
  };
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
