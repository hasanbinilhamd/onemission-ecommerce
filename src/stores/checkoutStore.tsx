import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
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

interface CheckoutContextValue {
  checkout: CheckoutState;
  updateContactField: (field: CheckoutContactField, value: string) => void;
  updateContactInformation: (values: Partial<CheckoutContactInformation>) => void;
  updateShippingField: (field: CheckoutShippingField, value: string) => void;
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

const initialShippingState: CheckoutShippingState = {
  provinces: [],
  cities: [],
  districts: [],
  rates: [],
  selectedRate: null,
  loading: {
    provinces: false,
    cities: false,
    districts: false,
    rates: false,
  },
  errors: {
    provinces: null,
    cities: null,
    districts: null,
    rates: null,
  },
};

const initialCheckoutState: CheckoutState = {
  contactInformation: {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  },
  shippingAddress: {
    country: 'Indonesia',
    provinceId: '',
    province: '',
    cityId: '',
    city: '',
    districtId: '',
    district: '',
    postalCode: '',
    streetAddress: '',
  },
  shipping: initialShippingState,
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [checkout, setCheckout] = useState<CheckoutState>(initialCheckoutState);

  const updateContactField = useCallback((field: CheckoutContactField, value: string) => {
    setCheckout((previous) => ({
      ...previous,
      contactInformation: {
        ...previous.contactInformation,
        [field]: value,
      },
    }));
  }, []);

  const updateContactInformation = useCallback((values: Partial<CheckoutContactInformation>) => {
    setCheckout((previous) => ({
      ...previous,
      contactInformation: {
        ...previous.contactInformation,
        ...values,
      },
    }));
  }, []);

  const updateShippingField = useCallback((field: CheckoutShippingField, value: string) => {
    setCheckout((previous) => ({
      ...previous,
      shippingAddress: {
        ...previous.shippingAddress,
        [field]: value,
      },
    }));
  }, []);

  const selectShippingProvince = useCallback((province: ShippingProvince | null) => {
    setCheckout((previous) => ({
      ...previous,
      shippingAddress: {
        ...previous.shippingAddress,
        provinceId: province?.id ?? '',
        province: province?.name ?? '',
        cityId: '',
        city: '',
        districtId: '',
        district: '',
        postalCode: '',
      },
      shipping: {
        ...previous.shipping,
        cities: [],
        districts: [],
        rates: [],
        selectedRate: null,
        loading: {
          ...previous.shipping.loading,
          cities: false,
          districts: false,
          rates: false,
        },
        errors: {
          ...previous.shipping.errors,
          cities: null,
          districts: null,
          rates: null,
        },
      },
    }));
  }, []);

  const selectShippingCity = useCallback((city: ShippingCity | null) => {
    setCheckout((previous) => ({
      ...previous,
      shippingAddress: {
        ...previous.shippingAddress,
        cityId: city?.id ?? '',
        city: city?.name ?? '',
        districtId: '',
        district: '',
        postalCode: '',
      },
      shipping: {
        ...previous.shipping,
        districts: [],
        rates: [],
        selectedRate: null,
        loading: {
          ...previous.shipping.loading,
          districts: false,
          rates: false,
        },
        errors: {
          ...previous.shipping.errors,
          districts: null,
          rates: null,
        },
      },
    }));
  }, []);

  const selectShippingDistrict = useCallback((district: ShippingDistrict | null) => {
    setCheckout((previous) => ({
      ...previous,
      shippingAddress: {
        ...previous.shippingAddress,
        districtId: district?.id ?? '',
        district: district?.name ?? '',
      },
      shipping: {
        ...previous.shipping,
        rates: [],
        selectedRate: null,
        loading: {
          ...previous.shipping.loading,
          rates: false,
        },
        errors: {
          ...previous.shipping.errors,
          rates: null,
        },
      },
    }));
  }, []);

  const setShippingProvinces = useCallback((provinces: ShippingProvince[]) => {
    setCheckout((previous) => ({
      ...previous,
      shipping: {
        ...previous.shipping,
        provinces,
      },
    }));
  }, []);

  const setShippingCities = useCallback((cities: ShippingCity[]) => {
    setCheckout((previous) => ({
      ...previous,
      shipping: {
        ...previous.shipping,
        cities,
      },
    }));
  }, []);

  const setShippingDistricts = useCallback((districts: ShippingDistrict[]) => {
    setCheckout((previous) => ({
      ...previous,
      shipping: {
        ...previous.shipping,
        districts,
      },
    }));
  }, []);

  const setShippingRates = useCallback((rates: ShippingRate[]) => {
    setCheckout((previous) => ({
      ...previous,
      shipping: {
        ...previous.shipping,
        rates,
      },
    }));
  }, []);

  const setSelectedShippingRate = useCallback((rate: ShippingRate | null) => {
    setCheckout((previous) => ({
      ...previous,
      shipping: {
        ...previous.shipping,
        selectedRate: rate,
      },
    }));
  }, []);

  const setShippingLoading = useCallback((resource: ShippingAsyncResource, value: boolean) => {
    setCheckout((previous) => ({
      ...previous,
      shipping: {
        ...previous.shipping,
        loading: {
          ...previous.shipping.loading,
          [resource]: value,
        },
      },
    }));
  }, []);

  const setShippingError = useCallback((resource: ShippingAsyncResource, message: string | null) => {
    setCheckout((previous) => ({
      ...previous,
      shipping: {
        ...previous.shipping,
        errors: {
          ...previous.shipping.errors,
          [resource]: message,
        },
      },
    }));
  }, []);

  const resetCheckout = useCallback(() => {
    setCheckout(initialCheckoutState);
  }, []);

  const value = useMemo<CheckoutContextValue>(() => ({
    checkout,
    updateContactField,
    updateContactInformation,
    updateShippingField,
    selectShippingProvince,
    selectShippingCity,
    selectShippingDistrict,
    setShippingProvinces,
    setShippingCities,
    setShippingDistricts,
    setShippingRates,
    setSelectedShippingRate,
    setShippingLoading,
    setShippingError,
    resetCheckout,
  }), [
    checkout,
    updateContactField,
    updateContactInformation,
    updateShippingField,
    selectShippingProvince,
    selectShippingCity,
    selectShippingDistrict,
    setShippingProvinces,
    setShippingCities,
    setShippingDistricts,
    setShippingRates,
    setSelectedShippingRate,
    setShippingLoading,
    setShippingError,
    resetCheckout,
  ]);

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckoutStore(): CheckoutContextValue {
  const context = useContext(CheckoutContext);

  if (!context) {
    throw new Error('useCheckoutStore must be used within a CheckoutProvider');
  }

  return context;
}
