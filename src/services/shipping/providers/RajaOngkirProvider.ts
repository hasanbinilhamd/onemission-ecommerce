import { env } from '../../../app/config/env';
import { ShippingServiceError } from '../errors';
import {
  normalizeRajaOngkirCity,
  normalizeRajaOngkirDistrict,
  normalizeRajaOngkirProvince,
  normalizeRajaOngkirRates,
} from '../mappers';
import type {
  RajaOngkirCityResponseItem,
  RajaOngkirDistrictResponseItem,
  RajaOngkirProvinceResponseItem,
  RajaOngkirRateCourierItem,
  RajaOngkirResponseEnvelope,
  ShippingProvider,
  ShippingProviderCityDto,
  ShippingProviderDistrictDto,
  ShippingProviderProvinceDto,
  ShippingProviderRateDto,
  ShippingRateRequest,
} from '../types';

const SUPPORTED_COURIER_CODES = ['jne', 'jnt', 'sicepat', 'pos', 'ninja', 'anteraja'] as const;
const DEFAULT_ORIGIN_DISTRICT_ID = '1391';
const REQUEST_TIMEOUT_MS = 15000;

/**
 * RajaOngkir provider.
 *
 * This provider is the only place where RajaOngkir-specific requests and
 * response normalization should live. Checkout components remain provider
 * agnostic and continue to communicate through ShippingService only.
 */
export class RajaOngkirProvider implements ShippingProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = env.rajaOngkirApiKey.trim();
    this.baseUrl = env.rajaOngkirBaseUrl.trim();
  }

  async getProvinces(): Promise<ShippingProviderProvinceDto[]> {
    const response = await this.fetchJson<RajaOngkirProvinceResponseItem[]>('destination/province', 'provinces');
    return (response.data ?? []).map(normalizeRajaOngkirProvince).filter((item) => item.providerId && item.label);
  }

  async getCities(province: string): Promise<ShippingProviderCityDto[]> {
    const response = await this.fetchJson<RajaOngkirCityResponseItem[]>(
      `destination/city/${encodeURIComponent(province)}`,
      'cities',
    );

    return (response.data ?? []).map(normalizeRajaOngkirCity).filter((item) => item.providerId && item.label);
  }

  async getDistricts(city: string): Promise<ShippingProviderDistrictDto[]> {
    const response = await this.fetchJson<RajaOngkirDistrictResponseItem[]>(
      `destination/district/${encodeURIComponent(city)}`,
      'districts',
    );

    return (response.data ?? []).map(normalizeRajaOngkirDistrict).filter((item) => item.providerId && item.label);
  }

  async getShippingRates(address: ShippingRateRequest): Promise<ShippingProviderRateDto[]> {
    const params = new URLSearchParams();
    params.set('origin', DEFAULT_ORIGIN_DISTRICT_ID);
    params.set('destination', address.district);
    params.set('weight', String(address.weightGrams ?? 1000));
    params.set('courier', SUPPORTED_COURIER_CODES.join(':'));
    params.set('price', 'lowest');

    const response = await this.fetchJson<RajaOngkirRateCourierItem[]>(
      'calculate/district/domestic-cost',
      'rates',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      },
    );

    return normalizeRajaOngkirRates(response.data ?? []);
  }

  private async fetchJson<T>(
    path: string,
    resource: 'provinces' | 'cities' | 'districts' | 'rates',
    init: RequestInit = {},
  ): Promise<RajaOngkirResponseEnvelope<T>> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const url = new URL(path, this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`).toString();

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          key: this.apiKey,
          ...(init.headers ?? {}),
        },
      });

      if (!response.ok) {
        throw this.createHttpError(resource, response.status);
      }

      const data = await response.json() as RajaOngkirResponseEnvelope<T>;
      return data;
    } catch (error) {
      this.logTechnicalError(resource, error);

      if (error instanceof ShippingServiceError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ShippingServiceError(resource, 'The shipping service took too long to respond. Please retry.');
      }

      throw new ShippingServiceError(resource, 'We could not connect to the shipping service. Please try again.');
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  private createHttpError(
    resource: 'provinces' | 'cities' | 'districts' | 'rates',
    status: number,
  ): ShippingServiceError {
    if (status === 401 || status === 403) {
      return new ShippingServiceError(resource, 'The shipping service authorization failed. Please try again later.', false);
    }

    if (status === 408) {
      return new ShippingServiceError(resource, 'The shipping service timed out. Please retry.');
    }

    if (status === 429) {
      return new ShippingServiceError(resource, 'The shipping service is busy right now. Please retry in a moment.');
    }

    return new ShippingServiceError(resource, 'The shipping service is currently unavailable. Please retry.');
  }

  private logTechnicalError(resource: string, error: unknown) {
    console.error(`[RajaOngkirProvider:${resource}]`, error);
  }
}
