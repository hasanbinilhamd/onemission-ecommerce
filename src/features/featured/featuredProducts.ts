export interface FeaturedProduct {
  id: string;
  productId: string;
  displayOrder: number;
  imageOverride?: string;
  titleOverride?: string;
  subtitleOverride?: string;
  enabled: boolean;
}

export const FEATURED_PRODUCTS: readonly FeaturedProduct[] = [
  {
    id: 'featured-basic-3-4-legging',
    productId: 'f64f0ae0-5df3-42fa-8df9-a8370e894123',
    displayOrder: 1,
    enabled: true,
  },
  {
    id: 'featured-basic-long-legging',
    productId: '812e5b24-d521-4c89-a9d9-dcad32fda52d',
    displayOrder: 2,
    enabled: true,
  },
  {
    id: 'featured-cowboy-running-cap',
    productId: '375c0877-d96d-495c-9162-dd32cce343fc',
    displayOrder: 3,
    enabled: true,
  },
  {
    id: 'featured-flex-pocket-legging',
    productId: '8e46a914-e6df-497e-839e-773c56712f90',
    displayOrder: 4,
    enabled: true,
  },
  {
    id: 'featured-pro-sport-legging',
    productId: 'd733f404-54e9-444d-b4c7-72cd49700ac3',
    displayOrder: 5,
    enabled: true,
  },
  {
    id: 'featured-udel-off-legging',
    productId: '05f9c1f5-fdbd-4d9a-9a46-10ed5840d612',
    displayOrder: 6,
    enabled: true,
  },
] as const;
