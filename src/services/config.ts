import { env } from '../app/config/env';

export type ShippingProviderKey = 'mock' | 'future-rajaongkir';
export type PaymentProviderKey = 'mock' | 'future-midtrans';
export type ProductProviderKey = 'mock' | 'future-hq';

/**
 * External service layer foundation.
 *
 * Keep provider selection centralized so future vendor integrations can be
 * activated in one place without touching UI components.
 */
export const serviceLayerConfig = {
  environment: env.mode,
  providers: {
    shipping: 'mock' as ShippingProviderKey,
    payment: 'mock' as PaymentProviderKey,
    product: 'mock' as ProductProviderKey,
  },
  featureFlags: {
    simulateMockLatency: true,
    enableFutureProviders: false,
  },
} as const;
