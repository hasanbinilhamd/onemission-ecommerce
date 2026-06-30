import type {
  ShippingCity,
  ShippingDistrict,
  ShippingProvince,
  ShippingRate,
  ShippingRateRequest,
} from '../../types';
import { ShippingService } from './ShippingService';
import { ShippingServiceError, type ShippingServiceResource } from './errors';
import {
  mapCities,
  mapDistricts,
  mapProvinces,
  mapShippingRates,
} from './mockShippingData';

interface MockShippingServiceOptions {
  latencyMs?: number;
  failureModes?: Partial<Record<ShippingServiceResource, boolean>>;
}

export class MockShippingService implements ShippingService {
  private readonly latencyMs: number;
  private readonly failureModes: Partial<Record<ShippingServiceResource, boolean>>;

  constructor(options: MockShippingServiceOptions = {}) {
    this.latencyMs = options.latencyMs ?? 450;
    this.failureModes = options.failureModes ?? {};
  }

  async getProvinces(): Promise<ShippingProvince[]> {
    await this.simulateLatency('provinces');
    return mapProvinces();
  }

  async getCities(province: string): Promise<ShippingCity[]> {
    await this.simulateLatency('cities');

    const cities = mapCities(province);
    if (!province || cities.length === 0) {
      throw new ShippingServiceError('cities', 'Unable to load cities for the selected province.');
    }

    return cities;
  }

  async getDistricts(city: string): Promise<ShippingDistrict[]> {
    await this.simulateLatency('districts');

    const districts = mapDistricts(city);
    if (!city || districts.length === 0) {
      throw new ShippingServiceError('districts', 'Unable to load districts for the selected city.');
    }

    return districts;
  }

  async getShippingRates(address: ShippingRateRequest): Promise<ShippingRate[]> {
    await this.simulateLatency('rates');

    const rates = mapShippingRates(address.district);

    if (!address.province || !address.city || !address.district || !address.postalCode) {
      throw new ShippingServiceError('rates', 'Unable to load shipping rates for this address.');
    }

    return rates;
  }

  private async simulateLatency(resource: ShippingServiceResource): Promise<void> {
    await new Promise((resolve) => {
      window.setTimeout(resolve, this.latencyMs);
    });

    if (this.failureModes[resource]) {
      throw new ShippingServiceError(resource, this.getFailureMessage(resource));
    }
  }

  private getFailureMessage(resource: ShippingServiceResource): string {
    switch (resource) {
      case 'provinces':
        return 'Unable to load provinces.';
      case 'cities':
        return 'Unable to load cities for the selected province.';
      case 'districts':
        return 'Unable to load districts for the selected city.';
      case 'rates':
        return 'Unable to load shipping rates.';
      default:
        return 'Unable to load shipping data.';
    }
  }
}
