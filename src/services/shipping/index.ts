import { serviceLayerConfig } from '../config';
import { ShippingService } from './ShippingService';
import { MockShippingProvider } from './providers/MockShippingProvider';
import { FutureRajaOngkirProvider } from './providers/FutureRajaOngkirProvider';
import type { ShippingProvider } from './types';

function createShippingProvider(): ShippingProvider {
  if (serviceLayerConfig.providers.shipping === 'future-rajaongkir') {
    return new FutureRajaOngkirProvider();
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
