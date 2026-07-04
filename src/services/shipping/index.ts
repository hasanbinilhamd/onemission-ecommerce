import { ShippingService } from './ShippingService';
import { HQShippingProvider } from './providers/HQShippingProvider';

export const shippingService = new ShippingService(new HQShippingProvider());

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
