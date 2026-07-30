import { useCustomerAuthContext } from './CustomerAuthContext';

export function useAuthenticatedCustomer() {
  return useCustomerAuthContext();
}
