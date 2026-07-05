// ─── Route constants ──────────────────────────────────────────────────────────
// Centralised routing configuration.
// Wire these into your router setup (e.g. React Router) as modules are added.

export const ROUTES = {
  HOME: '/',
  PRODUCT: '/product/:slug',
  CART: '/cart',
  CHECKOUT: '/checkout',
  LOGIN: '/login',
  ACCOUNT: '/account',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:orderNumber',
  TRACK_ORDER: '/track-order',
  ACCOUNT_ADDRESS: '/account/address',
  ACCOUNT_PROFILE: '/account/profile',
  WISHLIST: '/wishlist',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** Build a product detail URL from a slug. */
export function productPath(slug: string): string {
  return `/product/${slug}`;
}

/** Build an order detail URL from a public order number. */
export function orderDetailPath(orderNumber: string): string {
  return `/orders/${encodeURIComponent(orderNumber)}`;
}
