import { env } from '../../app/config/env';
import { serviceLayerConfig } from '../config';
import { ShippingService } from './ShippingService';
import { MockShippingProvider } from './providers/MockShippingProvider';
import { RajaOngkirProvider } from './providers/RajaOngkirProvider';
import type { ShippingProvider } from './types';

function createShippingProvider(): ShippingProvider {
  const wantsRajaOngkir = serviceLayerConfig.providers.shipping === 'rajaongkir';
  const hasCredentials = Boolean(env.rajaOngkirApiKey.trim()) && Boolean(env.rajaOngkirBaseUrl.trim());

  if (wantsRajaOngkir && hasCredentials) {
    return new RajaOngkirProvider();
  }

  if (wantsRajaOngkir && !hasCredentials) {
    console.warn(
      '[shippingService] RajaOngkir credentials are missing. Falling back to MockShippingProvider.',
    );
  }

  return new MockShippingProvider({
    latencyMs: serviceLayerConfig.featureFlags.simulateMockLatency ? 450 : 0,
  });
}

export const shippingService = new ShippingService(createShippingProvider());

export { ShippingService } from './ShippingService';
export { ShippingServiceError, getShippingServiceErrorMessage } from './errors';
export type {
  ShippingCity,
  ShippingDistrict,
  ShippingProvider,
  ShippingProvince,
  ShippingRate,
  ShippingRateRequest,
  ShippingServiceResource,
} from './types';
