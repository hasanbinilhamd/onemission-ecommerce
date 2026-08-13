import { env } from '../../app/config/env';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FaqListResponse {
  data: FaqItem[];
  categories: string[];
}

function getApiBaseUrl() {
  const apiBaseUrl = env.apiBaseUrl.trim().replace(/\/$/, '');
  if (!apiBaseUrl) {
    throw new Error('Commerce API base URL is not configured.');
  }
  return apiBaseUrl;
}

export async function getPublishedFaqs(): Promise<FaqListResponse> {
  const response = await fetch(`${getApiBaseUrl()}/faqs`, {
    headers: { Accept: 'application/json' },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || 'FAQ could not be loaded.');
  }
  return {
    data: Array.isArray(payload?.data) ? payload.data : [],
    categories: Array.isArray(payload?.categories) ? payload.categories : [],
  };
}
