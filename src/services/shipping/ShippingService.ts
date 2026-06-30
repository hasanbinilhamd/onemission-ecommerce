import {
  mapShippingCity,
  mapShippingDistrict,
  mapShippingProvince,
  mapShippingRate,
} from './mappers';
import type {
  ShippingCity,
  ShippingDistrict,
  ShippingProvider,
  ShippingProvince,
  ShippingRate,
  ShippingRateRequest,
} from './types';

/**
 * Application-facing shipping service.
 *
 * Checkout UI depends on this class only. Future RajaOngkir integration should
 * be implemented by swapping the provider, not by changing components.
 */
export class ShippingService {
  constructor(private readonly provider: ShippingProvider) {}

  async getProvinces(): Promise<ShippingProvince[]> {
    const response = await this.provider.getProvinces();
    return response.map(mapShippingProvince);
  }

  async getCities(province: string): Promise<ShippingCity[]> {
    const response = await this.provider.getCities(province);
    return response.map(mapShippingCity);
  }

  async getDistricts(city: string): Promise<ShippingDistrict[]> {
    const response = await this.provider.getDistricts(city);
    return response.map(mapShippingDistrict);
  }

  async getShippingRates(address: ShippingRateRequest): Promise<ShippingRate[]> {
    const response = await this.provider.getShippingRates(address);
    return response.map(mapShippingRate);
  }
}
