import type { CustomerAuthCustomer } from '../../services/auth/customerAuthService';

export interface AuthenticatedCustomerProfile {
  customerId: string;
  customerCode: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  authProvider: string;
  emailVerified: boolean;
  initials: string;
}

function buildInitials(fullName: string, email: string) {
  const source = fullName.trim() || email.trim();
  if (!source) {
    return 'OM';
  }

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

export function getAuthenticatedCustomerProfile(customer: CustomerAuthCustomer | null): AuthenticatedCustomerProfile | null {
  if (!customer?.email) {
    return null;
  }

  return {
    customerId: customer.id,
    customerCode: customer.customerCode,
    email: customer.email,
    fullName: customer.customerName,
    phone: customer.phone,
    avatarUrl: customer.avatarUrl,
    authProvider: customer.authProvider,
    emailVerified: customer.emailVerified,
    initials: buildInitials(customer.customerName, customer.email),
  };
}
