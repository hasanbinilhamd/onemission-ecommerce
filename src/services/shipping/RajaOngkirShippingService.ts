import type {
  ShippingCity,
  ShippingDistrict,
  ShippingProvince,
  ShippingRate,
  ShippingRateRequest,
} from '../../types';
import type { ShippingService } from './ShippingService';

/**
 * Future integration point.
 *
 * When ONEMISSION Commerce is allowed to integrate RajaOngkir, replace the
 * exported instance in `src/services/shipping/index.ts` with this class.
 * The Checkout UI should not require any structural changes because it only
 * communicates through the ShippingService interface.
 */
export class RajaOngkirShippingService implements ShippingService {
  async getProvinces(): Promise<ShippingProvince[]> {
    throw new Error('RajaOngkirShippingService is not implemented in this sprint.');
  }

  async getCities(province: string): Promise<ShippingCity[]> {
    void province;
    throw new Error('RajaOngkirShippingService is not implemented in this sprint.');
  }

  async getDistricts(city: string): Promise<ShippingDistrict[]> {
    void city;
    throw new Error('RajaOngkirShippingService is not implemented in this sprint.');
  }

  async getShippingRates(address: ShippingRateRequest): Promise<ShippingRate[]> {
    void address;
    throw new Error('RajaOngkirShippingService is not implemented in this sprint.');
  }
}
