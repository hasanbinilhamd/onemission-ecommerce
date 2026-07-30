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
function sortByNameAscending<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => left.name.localeCompare(right.name, 'en', { sensitivity: 'base' }));
}

function selectCheapestRatePerCourier(items: ShippingRate[]): ShippingRate[] {
  const cheapestRateByCourier = new Map<string, ShippingRate>();

  items.forEach((item) => {
    const courierCode = String(item.courierCode || '').trim().toLowerCase();
    if (!courierCode) {
      return;
    }

    const currentCheapest = cheapestRateByCourier.get(courierCode);
    if (!currentCheapest || item.cost < currentCheapest.cost) {
      cheapestRateByCourier.set(courierCode, item);
    }
  });

  return items.filter((item) => {
    const courierCode = String(item.courierCode || '').trim().toLowerCase();
    return cheapestRateByCourier.get(courierCode)?.id === item.id;
  });
}

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
    const mapped = sortByNameAscending(response.map(mapShippingProvince));
    this.provincesCache = mapped;
    return mapped;
  }

  async getCities(province: string): Promise<ShippingCity[]> {
    if (this.citiesCache.has(province)) {
      return this.citiesCache.get(province) ?? [];
    }

    const response = await this.provider.getCities(province);
    const mapped = sortByNameAscending(response.map(mapShippingCity));
    this.citiesCache.set(province, mapped);
    return mapped;
  }

  async getDistricts(city: string): Promise<ShippingDistrict[]> {
    if (this.districtsCache.has(city)) {
      return this.districtsCache.get(city) ?? [];
    }

    const response = await this.provider.getDistricts(city);
    const mapped = sortByNameAscending(response.map(mapShippingDistrict));
    this.districtsCache.set(city, mapped);
    return mapped;
  }

  async getShippingRates(address: ShippingRateRequest): Promise<ShippingRate[]> {
    const response = await this.provider.getShippingRates(address);
    const mapped = response.map(mapShippingRate);
    return selectCheapestRatePerCourier(mapped);
  }
}
