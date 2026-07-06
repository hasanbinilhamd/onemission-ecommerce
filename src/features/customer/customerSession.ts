import type { User } from '@supabase/supabase-js';

export interface AuthenticatedCustomerProfile {
  customerId: string;
  email: string;
  fullName: string;
  phone: string;
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

export function getAuthenticatedCustomerProfile(user: User | null): AuthenticatedCustomerProfile | null {
  if (!user?.email) {
    return null;
  }

  const metadata = user.user_metadata ?? {};
  const fullName = String(metadata.fullName || metadata.full_name || '').trim();
  const phone = String(metadata.phone || '').trim();
  const customerId = String(metadata.customerId || metadata.customer_id || '').trim();

  return {
    customerId,
    email: user.email,
    fullName,
    phone,
    initials: buildInitials(fullName, user.email),
  };
}
