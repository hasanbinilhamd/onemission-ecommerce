import { createContext, useContext } from 'react';
import type {
  CustomerAuthCustomer,
  CustomerAuthRegisterRequestResponse,
  CustomerAuthRegisterResendResponse,
} from '../../services/auth/customerAuthService';
import type { AuthenticatedCustomerProfile } from './customerSession';

export interface CustomerAuthContextValue {
  user: CustomerAuthCustomer | null;
  profile: AuthenticatedCustomerProfile | null;
  accessToken: string;
  refreshToken: string;
  isLoading: boolean;
  errorMessage: string | null;
  isConfigured: boolean;
  isGoogleConfigured: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { customerName: string; email: string; phone: string; password: string }) => Promise<CustomerAuthRegisterRequestResponse>;
  verifyRegistrationOtp: (input: { email: string; otp: string }) => Promise<void>;
  resendRegistrationOtp: (input: { email: string }) => Promise<CustomerAuthRegisterResendResponse>;
  getPendingRegistrationEmail: () => string;
  loginWithGoogleToken: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
  getValidAccessToken: () => Promise<string | null>;
  reloadAuthenticatedCustomer: () => Promise<void>;
}

export const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function useCustomerAuthContext() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuthContext must be used within a CustomerAuthProvider');
  }

  return context;
}
