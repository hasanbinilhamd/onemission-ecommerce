import type { CheckoutDeliveryOption, CheckoutPaymentOption } from '../types';

export interface MockCheckoutDistrict {
  id: string;
  name: string;
  postalCode: string;
}

export interface MockCheckoutCity {
  id: string;
  name: string;
  districts: MockCheckoutDistrict[];
}

export interface MockCheckoutProvince {
  id: string;
  name: string;
  cities: MockCheckoutCity[];
}

export interface MockCheckoutCountry {
  id: string;
  name: string;
  provinces: MockCheckoutProvince[];
}

export const MOCK_CHECKOUT_LOCATIONS: MockCheckoutCountry[] = [
  {
    id: 'indonesia',
    name: 'Indonesia',
    provinces: [
      {
        id: 'dki-jakarta',
        name: 'DKI Jakarta',
        cities: [
          {
            id: 'jakarta-selatan',
            name: 'South Jakarta',
            districts: [
              { id: 'kebayoran-baru', name: 'Kebayoran Baru', postalCode: '12130' },
              { id: 'tebet', name: 'Tebet', postalCode: '12820' },
            ],
          },
          {
            id: 'jakarta-pusat',
            name: 'Central Jakarta',
            districts: [
              { id: 'menteng', name: 'Menteng', postalCode: '10310' },
              { id: 'tanah-abang', name: 'Tanah Abang', postalCode: '10240' },
            ],
          },
        ],
      },
      {
        id: 'west-java',
        name: 'West Java',
        cities: [
          {
            id: 'bandung',
            name: 'Bandung',
            districts: [
              { id: 'coblong', name: 'Coblong', postalCode: '40132' },
              { id: 'lengkong', name: 'Lengkong', postalCode: '40261' },
            ],
          },
          {
            id: 'bekasi',
            name: 'Bekasi',
            districts: [
              { id: 'bekasi-selatan', name: 'South Bekasi', postalCode: '17148' },
              { id: 'pondok-gede', name: 'Pondok Gede', postalCode: '17411' },
            ],
          },
        ],
      },
      {
        id: 'east-java',
        name: 'East Java',
        cities: [
          {
            id: 'surabaya',
            name: 'Surabaya',
            districts: [
              { id: 'wonokromo', name: 'Wonokromo', postalCode: '60243' },
              { id: 'sukolilo', name: 'Sukolilo', postalCode: '60111' },
            ],
          },
          {
            id: 'malang',
            name: 'Malang',
            districts: [
              { id: 'klojen', name: 'Klojen', postalCode: '65111' },
              { id: 'lowokwaru', name: 'Lowokwaru', postalCode: '65141' },
            ],
          },
        ],
      },
    ],
  },
];

export const MOCK_DELIVERY_OPTIONS: CheckoutDeliveryOption[] = [
  {
    id: 'regular',
    courierName: 'ONEMISSION Courier',
    serviceName: 'Regular',
    estimatedDelivery: '2–4 days',
    price: 18000,
  },
  {
    id: 'express',
    courierName: 'ONEMISSION Courier',
    serviceName: 'Express',
    estimatedDelivery: '1 day',
    price: 35000,
  },
  {
    id: 'economy',
    courierName: 'ONEMISSION Courier',
    serviceName: 'Economy',
    estimatedDelivery: '4–7 days',
    price: 12000,
  },
];

export const MOCK_PAYMENT_OPTIONS: CheckoutPaymentOption[] = [
  {
    id: 'credit-card',
    label: 'Credit Card',
    description: 'Visa, Mastercard and JCB will be connected in a future sprint.',
  },
  {
    id: 'virtual-account',
    label: 'Virtual Account',
    description: 'Bank transfer confirmation will be activated in the next sprint.',
  },
  {
    id: 'qris',
    label: 'QRIS',
    description: 'QR payment confirmation will be connected in the payment sprint.',
  },
  {
    id: 'e-wallet',
    label: 'E-Wallet',
    description: 'Digital wallet authorization will be available in the next sprint.',
  },
];
