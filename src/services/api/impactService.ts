import { env } from '../../app/config/env';

/**
 * Movement Impact API client.
 *
 * Consumes the public HQ Impact endpoints through the existing ecommerce
 * proxy (/api/movement/impact). The server performs status ordering, DRAFT
 * exclusion, and category filtering — the client only paginates and renders.
 */

export type ImpactStoryStatus = 'DRAFT' | 'COMING_SOON' | 'NOW_LIVE' | 'CLOSED';
export type ImpactBlockType = 'TEXT' | 'IMAGE';

export interface ImpactPageSettings {
  eyebrow: string;
  title: string;
  description: string;
}

export interface ImpactListItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  coverImage: string;
  status: ImpactStoryStatus;
  featured: boolean;
  publishedAt: string | null;
  readingMinutes: number | null;
}

export interface ImpactListPayload {
  settings: ImpactPageSettings;
  items: ImpactListItem[];
  total: number;
  hasMore: boolean;
}

export interface ImpactContentBlock {
  id: string;
  type: ImpactBlockType;
  displayOrder: number;
  text: string | null;
  imageUrl: string | null;
  altText: string | null;
  caption: string | null;
}

export interface ImpactRelatedItem {
  slug: string;
  title: string;
  category: string;
  coverImage: string;
  status: ImpactStoryStatus;
}

export interface ImpactDetailPayload {
  story: ImpactListItem;
  blocks: ImpactContentBlock[];
  related: ImpactRelatedItem[];
}

export class ImpactServiceError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code: string, statusCode = 500) {
    super(message);
    this.name = 'ImpactServiceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

function getBaseUrl(): string {
  const apiBaseUrl = env.apiBaseUrl.trim().replace(/\/$/, '');
  return apiBaseUrl ? `${apiBaseUrl}/movement/impact` : '';
}

async function fetchJson<T>(path = '', init?: RequestInit): Promise<T> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new ImpactServiceError('Impact API base URL is not configured.', 'IMPACT_API_CONFIGURATION_MISSING', 500);
  }

  const normalizedPath = String(path || '').trim().replace(/^\/+/, '');
  const url = normalizedPath ? `${baseUrl}/${normalizedPath}` : baseUrl;

  try {
    const response = await fetch(url, {
      ...init,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(init?.headers || {}),
      },
    });

    if (!response.ok) {
      let payload: { error?: string; code?: string } | null = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
      throw new ImpactServiceError(
        payload?.error || 'The impact request could not be completed.',
        payload?.code || 'IMPACT_API_ERROR',
        response.status,
      );
    }

    return await response.json() as T;
  } catch (error) {
    if (error instanceof ImpactServiceError) {
      throw error;
    }

    throw new ImpactServiceError('Unable to connect to the Impact API.', 'IMPACT_NETWORK_ERROR', 503);
  }
}

export const impactService = {
  async getImpactList(category: string, offset = 0, limit = 4): Promise<ImpactListPayload> {
    const query = new URLSearchParams({
      category,
      offset: String(offset),
      limit: String(limit),
    });
    return fetchJson<ImpactListPayload>(`?${query.toString()}`);
  },

  async getImpactStory(slug: string): Promise<ImpactDetailPayload> {
    return fetchJson<ImpactDetailPayload>(encodeURIComponent(slug));
  },
};
