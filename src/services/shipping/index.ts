import type { ShippingService } from './ShippingService';
import { MockShippingService } from './MockShippingService';

/**
 * Current local implementation for Sprint 9.
 *
 * When external shipping integration is approved, replace this single line
 * with `new RajaOngkirShippingService()` and keep the Checkout UI unchanged.
 */
export const shippingService: ShippingService = new MockShippingService();

export type { ShippingService } from './ShippingService';
export { RajaOngkirShippingService } from './RajaOngkirShippingService';
export { ShippingServiceError, getShippingServiceErrorMessage } from './errors';
