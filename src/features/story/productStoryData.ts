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
    mediaUrl: 'https://ik.imagekit.io/edyl3oplm/Onemission/Model/OKOWW.png?updatedAt=1782468174527',
    alt: 'Onemission performance look in motion.',
    displayOrder: 1,
  },
  {
    id: 'refined-materials',
    title: 'Refined materials, everyday resilience.',
    description: 'Soft structure, elevated finishes, and durable comfort create a premium layer that holds up from commute to workout.',
    mediaType: 'image',
    mediaUrl: 'https://ik.imagekit.io/edyl3oplm/Onemission/Model/WEEE.png?updatedAt=1782468174345',
    alt: 'Onemission apparel with refined material details.',
    displayOrder: 2,
  },
  {
    id: 'cinematic-motion',
    title: 'Designed to flow with modern routines.',
    description: 'A quiet visual story of pace, discipline, and intention expressed through motion-driven product presentation.',
    mediaType: 'video',
    mediaUrl: 'https://ik.imagekit.io/fkoy34ckk/onemission-dev/WhatsApp%20Video%202026-07-26%20at%2016.17.17.mp4?updatedAt=1785057842262',
    posterUrl: 'https://ik.imagekit.io/fkoy34ckk/onemission-dev/Screenshot%202026-07-26%20163038.png?updatedAt=1785058280647',
    alt: 'Onemission cinematic brand motion.',
    displayOrder: 3,
  },
  {
    id: 'signature-balance',
    title: 'Balance between sport and identity.',
    description: 'Every visual cue is meant to feel purposeful, understated, and ready for a global Muslim lifestyle.',
    mediaType: 'image',
    mediaUrl: 'https://ik.imagekit.io/edyl3oplm/Onemission/Model/kmkmksss.png?updatedAt=1782468173729',
    alt: 'Onemission product story portrait.',
    displayOrder: 4,
  },
] as const;
