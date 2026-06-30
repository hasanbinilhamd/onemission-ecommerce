import type {
  ShippingCity as AppShippingCity,
  ShippingDistrict as AppShippingDistrict,
  ShippingProvince as AppShippingProvince,
  ShippingRate as AppShippingRate,
  ShippingRateRequest as AppShippingRateRequest,
} from '../../types';

export type ShippingProvince = AppShippingProvince;
export type ShippingCity = AppShippingCity;
export type ShippingDistrict = AppShippingDistrict;
export type ShippingRate = AppShippingRate;
export type ShippingRateRequest = AppShippingRateRequest;
export type ShippingServiceResource = 'provinces' | 'cities' | 'districts' | 'rates';

export interface ShippingProviderProvinceDto {
  providerId: string;
  label: string;
}

export interface ShippingProviderCityDto {
  providerId: string;
  parentProvinceId: string;
  label: string;
}

export interface ShippingProviderDistrictDto {
  providerId: string;
  parentCityId: string;
  label: string;
  postalCode: string;
}

export interface ShippingProviderRateDto {
  providerId: string;
  vendorCode: string;
  vendorName: string;
  serviceLabel: string;
  estimatedDeliveryLabel: string;
  amount: number;
  logoText: string;
}

export interface ShippingProvider {
  getProvinces(): Promise<ShippingProviderProvinceDto[]>;
  getCities(province: string): Promise<ShippingProviderCityDto[]>;
  getDistricts(city: string): Promise<ShippingProviderDistrictDto[]>;
  getShippingRates(address: ShippingRateRequest): Promise<ShippingProviderRateDto[]>;
}
