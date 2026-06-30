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

export interface RajaOngkirMeta {
  message?: string;
  code?: number;
  status?: string;
}

export interface RajaOngkirResponseEnvelope<T> {
  meta?: RajaOngkirMeta;
  data?: T;
}

export interface RajaOngkirProvinceResponseItem {
  id?: string | number;
  province_id?: string | number;
  name?: string;
  province?: string;
}

export interface RajaOngkirCityResponseItem {
  id?: string | number;
  city_id?: string | number;
  province_id?: string | number;
  name?: string;
  city_name?: string;
  city?: string;
}

export interface RajaOngkirDistrictResponseItem {
  id?: string | number;
  district_id?: string | number;
  city_id?: string | number;
  name?: string;
  district_name?: string;
  subdistrict_name?: string;
  postal_code?: string;
  zip_code?: string;
}

export interface RajaOngkirRateCostItem {
  value?: number;
  amount?: number;
}

export interface RajaOngkirRateServiceItem {
  service?: string;
  name?: string;
  description?: string;
  code?: string;
  cost?: RajaOngkirRateCostItem[];
  price?: number;
  etd?: string;
  estimate?: string;
}

export interface RajaOngkirRateCourierItem {
  code?: string;
  name?: string;
  service?: string;
  costs?: RajaOngkirRateServiceItem[];
  cost?: number;
  price?: number;
  etd?: string;
  description?: string;
}
