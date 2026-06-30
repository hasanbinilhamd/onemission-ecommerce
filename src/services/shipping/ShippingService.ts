import type {
  ShippingCity,
  ShippingDistrict,
  ShippingProvince,
  ShippingRate,
  ShippingRateRequest,
} from '../../types';

export interface ShippingService {
  getProvinces(): Promise<ShippingProvince[]>;
  getCities(province: string): Promise<ShippingCity[]>;
  getDistricts(city: string): Promise<ShippingDistrict[]>;
  getShippingRates(address: ShippingRateRequest): Promise<ShippingRate[]>;
}
