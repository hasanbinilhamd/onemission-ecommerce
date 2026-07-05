import { env } from '../../app/config/env';
import type {
  CommerceOrderDetail,
  CommerceOrderListItem,
  CommerceOrderListResponse,
} from '../../types';

interface OrderListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  paymentStatus?: string;
  fulfillmentStatus?: string;
  startDate?: string;
  endDate?: string;
  courier?: string;
}

interface GuestOrderTrackingInput {
  email: string;
  orderNumber: string;
}

function getApiBaseUrl() {
  const apiBaseUrl = env.apiBaseUrl.trim().replace(/\/$/, '');
  if (!apiBaseUrl) {
    throw new Error('Commerce API base URL is not configured.');
  }

  return apiBaseUrl;
}

function buildQueryParams(query: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    params.set(key, String(value));
  }

  return params;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeOrderNumber(orderNumber: string) {
  return orderNumber.trim().toUpperCase();
}

function toListItem(order: CommerceOrderDetail): CommerceOrderListItem {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    orderDate: order.createdAt,
    customerName: order.customerName,
    totalAmount: order.grandTotal,
    paymentStatus: order.payment?.status || 'UNKNOWN',
    fulfillmentStatus: order.fulfillmentStatus,
    fulfillmentStatusLabel: order.fulfillmentStatusLabel,
    courier: order.shipment?.courier || order.shipping?.courier || '',
    totalItems: order.items.length,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || 'Order request failed.');
  }

  return payload as T;
}

export async function listOrders(query: OrderListQuery = {}): Promise<CommerceOrderListResponse> {
  const params = buildQueryParams({
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    search: query.search,
    sortBy: query.sortBy ?? 'createdAt',
    sortOrder: query.sortOrder ?? 'desc',
    paymentStatus: query.paymentStatus,
    fulfillmentStatus: query.fulfillmentStatus,
    startDate: query.startDate,
    endDate: query.endDate,
    courier: query.courier,
  });

  return fetchJson<CommerceOrderListResponse>(`/orders?${params.toString()}`);
}

export async function getOrderById(id: string): Promise<CommerceOrderDetail> {
  return fetchJson<CommerceOrderDetail>(`/orders/${encodeURIComponent(id)}`);
}

export async function getOrdersByCustomerEmail(email: string): Promise<CommerceOrderListItem[]> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return [];
  }

  const firstPage = await listOrders({
    page: 1,
    limit: 100,
    search: normalizedEmail,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const pageRequests: Promise<CommerceOrderListResponse>[] = [];
  for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
    pageRequests.push(listOrders({
      page,
      limit: 100,
      search: normalizedEmail,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }));
  }

  const remainingPages = await Promise.all(pageRequests);
  const summaries = [firstPage, ...remainingPages].flatMap((response) => response.data);

  if (summaries.length === 0) {
    return [];
  }

  const uniqueSummaries = Array.from(new Map(summaries.map((item) => [item.id, item])).values());
  const detailResults = await Promise.allSettled(uniqueSummaries.map((order) => getOrderById(order.id)));

  return detailResults
    .flatMap((result) => {
      if (result.status !== 'fulfilled') {
        return [];
      }

      return normalizeEmail(result.value.customerEmail) === normalizedEmail
        ? [toListItem(result.value)]
        : [];
    })
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export async function findGuestOrder({ email, orderNumber }: GuestOrderTrackingInput): Promise<CommerceOrderDetail | null> {
  const normalizedEmail = normalizeEmail(email);
  const normalizedOrderNumber = normalizeOrderNumber(orderNumber);

  if (!normalizedEmail || !normalizedOrderNumber) {
    return null;
  }

  try {
    const response = await listOrders({
      page: 1,
      limit: 20,
      search: normalizedOrderNumber,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    const matchedSummary = response.data.find(
      (entry) => normalizeOrderNumber(entry.orderNumber) === normalizedOrderNumber,
    );

    if (!matchedSummary) {
      return null;
    }

    const detail = await getOrderById(matchedSummary.id);
    if (
      normalizeEmail(detail.customerEmail) !== normalizedEmail
      || normalizeOrderNumber(detail.orderNumber) !== normalizedOrderNumber
    ) {
      return null;
    }

    return detail;
  } catch {
    return null;
  }
}
