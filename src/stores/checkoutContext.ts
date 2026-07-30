import { createContext, useContext } from 'react';
import type {
  CheckoutContactInformation,
  CheckoutShippingAddress,
  ShippingCity,
  ShippingDistrict,
  ShippingProvince,
  ShippingRate,
} from '../types';

export type CheckoutContactField = keyof CheckoutContactInformation;
export type CheckoutShippingField = keyof CheckoutShippingAddress;
export type ShippingAsyncResource = 'provinces' | 'cities' | 'districts' | 'rates';

export interface CheckoutShippingState {
  provinces: ShippingProvince[];
  cities: ShippingCity[];
  districts: ShippingDistrict[];
  rates: ShippingRate[];
  selectedRate: ShippingRate | null;
  loading: Record<ShippingAsyncResource, boolean>;
  errors: Record<ShippingAsyncResource, string | null>;
}

export interface CheckoutState {
  contactInformation: CheckoutContactInformation;
  shippingAddress: CheckoutShippingAddress;
  shipping: CheckoutShippingState;
}

export interface CheckoutContextValue {
  checkout: CheckoutState;
  updateContactField: (field: CheckoutContactField, value: string) => void;
  updateContactInformation: (values: Partial<CheckoutContactInformation>) => void;
  updateShippingField: (field: CheckoutShippingField, value: string) => void;
  updateShippingAddress: (values: Partial<CheckoutShippingAddress>) => void;
  selectShippingProvince: (province: ShippingProvince | null) => void;
  selectShippingCity: (city: ShippingCity | null) => void;
  selectShippingDistrict: (district: ShippingDistrict | null) => void;
  setShippingProvinces: (provinces: ShippingProvince[]) => void;
  setShippingCities: (cities: ShippingCity[]) => void;
  setShippingDistricts: (districts: ShippingDistrict[]) => void;
  setShippingRates: (rates: ShippingRate[]) => void;
  setSelectedShippingRate: (rate: ShippingRate | null) => void;
  setShippingLoading: (resource: ShippingAsyncResource, value: boolean) => void;
  setShippingError: (resource: ShippingAsyncResource, message: string | null) => void;
  resetCheckout: () => void;
}

export const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function useCheckoutStore(): CheckoutContextValue {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckoutStore must be used within a CheckoutProvider');
  }

  return context;
}
