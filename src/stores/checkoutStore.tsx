import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export interface CheckoutContactInformation {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export type CheckoutContactField = keyof CheckoutContactInformation;

export interface CheckoutState {
  contactInformation: CheckoutContactInformation;
  shippingAddress: null;
  deliveryMethod: null;
  paymentMethod: null;
}

interface CheckoutContextValue {
  checkout: CheckoutState;
  updateContactField: (field: CheckoutContactField, value: string) => void;
  updateContactInformation: (values: Partial<CheckoutContactInformation>) => void;
  resetCheckout: () => void;
}

export const initialCheckoutContactInformation: CheckoutContactInformation = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
};

const initialCheckoutState: CheckoutState = {
  contactInformation: initialCheckoutContactInformation,
  shippingAddress: null,
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

  const resetCheckout = useCallback(() => {
    setCheckout(initialCheckoutState);
  }, []);

  const value = useMemo<CheckoutContextValue>(() => ({
    checkout,
    updateContactField,
    updateContactInformation,
    resetCheckout,
  }), [checkout, updateContactField, updateContactInformation, resetCheckout]);

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckoutStore(): CheckoutContextValue {
  const context = useContext(CheckoutContext);

  if (!context) {
    throw new Error('useCheckoutStore must be used within a CheckoutProvider');
  }

  return context;
}
