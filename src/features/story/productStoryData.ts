export type ProductStoryMediaType = 'image' | 'video';

export interface ProductStoryItem {
  id: string;
  title: string;
  description: string;
  mediaType: ProductStoryMediaType;
  mediaUrl: string;
  posterUrl?: string;
  alt?: string;
  displayOrder?: number;
}

export const PRODUCT_STORY_ITEMS: readonly ProductStoryItem[] = [
  {
    id: 'movement-layer',
    title: 'Built for movement with conviction.',
    description: 'Performance silhouettes shaped to move freely while keeping a clean, confident presence in every setting.',
    mediaType: 'image',
    mediaUrl: 'https://ik.imagekit.io/qqulvbiww/Products/Pro%20Sport/5.png?updatedAt=1786440344975',
    alt: 'Onemission performance look in motion.',
    displayOrder: 1,
  },
  {
    id: 'refined-materials',
    title: 'Refined materials, everyday resilience.',
    description: 'Soft structure, elevated finishes, and durable comfort create a premium layer that holds up from commute to workout.',
    mediaType: 'image',
    mediaUrl: 'https://ik.imagekit.io/qqulvbiww/Products/Pro%20Sport/7.png?updatedAt=1786440345021',
    alt: 'Onemission apparel with refined material details.',
    displayOrder: 2,
  },
  {
    id: 'cinematic-motion',
    title: 'Designed to flow with modern routines.',
    description: 'A quiet visual story of pace, discipline, and intention expressed through motion-driven product presentation.',
    mediaType: 'image',
    mediaUrl: 'https://ik.imagekit.io/qqulvbiww/Products/Awrah%20Fit%20Ultra%20Stretch/7.png?updatedAt=1786411154528',
    // posterUrl: 'https://ik.imagekit.io/fkoy34ckk/onemission-dev/Screenshot%202026-07-26%20163038.png?updatedAt=1785058280647',
    alt: 'Onemission cinematic brand motion.',
    displayOrder: 3,
  },
  {
    id: 'signature-balance',
    title: 'Balance between sport and identity.',
    description: 'Every visual cue is meant to feel purposeful, understated, and ready for a global Muslim lifestyle.',
    mediaType: 'image',
    mediaUrl: 'https://ik.imagekit.io/qqulvbiww/Products/Core%20Flex%20Sport%20Shirt/7.png?updatedAt=1786411266413',
    alt: 'Onemission product story portrait.',
    displayOrder: 4,
  },
] as const;
