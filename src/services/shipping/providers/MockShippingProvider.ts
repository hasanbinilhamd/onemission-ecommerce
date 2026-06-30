import type {
  ShippingProvider,
  ShippingProviderCityDto,
  ShippingProviderDistrictDto,
  ShippingProviderProvinceDto,
  ShippingProviderRateDto,
  ShippingRateRequest,
  ShippingServiceResource,
} from '../types';
import { ShippingServiceError } from '../errors';

interface MockShippingDistrictRecord extends ShippingProviderDistrictDto {
  baseRegularCost: number;
}

interface MockShippingCityRecord extends ShippingProviderCityDto {
  districts: MockShippingDistrictRecord[];
}

interface MockShippingProvinceRecord extends ShippingProviderProvinceDto {
  cities: MockShippingCityRecord[];
}

interface MockShippingProviderOptions {
  latencyMs?: number;
  failureModes?: Partial<Record<ShippingServiceResource, boolean>>;
}

const MOCK_SHIPPING_DATA: MockShippingProvinceRecord[] = [
  {
    providerId: 'jawa-barat',
    label: 'Jawa Barat',
    cities: [
      {
        providerId: 'bandung',
        parentProvinceId: 'jawa-barat',
        label: 'Bandung',
        districts: [
          {
            providerId: 'coblong',
            parentCityId: 'bandung',
            label: 'Coblong',
            postalCode: '40135',
            baseRegularCost: 18000,
          },
          {
            providerId: 'lengkong',
            parentCityId: 'bandung',
            label: 'Lengkong',
            postalCode: '40261',
            baseRegularCost: 19000,
          },
        ],
      },
      {
        providerId: 'bekasi',
        parentProvinceId: 'jawa-barat',
        label: 'Bekasi',
        districts: [
          {
            providerId: 'bekasi-selatan',
            parentCityId: 'bekasi',
            label: 'Bekasi Selatan',
            postalCode: '17148',
            baseRegularCost: 17000,
          },
          {
            providerId: 'pondok-gede',
            parentCityId: 'bekasi',
            label: 'Pondok Gede',
            postalCode: '17411',
            baseRegularCost: 18500,
          },
        ],
      },
    ],
  },
  {
    providerId: 'dki-jakarta',
    label: 'DKI Jakarta',
    cities: [
      {
        providerId: 'jakarta-selatan',
        parentProvinceId: 'dki-jakarta',
        label: 'Jakarta Selatan',
        districts: [
          {
            providerId: 'kebayoran-baru',
            parentCityId: 'jakarta-selatan',
            label: 'Kebayoran Baru',
            postalCode: '12130',
            baseRegularCost: 16000,
          },
          {
            providerId: 'tebet',
            parentCityId: 'jakarta-selatan',
            label: 'Tebet',
            postalCode: '12820',
            baseRegularCost: 16500,
          },
        ],
      },
      {
        providerId: 'jakarta-pusat',
        parentProvinceId: 'dki-jakarta',
        label: 'Jakarta Pusat',
        districts: [
          {
            providerId: 'menteng',
            parentCityId: 'jakarta-pusat',
            label: 'Menteng',
            postalCode: '10310',
            baseRegularCost: 17500,
          },
          {
            providerId: 'tanah-abang',
            parentCityId: 'jakarta-pusat',
            label: 'Tanah Abang',
            postalCode: '10240',
            baseRegularCost: 18000,
          },
        ],
      },
    ],
  },
  {
    providerId: 'jawa-timur',
    label: 'Jawa Timur',
    cities: [
      {
        providerId: 'surabaya',
        parentProvinceId: 'jawa-timur',
        label: 'Surabaya',
        districts: [
          {
            providerId: 'wonokromo',
            parentCityId: 'surabaya',
            label: 'Wonokromo',
            postalCode: '60243',
            baseRegularCost: 20000,
          },
          {
            providerId: 'sukolilo',
            parentCityId: 'surabaya',
            label: 'Sukolilo',
            postalCode: '60111',
            baseRegularCost: 21000,
          },
        ],
      },
      {
        providerId: 'malang',
        parentProvinceId: 'jawa-timur',
        label: 'Malang',
        districts: [
          {
            providerId: 'klojen',
            parentCityId: 'malang',
            label: 'Klojen',
            postalCode: '65111',
            baseRegularCost: 19500,
          },
          {
            providerId: 'lowokwaru',
            parentCityId: 'malang',
            label: 'Lowokwaru',
            postalCode: '65141',
            baseRegularCost: 20500,
          },
        ],
      },
    ],
  },
];

