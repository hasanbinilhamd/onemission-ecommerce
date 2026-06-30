import type { Order, OrderStatus } from '../../types';

// ─── Order Service ────────────────────────────────────────────────────────────
// Placeholder service layer for order management.
// Replace function bodies with real API calls when checkout is implemented.

export async function getOrders(customerId: string): Promise<Order[]> {
  void customerId;
  return Promise.resolve([]);
}

export async function getOrderById(id: string): Promise<Order | null> {
  void id;
  return Promise.resolve(null);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order | null> {
  void id;
  void status;
  return Promise.resolve(null);
}
