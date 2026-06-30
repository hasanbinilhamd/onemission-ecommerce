import type { Customer } from '../../types';

// ─── Customer Service ─────────────────────────────────────────────────────────
// Placeholder service layer for customer data.
// Replace function bodies with real API calls when authentication is set up.

export async function getCustomer(id: string): Promise<Customer | null> {
  void id;
  return Promise.resolve(null);
}

export async function updateCustomer(
  id: string,
  data: Partial<Customer>,
): Promise<Customer | null> {
  void id;
  void data;
  return Promise.resolve(null);
}
