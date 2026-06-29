// ─── Route constants ──────────────────────────────────────────────────────────
// Centralised routing configuration.
// Wire these into your router setup (e.g. React Router) as modules are added.

export const ROUTES = {
  HOME: '/',
  PRODUCT: '/product/:slug',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ACCOUNT: '/account',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** Build a product detail URL from a slug. */
export function productPath(slug: string): string {
  return `/product/${slug}`;
}
