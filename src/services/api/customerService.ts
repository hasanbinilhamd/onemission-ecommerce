import type { Customer } from '../../types';

// ─── Customer Service ─────────────────────────────────────────────────────────
// Placeholder service layer for customer data.
// Replace function bodies with real API calls when authentication is set up.

export async function getCustomer(_id: string): Promise<Customer | null> {
  return Promise.resolve(null);
}

export async function updateCustomer(
  _id: string,
  _data: Partial<Customer>,
): Promise<Customer | null> {
  return Promise.resolve(null);
}
