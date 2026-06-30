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
 * Checkout UI depends on this class only. RajaOngkir integration should be
 * implemented by swapping providers, not by changing components.
 */
export class ShippingService {
  private provincesCache: ShippingProvince[] | null = null;
  private readonly citiesCache = new Map<string, ShippingCity[]>();
  private readonly districtsCache = new Map<string, ShippingDistrict[]>();

  constructor(private readonly provider: ShippingProvider) {}

  async getProvinces(): Promise<ShippingProvince[]> {
    if (this.provincesCache) {
      return this.provincesCache;
    }

    const response = await this.provider.getProvinces();
    const mapped = response.map(mapShippingProvince);
    this.provincesCache = mapped;
    return mapped;
  }

  async getCities(province: string): Promise<ShippingCity[]> {
    if (this.citiesCache.has(province)) {
      return this.citiesCache.get(province) ?? [];
    }

    const response = await this.provider.getCities(province);
    const mapped = response.map(mapShippingCity);
    this.citiesCache.set(province, mapped);
    return mapped;
  }

  async getDistricts(city: string): Promise<ShippingDistrict[]> {
    if (this.districtsCache.has(city)) {
      return this.districtsCache.get(city) ?? [];
    }

    const response = await this.provider.getDistricts(city);
    const mapped = response.map(mapShippingDistrict);
    this.districtsCache.set(city, mapped);
    return mapped;
  }

  async getShippingRates(address: ShippingRateRequest): Promise<ShippingRate[]> {
    const response = await this.provider.getShippingRates(address);
    return response.map(mapShippingRate);
  }
}
