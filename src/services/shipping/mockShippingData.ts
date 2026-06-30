import type {
  ShippingCity,
  ShippingDistrict,
  ShippingProvince,
  ShippingRate,
} from '../../types';

interface MockShippingDistrictRecord extends ShippingDistrict {
  baseRegularCost: number;
}

interface MockShippingCityRecord extends ShippingCity {
  districts: MockShippingDistrictRecord[];
}

interface MockShippingProvinceRecord extends ShippingProvince {
  cities: MockShippingCityRecord[];
}

export const MOCK_SHIPPING_DATA: MockShippingProvinceRecord[] = [
  {
    id: 'jawa-barat',
    name: 'Jawa Barat',
    cities: [
      {
        id: 'bandung',
        provinceId: 'jawa-barat',
        name: 'Bandung',
        districts: [
          {
            id: 'coblong',
            cityId: 'bandung',
            name: 'Coblong',
            postalCode: '40135',
            baseRegularCost: 18000,
          },
          {
            id: 'lengkong',
            cityId: 'bandung',
            name: 'Lengkong',
            postalCode: '40261',
            baseRegularCost: 19000,
          },
        ],
      },
      {
        id: 'bekasi',
        provinceId: 'jawa-barat',
        name: 'Bekasi',
        districts: [
          {
            id: 'bekasi-selatan',
            cityId: 'bekasi',
            name: 'Bekasi Selatan',
            postalCode: '17148',
            baseRegularCost: 17000,
          },
          {
            id: 'pondok-gede',
            cityId: 'bekasi',
            name: 'Pondok Gede',
            postalCode: '17411',
            baseRegularCost: 18500,
          },
        ],
      },
    ],
  },
  {
    id: 'dki-jakarta',
    name: 'DKI Jakarta',
    cities: [
      {
        id: 'jakarta-selatan',
        provinceId: 'dki-jakarta',
        name: 'Jakarta Selatan',
        districts: [
          {
            id: 'kebayoran-baru',
            cityId: 'jakarta-selatan',
            name: 'Kebayoran Baru',
            postalCode: '12130',
            baseRegularCost: 16000,
          },
          {
            id: 'tebet',
            cityId: 'jakarta-selatan',
            name: 'Tebet',
            postalCode: '12820',
            baseRegularCost: 16500,
          },
        ],
      },
      {
        id: 'jakarta-pusat',
        provinceId: 'dki-jakarta',
        name: 'Jakarta Pusat',
        districts: [
          {
            id: 'menteng',
            cityId: 'jakarta-pusat',
            name: 'Menteng',
            postalCode: '10310',
            baseRegularCost: 17500,
          },
          {
            id: 'tanah-abang',
            cityId: 'jakarta-pusat',
            name: 'Tanah Abang',
            postalCode: '10240',
            baseRegularCost: 18000,
          },
        ],
      },
    ],
  },
  {
    id: 'jawa-timur',
    name: 'Jawa Timur',
    cities: [
      {
        id: 'surabaya',
        provinceId: 'jawa-timur',
        name: 'Surabaya',
        districts: [
          {
            id: 'wonokromo',
            cityId: 'surabaya',
            name: 'Wonokromo',
            postalCode: '60243',
            baseRegularCost: 20000,
          },
          {
            id: 'sukolilo',
            cityId: 'surabaya',
            name: 'Sukolilo',
            postalCode: '60111',
            baseRegularCost: 21000,
          },
        ],
      },
      {
        id: 'malang',
        provinceId: 'jawa-timur',
        name: 'Malang',
        districts: [
          {
            id: 'klojen',
            cityId: 'malang',
            name: 'Klojen',
            postalCode: '65111',
            baseRegularCost: 19500,
          },
          {
            id: 'lowokwaru',
            cityId: 'malang',
            name: 'Lowokwaru',
            postalCode: '65141',
            baseRegularCost: 20500,
          },
        ],
      },
    ],
  },
];

export function mapProvinces(): ShippingProvince[] {
  return MOCK_SHIPPING_DATA.map(({ id, name }) => ({ id, name }));
}

export function mapCities(provinceName: string): ShippingCity[] {
  const province = MOCK_SHIPPING_DATA.find((item) => item.name === provinceName);
  return province?.cities.map(({ id, name, provinceId }) => ({ id, name, provinceId })) ?? [];
}

export function mapDistricts(cityName: string): ShippingDistrict[] {
  const city = MOCK_SHIPPING_DATA.flatMap((province) => province.cities).find((item) => item.name === cityName);
  return city?.districts.map(({ id, name, cityId, postalCode }) => ({ id, name, cityId, postalCode })) ?? [];
}

export function mapShippingRates(districtName: string): ShippingRate[] {
  const district = MOCK_SHIPPING_DATA
    .flatMap((province) => province.cities)
    .flatMap((city) => city.districts)
    .find((item) => item.name === districtName);

  if (!district) {
    return [];
  }

  const regularCost = district.baseRegularCost;

  return [
    {
      id: `${district.id}-jne-regular`,
      courierCode: 'jne',
      courierName: 'JNE',
      serviceName: 'Regular',
      estimatedDelivery: '2–3 Days',
      cost: regularCost,
      logoText: 'JNE',
    },
    {
      id: `${district.id}-jnt-express`,
      courierCode: 'jnt',
      courierName: 'J&T',
      serviceName: 'Express',
      estimatedDelivery: '1–2 Days',
      cost: regularCost + 4000,
      logoText: 'J&T',
    },
    {
      id: `${district.id}-sicepat-best`,
      courierCode: 'sicepat',
      courierName: 'SiCepat',
      serviceName: 'BEST',
      estimatedDelivery: '1 Day',
      cost: regularCost + 10000,
      logoText: 'SC',
    },
  ];
}
