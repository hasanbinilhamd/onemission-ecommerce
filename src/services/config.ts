import { env } from '../app/config/env';

export type ShippingProviderKey = 'mock' | 'rajaongkir';
export type ProductProviderKey = 'mock' | 'future-hq';

/**
 * External service layer foundation.
 *
 * Provider selection stays centralized here so the Checkout UI remains vendor
 * agnostic. When RajaOngkir credentials are unavailable, Shipping falls back
 * to the Mock provider inside the shipping module entry point.
 */
export const serviceLayerConfig = {
  environment: env.mode,
  providers: {
    shipping: 'rajaongkir' as ShippingProviderKey,
    product: 'mock' as ProductProviderKey,
  },
  featureFlags: {
    simulateMockLatency: true,
    enableFutureProductProvider: false,
  },
} as const;
