import { useCustomerAuthContext } from './CustomerAuthProvider';

export function useAuthenticatedCustomer() {
  return useCustomerAuthContext();
}
