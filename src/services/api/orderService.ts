import { env } from '../../app/config/env';
import type {
  CommerceOrderDetail,
  CommerceOrderListItem,
  CommerceOrderListResponse,
} from '../../types';

interface CustomerOrderListQuery {
  email: string;
  page?: number;
  limit?: number;
  accessToken?: string;
}

interface GuestOrderTrackingInput {
  email: string;
  orderNumber: string;
}

export class OrderApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'OrderApiError';
    this.statusCode = statusCode;
  }
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

async function fetchJson<T>(path: string, init?: RequestInit, accessToken = ''): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new OrderApiError(payload?.error || 'Order request failed.', response.status);
  }

  return payload as T;
}

export async function listCustomerOrders(query: CustomerOrderListQuery): Promise<CommerceOrderListResponse> {
  const normalizedEmail = normalizeEmail(query.email);
  if (!normalizedEmail) {
    return {
      data: [],
      pagination: {
        page: 1,
        limit: query.limit ?? 10,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  const params = buildQueryParams({
    email: normalizedEmail,
    page: query.page ?? 1,
    limit: query.limit ?? 10,
  });

  return fetchJson<CommerceOrderListResponse>(`/orders/customer?${params.toString()}`, undefined, query.accessToken || '');
}

export async function getOrdersByCustomerEmail(email: string, accessToken = ''): Promise<CommerceOrderListItem[]> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return [];
  }

  const firstPage = await listCustomerOrders({
    email: normalizedEmail,
    page: 1,
    limit: 100,
    accessToken,
  });

  const pageRequests: Promise<CommerceOrderListResponse>[] = [];
  for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
    pageRequests.push(listCustomerOrders({
      email: normalizedEmail,
      page,
      limit: 100,
      accessToken,
    }));
  }

  const remainingPages = await Promise.all(pageRequests);

  return [firstPage, ...remainingPages]
    .flatMap((response) => response.data)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export async function getOrderByNumber(orderNumber: string, accessToken = ''): Promise<CommerceOrderDetail> {
  const normalizedOrderNumber = normalizeOrderNumber(orderNumber);
  return fetchJson<CommerceOrderDetail>(`/orders/by-number/${encodeURIComponent(normalizedOrderNumber)}`, undefined, accessToken);
}

export async function findGuestOrder({ email, orderNumber }: GuestOrderTrackingInput): Promise<CommerceOrderDetail | null> {
  const normalizedEmail = normalizeEmail(email);
  const normalizedOrderNumber = normalizeOrderNumber(orderNumber);

  if (!normalizedEmail || !normalizedOrderNumber) {
    return null;
  }

  const params = buildQueryParams({
    email: normalizedEmail,
    orderNumber: normalizedOrderNumber,
  });

  try {
    return await fetchJson<CommerceOrderDetail>(`/orders/track?${params.toString()}`);
  } catch (error) {
    if (error instanceof OrderApiError && error.statusCode === 404) {
      return null;
    }

    throw error;
  }
}
