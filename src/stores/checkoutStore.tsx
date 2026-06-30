import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type {
  CheckoutContactInformation,
  CheckoutDeliveryOption,
  CheckoutPaymentOption,
  CheckoutShippingAddress,
} from '../types';

export type CheckoutContactField = keyof CheckoutContactInformation;
export type CheckoutShippingField = keyof CheckoutShippingAddress;

export interface CheckoutState {
  contactInformation: CheckoutContactInformation;
  shippingAddress: CheckoutShippingAddress;
  deliveryMethod: CheckoutDeliveryOption | null;
  paymentMethod: CheckoutPaymentOption | null;
}

interface CheckoutContextValue {
  checkout: CheckoutState;
  updateContactField: (field: CheckoutContactField, value: string) => void;
  updateContactInformation: (values: Partial<CheckoutContactInformation>) => void;
  updateShippingField: (field: CheckoutShippingField, value: string) => void;
  updateShippingAddress: (values: Partial<CheckoutShippingAddress>) => void;
  setDeliveryMethod: (method: CheckoutDeliveryOption | null) => void;
  setPaymentMethod: (method: CheckoutPaymentOption | null) => void;
  resetCheckout: () => void;
}

const initialCheckoutState: CheckoutState = {
  contactInformation: {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  },
  shippingAddress: {
    country: '',
    province: '',
    city: '',
    district: '',
    postalCode: '',
    streetAddress: '',
  },
  deliveryMethod: null,
  paymentMethod: null,
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [checkout, setCheckout] = useState<CheckoutState>(initialCheckoutState);

  const updateContactField = useCallback((field: CheckoutContactField, value: string) => {
    setCheckout(previous => ({
      ...previous,
      contactInformation: {
        ...previous.contactInformation,
        [field]: value,
      },
    }));
  }, []);

  const updateContactInformation = useCallback((values: Partial<CheckoutContactInformation>) => {
    setCheckout(previous => ({
      ...previous,
      contactInformation: {
        ...previous.contactInformation,
        ...values,
      },
    }));
  }, []);

  const updateShippingField = useCallback((field: CheckoutShippingField, value: string) => {
    setCheckout(previous => ({
      ...previous,
      shippingAddress: {
        ...previous.shippingAddress,
        [field]: value,
      },
    }));
  }, []);

  const updateShippingAddress = useCallback((values: Partial<CheckoutShippingAddress>) => {
    setCheckout(previous => ({
      ...previous,
      shippingAddress: {
        ...previous.shippingAddress,
        ...values,
      },
    }));
  }, []);

  const setDeliveryMethod = useCallback((method: CheckoutDeliveryOption | null) => {
    setCheckout(previous => ({
      ...previous,
      deliveryMethod: method,
    }));
  }, []);

  const setPaymentMethod = useCallback((method: CheckoutPaymentOption | null) => {
    setCheckout(previous => ({
      ...previous,
      paymentMethod: method,
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
    updateShippingAddress,
    setDeliveryMethod,
    setPaymentMethod,
    resetCheckout,
  }), [
    checkout,
    updateContactField,
    updateContactInformation,
    updateShippingField,
    updateShippingAddress,
    setDeliveryMethod,
    setPaymentMethod,
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
