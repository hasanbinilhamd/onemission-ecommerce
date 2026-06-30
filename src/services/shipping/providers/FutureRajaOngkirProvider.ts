import type {
  ShippingProvider,
  ShippingProviderCityDto,
  ShippingProviderDistrictDto,
  ShippingProviderProvinceDto,
  ShippingProviderRateDto,
  ShippingRateRequest,
} from '../types';

/**
 * Future RajaOngkir integration point.
 *
 * Implement vendor-specific requests and response mapping inside this provider.
 * Checkout components should remain unchanged because they only depend on
 * ShippingService, never on this provider directly.
 */
export class FutureRajaOngkirProvider implements ShippingProvider {
  async getProvinces(): Promise<ShippingProviderProvinceDto[]> {
    throw new Error('FutureRajaOngkirProvider is not implemented in this sprint.');
  }

  async getCities(province: string): Promise<ShippingProviderCityDto[]> {
    void province;
    throw new Error('FutureRajaOngkirProvider is not implemented in this sprint.');
  }

  async getDistricts(city: string): Promise<ShippingProviderDistrictDto[]> {
    void city;
    throw new Error('FutureRajaOngkirProvider is not implemented in this sprint.');
  }

  async getShippingRates(address: ShippingRateRequest): Promise<ShippingProviderRateDto[]> {
    void address;
    throw new Error('FutureRajaOngkirProvider is not implemented in this sprint.');
  }
}
