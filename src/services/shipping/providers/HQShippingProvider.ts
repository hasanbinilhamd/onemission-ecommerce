import { env } from '../../../app/config/env';
import { ShippingServiceError } from '../errors';
import type {
  ShippingProvider,
  ShippingProviderCityDto,
  ShippingProviderDistrictDto,
  ShippingProviderProvinceDto,
  ShippingProviderRateDto,
  ShippingRateRequest,
} from '../types';

const DEFAULT_ORIGIN_DISTRICT_ID = '471';

interface HQShippingProvinceResponseDto {
  id: string;
  name: string;
}

interface HQShippingCityResponseDto {
  id: string;
  provinceId?: string;
  name: string;
}

interface HQShippingDistrictResponseDto {
  id: string;
  cityId?: string;
  name: string;
  postalCode?: string;
  postal_code?: string;
}

interface HQShippingRateResponseDto {
  courier: string;
  courierName?: string;
  service: string;
  description?: string;
  estimated_delivery?: string;
  cost: number;
}

export class HQShippingProvider implements ShippingProvider {
  private readonly baseUrl: string;

  constructor() {
    const apiBaseUrl = env.apiBaseUrl.trim().replace(/\/$/, '');
    this.baseUrl = apiBaseUrl;
  }

  async getProvinces(): Promise<ShippingProviderProvinceDto[]> {
    const response = await this.fetchJson<HQShippingProvinceResponseDto[]>('shipping/provinces', 'provinces');
    return response.map((item) => ({
      providerId: String(item.id),
      label: String(item.name),
    }));
  }

  async getCities(province: string): Promise<ShippingProviderCityDto[]> {
    const response = await this.fetchJson<HQShippingCityResponseDto[]>(`shipping/cities?provinceId=${encodeURIComponent(province)}`, 'cities');
    return response.map((item) => ({
      providerId: String(item.id),
      parentProvinceId: String(item.provinceId ?? province),
      label: String(item.name),
    }));
  }

  async getDistricts(city: string): Promise<ShippingProviderDistrictDto[]> {
    const response = await this.fetchJson<HQShippingDistrictResponseDto[]>(`shipping/districts?cityId=${encodeURIComponent(city)}`, 'districts');
    return response.map((item) => ({
      providerId: String(item.id),
      parentCityId: String(item.cityId ?? city),
      label: String(item.name),
      postalCode: String(item.postalCode ?? item.postal_code ?? ''),
    }));
  }

  async getShippingRates(address: ShippingRateRequest): Promise<ShippingProviderRateDto[]> {
    if (!address.districtId) {
      throw new ShippingServiceError('rates', 'Please select a valid district before requesting shipping rates.', false);
    }

    const response = await this.fetchJson<HQShippingRateResponseDto[]>('shipping/cost', 'rates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originDistrict: DEFAULT_ORIGIN_DISTRICT_ID,
        destinationDistrict: address.districtId,
        destinationPostalCode: address.postalCode,
        weight: address.weightGrams ?? 1000,
        courier: 'all',
      }),
    });

    return response.map((item) => ({
      providerId: `${item.courier}-${item.service}`.toLowerCase(),
      vendorCode: String(item.courier || '').toLowerCase(),
      vendorName: String(item.courierName || item.courier || '').toUpperCase() === String(item.courier || '').toUpperCase()
        ? String(item.courierName || item.courier || '').replace(/^./, (value) => value.toUpperCase())
        : String(item.courierName || item.courier || ''),
      serviceLabel: String(item.service || item.description || ''),
      estimatedDeliveryLabel: String(item.estimated_delivery || ''),
      amount: Number(item.cost || 0),
      logoText: String(item.courier || '').slice(0, 3).toUpperCase(),
    }));
  }

  private async fetchJson<T>(
    path: string,
    resource: 'provinces' | 'cities' | 'districts' | 'rates',
    init?: RequestInit,
  ): Promise<T> {
    if (!this.baseUrl) {
      throw new ShippingServiceError(resource, 'Commerce API base URL is not configured.', false);
    }

    const response = await fetch(`${this.baseUrl}/${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.headers ?? {}),
      },
    }).catch(() => {
      throw new ShippingServiceError(resource, 'Unable to connect to the shipping service. Please try again.');
    });

    if (!response.ok) {
      throw new ShippingServiceError(resource, 'The shipping service is currently unavailable. Please retry.');
    }

    return response.json() as Promise<T>;
  }
}
