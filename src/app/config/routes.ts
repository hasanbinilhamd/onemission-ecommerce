// ─── Route constants ──────────────────────────────────────────────────────────
// Centralised routing configuration.
// Wire these into your router setup (e.g. React Router) as modules are added.

export const ROUTES = {
  HOME: '/',
  PRODUCT: '/product/:slug',
  CART: '/cart',
  CHECKOUT: '/checkout',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ACCOUNT: '/account',
  ACCOUNT_PROFILE: '/account/profile',
  ACCOUNT_ADDRESSES: '/account/address',
  ACCOUNT_ORDERS: '/account/orders',
  ACCOUNT_ORDER_DETAIL: '/account/orders/:orderNumber',
  ACCOUNT_WISHLIST: '/account/wishlist',
  ACCOUNT_PASSWORD: '/account/password',
  ORDERS: '/account/orders',
  ORDER_DETAIL: '/account/orders/:orderNumber',
  TRACK_ORDER: '/track-order',
  WISHLIST: '/account/wishlist',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** Build a product detail URL from a slug. */
export function productPath(slug: string): string {
  return `/product/${slug}`;
}

/** Build an order detail URL from a public order number. */
export function orderDetailPath(orderNumber: string): string {
  return `/account/orders/${encodeURIComponent(orderNumber)}`;
}
