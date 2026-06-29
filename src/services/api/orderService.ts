import type { Order, OrderStatus } from '../../types';

// ─── Order Service ────────────────────────────────────────────────────────────
// Placeholder service layer for order management.
// Replace function bodies with real API calls when checkout is implemented.

export async function getOrders(_customerId: string): Promise<Order[]> {
  return Promise.resolve([]);
}

export async function getOrderById(_id: string): Promise<Order | null> {
  return Promise.resolve(null);
}

export async function updateOrderStatus(
  _id: string,
  _status: OrderStatus,
): Promise<Order | null> {
  return Promise.resolve(null);
}
