import { env } from '../../app/config/env';

export type WebsiteMediaType = 'image' | 'video';

export interface WebsiteHeroItem {
  id: string;
  mediaType: WebsiteMediaType;
  desktopUrl: string;
  mobileUrl: string;
  displayOrder: number;
  active: boolean;
}

export interface WebsiteBrandVideo {
  id: string;
  videoUrl: string;
  posterUrl: string;
  active: boolean;
}

export interface WebsiteProductStoryItem {
  id: string;
  mediaType: WebsiteMediaType;
  mediaUrl: string;
  description: string;
  displayOrder: number;
  active: boolean;
}


export interface WebsiteCollectionHeroMediaItem {
  id: string;
  mediaType: WebsiteMediaType;
  desktopUrl: string;
  mobileUrl: string;
  displayOrder: number;
  active: boolean;
}

export interface WebsiteCollectionHero {
  id: string;
  heroType: 'image' | 'slideshow' | 'video';
  title: string;
  description: string;
  overlayOpacity: number;
  active: boolean;
  mediaItems: WebsiteCollectionHeroMediaItem[];
}

export interface WebsiteHomepageContent {
  heroItems: WebsiteHeroItem[];
  brandVideo: WebsiteBrandVideo | null;
  productStoryItems: WebsiteProductStoryItem[];
}

// ─── Movement CMS content ────────────────────────────────────────────────────

export interface MovementHomePageContent {
  headline: string;
  description: string;
  ctaLabel: string;
  ctaDestination: string;
  socialProofNumber: string;
  socialProofText: string;
  desktopImage: string;
  mobileImage: string;
}

export interface MovementHomeCard {
  id: string;
  title: string;
  description: string;
  image: string;
  destination: string;
  displayOrder: number;
  isActive?: boolean;
}

export interface MovementHomeContent {
  home: MovementHomePageContent | null;
  cards: MovementHomeCard[];
}

class WebsiteServiceError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code: string, statusCode = 500) {
    super(message);
    this.name = 'WebsiteServiceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

async function fetchJson<T>(path = ''): Promise<T> {
  return fetchApiJson<T>(path, 'website');
}

async function fetchApiJson<T>(path = '', basePath = 'website'): Promise<T> {
  const apiBaseUrl = env.apiBaseUrl.trim().replace(/\/$/, '');
  const baseUrl = apiBaseUrl ? `${apiBaseUrl}/${basePath}` : '';

  if (!baseUrl) {
    throw new WebsiteServiceError('Website API base URL is not configured.', 'WEBSITE_API_CONFIGURATION_MISSING', 500);
  }

  const normalizedPath = String(path || '').trim().replace(/^\/+/, '');
  const url = normalizedPath ? `${baseUrl}/${normalizedPath}` : baseUrl;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new WebsiteServiceError('Website content could not be loaded.', 'WEBSITE_API_ERROR', response.status);
    }

    return await response.json() as T;
  } catch (error) {
    if (error instanceof WebsiteServiceError) {
      throw error;
    }

    throw new WebsiteServiceError('Unable to connect to the Website API.', 'WEBSITE_NETWORK_ERROR', 503);
  }
}

export const websiteService = {
  async getHomepageContent(): Promise<WebsiteHomepageContent> {
    return fetchJson<WebsiteHomepageContent>();
  },

  async getHeroItems(): Promise<WebsiteHeroItem[]> {
    return fetchJson<WebsiteHeroItem[]>('hero');
  },

  async getBrandVideo(): Promise<WebsiteBrandVideo | null> {
    return fetchJson<WebsiteBrandVideo | null>('brand-video');
  },

  async getProductStoryItems(): Promise<WebsiteProductStoryItem[]> {
    return fetchJson<WebsiteProductStoryItem[]>('product-story');
  },

  async getCollectionHero(): Promise<WebsiteCollectionHero | null> {
    return fetchJson<WebsiteCollectionHero | null>('collection');
  },

  async getMovementHome(): Promise<MovementHomeContent> {
    return fetchApiJson<MovementHomeContent>('home', 'movement');
  },
};