export class MockShippingProvider implements ShippingProvider {
  private readonly latencyMs: number;
  private readonly failureModes: Partial<Record<ShippingServiceResource, boolean>>;

  constructor(options: MockShippingProviderOptions = {}) {
    this.latencyMs = options.latencyMs ?? 450;
    this.failureModes = options.failureModes ?? {};
  }

  async getProvinces(): Promise<ShippingProviderProvinceDto[]> {
    await this.simulateLatency('provinces');
    return MOCK_SHIPPING_DATA.map(({ providerId, label }) => ({ providerId, label }));
  }

  async getCities(province: string): Promise<ShippingProviderCityDto[]> {
    await this.simulateLatency('cities');

    const provinceRecord = MOCK_SHIPPING_DATA.find((item) => item.label === province);
    if (!province || !provinceRecord) {
      throw new ShippingServiceError('cities', 'Unable to load cities for the selected province.');
    }

    return provinceRecord.cities.map(({ providerId, parentProvinceId, label }) => ({
      providerId,
      parentProvinceId,
      label,
    }));
  }

  async getDistricts(city: string): Promise<ShippingProviderDistrictDto[]> {
    await this.simulateLatency('districts');

    const cityRecord = MOCK_SHIPPING_DATA
      .flatMap((province) => province.cities)
      .find((item) => item.label === city);

    if (!city || !cityRecord) {
      throw new ShippingServiceError('districts', 'Unable to load districts for the selected city.');
    }

    return cityRecord.districts.map(({ providerId, parentCityId, label, postalCode }) => ({
      providerId,
      parentCityId,
      label,
      postalCode,
    }));
  }

  async getShippingRates(address: ShippingRateRequest): Promise<ShippingProviderRateDto[]> {
    await this.simulateLatency('rates');

    if (!address.province || !address.city || !address.district || !address.postalCode) {
      throw new ShippingServiceError('rates', 'Unable to load shipping rates.');
    }

    const districtRecord = MOCK_SHIPPING_DATA
      .flatMap((province) => province.cities)
      .flatMap((city) => city.districts)
      .find((item) => item.label === address.district);

    if (!districtRecord) {
      throw new ShippingServiceError('rates', 'Unable to load shipping rates.');
    }

    const regularCost = districtRecord.baseRegularCost;

    return [
      {
        providerId: `${districtRecord.providerId}-jne-regular`,
        vendorCode: 'jne',
        vendorName: 'JNE',
        serviceLabel: 'Regular',
        estimatedDeliveryLabel: '2–3 Days',
        amount: regularCost,
        logoText: 'JNE',
      },
      {
        providerId: `${districtRecord.providerId}-jnt-express`,
        vendorCode: 'jnt',
        vendorName: 'J&T',
        serviceLabel: 'Express',
        estimatedDeliveryLabel: '1–2 Days',
        amount: regularCost + 4000,
        logoText: 'J&T',
      },
      {
        providerId: `${districtRecord.providerId}-sicepat-best`,
        vendorCode: 'sicepat',
        vendorName: 'SiCepat',
        serviceLabel: 'BEST',
        estimatedDeliveryLabel: '1 Day',
        amount: regularCost + 10000,
        logoText: 'SC',
      },
    ];
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
