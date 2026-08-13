import {
  websiteService,
  type WebsiteHomepageContent,
  type WebsiteHeroItem,
} from '../../services/api/websiteService';

export const ONEMISSION_LOGO_URL = 'https://ik.imagekit.io/edyl3oplm/Onemission/logos/AMAN_ONEMISSION.png?updatedAt=1782542636942';

export type InitialPreloadStage =
  | 'boot'
  | 'data'
  | 'image-requested'
  | 'image-loaded'
  | 'image-decoded'
  | 'ready';

export type InitialPreloadProgressHandler = (stage: InitialPreloadStage, progress: number) => void;

let homepageContentPromise: Promise<WebsiteHomepageContent> | null = null;
const decodedHeroAssetUrls = new Set<string>();
const loadedCriticalAssetUrls = new Set<string>();

function isHomePath(): boolean {
  if (typeof window === 'undefined') return false;
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  return pathname === '/';
}

function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 639px)').matches;
}

function isValidAssetUrl(value: string): boolean {
  return /^https?:\/\//i.test(String(value || '').trim());
}

export function getHomepageContentForInitialExperience(): Promise<WebsiteHomepageContent> {
  if (!homepageContentPromise) {
    homepageContentPromise = websiteService.getHomepageContent();
  }

  return homepageContentPromise;
}

export function resolveCriticalHeroAssetUrl(items: readonly WebsiteHeroItem[], isMobile = isMobileViewport()): string {
  const activeItems = [...items]
    .filter((item) => item.active !== false)
    .sort((left, right) => Number(left.displayOrder || 0) - Number(right.displayOrder || 0) || String(left.id || '').localeCompare(String(right.id || '')));
  const firstHeroItem = activeItems[0];
  if (!firstHeroItem) return '';

  const mobileUrl = String(firstHeroItem.mobileUrl || '').trim();
  const desktopUrl = String(firstHeroItem.desktopUrl || '').trim();
  return isMobile && mobileUrl ? mobileUrl : desktopUrl;
}

async function preloadImage(url: string, onProgress?: InitialPreloadProgressHandler): Promise<void> {
  const normalizedUrl = String(url || '').trim();
  if (!isValidAssetUrl(normalizedUrl)) return;

  if (decodedHeroAssetUrls.has(normalizedUrl) || loadedCriticalAssetUrls.has(normalizedUrl)) {
    onProgress?.('image-decoded', 90);
    return;
  }

  onProgress?.('image-requested', 65);

  await new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = async () => {
      loadedCriticalAssetUrls.add(normalizedUrl);
      onProgress?.('image-loaded', 80);

      try {
        if (typeof image.decode === 'function') {
          await image.decode();
        }
        decodedHeroAssetUrls.add(normalizedUrl);
      } catch {
        // Some browsers reject decode() for already-loaded/cross-origin images.
        // A successful onload still means the asset can be rendered from cache.
        loadedCriticalAssetUrls.add(normalizedUrl);
      }

      if (typeof performance !== 'undefined' && typeof performance.mark === 'function') {
        performance.mark('om_critical_image_ready');
      }
      onProgress?.('image-decoded', 90);
      resolve();
    };
    image.onerror = () => reject(new Error(`Critical image could not be loaded: ${normalizedUrl}`));
    image.src = normalizedUrl;
  });
}

async function waitForInitialPaint(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

async function waitForCriticalFonts(): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  await document.fonts.ready.catch(() => undefined);
}

export function getPreloadedHeroAssetMap(): Record<string, boolean> {
  return [...decodedHeroAssetUrls, ...loadedCriticalAssetUrls].reduce<Record<string, boolean>>((map, url) => {
    map[url] = true;
    return map;
  }, {});
}

export async function prepareInitialApplicationExperience(onProgress?: InitialPreloadProgressHandler): Promise<void> {
  onProgress?.('boot', 15);

  await Promise.all([
    waitForInitialPaint(),
    waitForCriticalFonts(),
  ]);

  onProgress?.('boot', 25);

  if (!isHomePath()) {
    onProgress?.('ready', 100);
    return;
  }

  let homepageContent: WebsiteHomepageContent | null = null;
  try {
    homepageContent = await getHomepageContentForInitialExperience();
    onProgress?.('data', 45);
  } catch {
    onProgress?.('data', 45);
    onProgress?.('ready', 100);
    return;
  }

  const heroAssetUrl = resolveCriticalHeroAssetUrl(homepageContent.heroItems || []);
  const criticalImageUrls = [heroAssetUrl, ONEMISSION_LOGO_URL].filter(isValidAssetUrl);

  if (criticalImageUrls.length === 0) {
    onProgress?.('ready', 100);
    return;
  }

  await Promise.all(criticalImageUrls.map((url) => preloadImage(url, onProgress).catch(() => undefined)));
  if (typeof performance !== 'undefined' && typeof performance.mark === 'function') {
    performance.mark('om_homepage_critical_assets_ready');
  }
  onProgress?.('ready', 100);
}
