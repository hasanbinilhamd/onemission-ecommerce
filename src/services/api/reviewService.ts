import { env } from '../../app/config/env';
import type { ProductReviewListResponse, Review } from '../../types';

export interface CreateProductReviewInput {
  productId: string;
  orderId: string;
  orderItemId: string;
  rating: number;
  title?: string;
  comment: string;
}

export class ReviewApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ReviewApiError';
    this.statusCode = statusCode;
  }
}

function getApiBaseUrl() {
  const apiBaseUrl = env.apiBaseUrl.trim().replace(/\/$/, '');
  if (!apiBaseUrl) {
    throw new ReviewApiError('Commerce API base URL is not configured.', 500);
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
    throw new ReviewApiError(payload?.error || 'Review request failed.', response.status);
  }

  return payload as T;
}

export async function listProductReviews(productId: string, page = 1, limit = 10): Promise<ProductReviewListResponse> {
  const params = buildQueryParams({ productId, page, limit });
  return fetchJson<ProductReviewListResponse>(`/reviews?${params.toString()}`);
}

export async function createProductReview(
  input: CreateProductReviewInput,
  accessToken = '',
): Promise<{ review: Review; message: string }> {
  return fetchJson<{ review: Review; message: string }>(
    '/reviews',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    },
    accessToken,
  );
}
