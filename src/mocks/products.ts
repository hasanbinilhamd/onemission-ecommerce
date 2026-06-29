import type { Product } from '../types';
import { MOCK_CATEGORIES } from './categories';

// ─── Shared ImageKit gallery URLs ─────────────────────────────────────────────
const IMG = [
  'https://ik.imagekit.io/edyl3oplm/Onemission/Model/OKOWW.png?updatedAt=1782468174527',
  'https://ik.imagekit.io/edyl3oplm/Onemission/Model/WEEE.png?updatedAt=1782468174345',
  'https://ik.imagekit.io/edyl3oplm/Onemission/Model/kmkmksss.png?updatedAt=1782468173729',
  'https://ik.imagekit.io/edyl3oplm/Onemission/Model/QW.png?updatedAt=1782468169304',
];

// ─── Shared copy ───────────────────────────────────────────────────────────────
const SHIPPING_INFO =
  'Free shipping on orders above Rp 300.000. Standard delivery: 3–5 business days (Java), 5–10 business days (outer islands). Express delivery available at checkout. All orders are carefully packed and tracked end-to-end.';

const [figurines, apparel, accessories] = MOCK_CATEGORIES;

export const MOCK_PRODUCTS: Product[] = [
  // ─── Figurines ─────────────────────────────────────────────────────────────
  {
    id: 'prod-001',
    sku: 'OM-FIG-001',
    name: 'Toonhub Figurine — Series 1',
    slug: 'toonhub-figurine-series-1',
    description: 'Limited edition 3D-crafted figurine. Flawless finish, museum-grade resin.',
    longDescription:
      'The Toonhub Figurine Series 1 is where digital art meets physical craft. Hand-finished in museum-grade resin, every detail is captured exactly as designed — from the texture of the fabric to the sheen on the visor. Limited to 500 units globally. Each piece is individually numbered and ships in a collector\'s box.',
    price: 250000,
    imageUrl: IMG[0],
    images: [IMG[0], IMG[1], IMG[2], IMG[3]],
    category: figurines,
    tags: ['figurine', 'limited', 'series-1'],
    variants: [
      { id: 'v-001-a', sku: 'OM-FIG-001-BLK', color: 'Onyx',  colorHex: '#1C1C1C', stock: 12, price: 250000 },
      { id: 'v-001-b', sku: 'OM-FIG-001-CRL', color: 'Coral',  colorHex: '#F97316', stock: 5,  price: 250000 },
      { id: 'v-001-c', sku: 'OM-FIG-001-BLU', color: 'Steel Blue', colorHex: '#4B83C7', stock: 8, price: 250000 },
    ],
    materials: 'High-density polyurethane resin, UV-resistant matte lacquer, hand-painted detail.',
    care: 'Dust gently with a soft microfibre cloth. Avoid direct sunlight and humidity above 70%. Do not submerge in liquid.',
    shipping: SHIPPING_INFO,
  },
  {
    id: 'prod-002',
    sku: 'OM-FIG-002',
    name: 'Toonhub Figurine — Series 2',
    slug: 'toonhub-figurine-series-2',
    description: 'Second drop of the iconic Toonhub series. Bold design, premium craft.',
    longDescription:
      'Series 2 pushes the Toonhub aesthetic further. A darker palette, sharper silhouette, and an elevated base make this the statement piece of the collection. Produced in collaboration with our Surabaya studio — 300 units, no restock.',
    price: 275000,
    imageUrl: IMG[1],
    images: [IMG[1], IMG[0], IMG[3], IMG[2]],
    category: figurines,
    tags: ['figurine', 'limited', 'series-2'],
    variants: [
      { id: 'v-002-a', sku: 'OM-FIG-002-BLK', color: 'Midnight', colorHex: '#0B0C10', stock: 7, price: 275000 },
      { id: 'v-002-b', sku: 'OM-FIG-002-GRY', color: 'Grey',    colorHex: '#9CA3AF', stock: 4, price: 275000 },
    ],
    materials: 'High-density polyurethane resin, gloss lacquer finish.',
    care: 'Dust gently with a soft cloth. Store away from direct sunlight.',
    shipping: SHIPPING_INFO,
  },
  {
    id: 'prod-003',
    sku: 'OM-FIG-003',
    name: 'Toonhub Figurine — Series 3',
    slug: 'toonhub-figurine-series-3',
    description: 'Pastel edition — inspired by heritage and craft.',
    longDescription:
      'A softer take on the Toonhub character. Series 3 draws from the earthy palette of traditional Javanese craft — warm terracotta, muted sage, and aged bone. Each figurine carries a small engraved authenticity mark on the underside.',
    price: 275000,
    imageUrl: IMG[2],
    images: [IMG[2], IMG[3], IMG[0], IMG[1]],
    category: figurines,
    tags: ['figurine', 'limited', 'series-3'],
    variants: [
      { id: 'v-003-a', sku: 'OM-FIG-003-NAT', color: 'Natural', colorHex: '#F0EBE3', stock: 10, price: 275000 },
      { id: 'v-003-b', sku: 'OM-FIG-003-TRR', color: 'Coral',   colorHex: '#F97316', stock: 3,  price: 275000 },
    ],
    materials: 'Artisan resin blend, earth-pigment paint, hand-applied patina.',
    care: 'Handle with clean, dry hands. Polish lightly with microfibre if needed.',
    shipping: SHIPPING_INFO,
  },
  {
    id: 'prod-004',
    sku: 'OM-FIG-004',
    name: 'Toonhub Figurine — Night Edition',
    slug: 'toonhub-figurine-night-edition',
    description: "Dark colourway — collector's exclusive, midnight release.",
    longDescription:
      'The Night Edition is our most requested colourway since the original Series 1 reveal. Pure gloss black with subtle iridescent paint on the details — shifts from charcoal to deep violet under different lighting. Collector\'s exclusive: 200 units.',
    price: 300000,
    imageUrl: IMG[3],
    images: [IMG[3], IMG[2], IMG[1], IMG[0]],
    category: figurines,
    tags: ['figurine', 'limited', 'night-edition'],
    variants: [
      { id: 'v-004-a', sku: 'OM-FIG-004-BLK', color: 'Onyx', colorHex: '#1C1C1C', stock: 6, price: 300000 },
    ],
    materials: 'Gloss-coat resin, iridescent topcoat, chrome-plated base ring.',
    care: 'Use an antistatic cloth only. Avoid touching the gloss surfaces with bare hands.',
    shipping: SHIPPING_INFO,
  },
  {
    id: 'prod-005',
    sku: 'OM-FIG-005',
    name: 'Toonhub Figurine — Coral',
    slug: 'toonhub-figurine-coral',
    description: 'Warm coral colourway. A statement piece for any shelf.',
    longDescription:
      'The Coral edition brings warmth to the Toonhub lineup. Inspired by the terracotta hues found in traditional market pottery, this colourway feels familiar yet completely new. 350 units. Ships with a signed mini art card.',
    price: 265000,
    imageUrl: IMG[0],
    images: [IMG[0], IMG[2], IMG[1], IMG[3]],
    category: figurines,
    tags: ['figurine', 'coral'],
    variants: [
      { id: 'v-005-a', sku: 'OM-FIG-005-CRL', color: 'Coral', colorHex: '#F97316', stock: 15, price: 265000 },
    ],
    materials: 'Polyurethane resin, matte finish, coral pigment paint.',
    care: 'Dust with soft cloth. Avoid prolonged direct sunlight — may cause slight fading.',
    shipping: SHIPPING_INFO,
  },
  {
    id: 'prod-006',
    sku: 'OM-FIG-006',
    name: 'Toonhub Figurine — Steel Blue',
    slug: 'toonhub-figurine-steel-blue',
    description: 'Steel-blue edition with a matte finish.',
    longDescription:
      'Steel Blue is the understated one. A cool, composed colourway for those who prefer to let the form speak. Matte finish with a satin mid-tone on the inner layers. 400 units. No restock policy.',
    price: 265000,
    imageUrl: IMG[1],
    images: [IMG[1], IMG[3], IMG[2], IMG[0]],
    category: figurines,
    tags: ['figurine', 'blue'],
    variants: [
      { id: 'v-006-a', sku: 'OM-FIG-006-BLU', color: 'Steel Blue', colorHex: '#4B83C7', stock: 9, price: 265000 },
    ],
    materials: 'Polyurethane resin, steel-blue matte pigment, satin inner layers.',
    care: 'Dust gently. Keep in its collector\'s box when not on display.',
    shipping: SHIPPING_INFO,
  },

  // ─── Apparel ───────────────────────────────────────────────────────────────
  {
    id: 'prod-007',
    sku: 'OM-APP-001',
    name: 'Values Tee — Onyx',
    slug: 'values-tee-onyx',
    description: 'Heavyweight cotton tee. Minimal, intentional, built to last.',
    longDescription:
      'The Values Tee is the foundation of the ONEMISSION wardrobe. 240 gsm combed ring-spun cotton, boxy fit, pre-washed to eliminate shrinkage. Screen-printed text on the back — small, deliberate, non-negotiable.',
    price: 185000,
    imageUrl: IMG[3],
    images: [IMG[3], IMG[0], IMG[2], IMG[1]],
    category: apparel,
    tags: ['tee', 'onyx', 'cotton'],
    variants: [
      { id: 'v-007-s',  sku: 'OM-APP-001-S',  color: 'Onyx', colorHex: '#1C1C1C', size: 'S',   stock: 20, price: 185000 },
      { id: 'v-007-m',  sku: 'OM-APP-001-M',  color: 'Onyx', colorHex: '#1C1C1C', size: 'M',   stock: 30, price: 185000 },
      { id: 'v-007-l',  sku: 'OM-APP-001-L',  color: 'Onyx', colorHex: '#1C1C1C', size: 'L',   stock: 25, price: 185000 },
      { id: 'v-007-xl', sku: 'OM-APP-001-XL', color: 'Onyx', colorHex: '#1C1C1C', size: 'XL',  stock: 15, price: 185000 },
      { id: 'v-007-xx', sku: 'OM-APP-001-XXL',color: 'Onyx', colorHex: '#1C1C1C', size: 'XXL', stock: 8,  price: 185000 },
    ],
    materials: '100% combed ring-spun cotton, 240 gsm. Screen-printed back graphic.',
    care: 'Machine wash cold, inside out. Tumble dry low or hang dry. Do not bleach.',
    shipping: SHIPPING_INFO,
  },
  {
    id: 'prod-008',
    sku: 'OM-APP-002',
    name: 'Values Tee — Chalk',
    slug: 'values-tee-chalk',
    description: 'Off-white canvas tee — pairs with anything.',
    longDescription:
      'Same construction as the Onyx tee — same 240 gsm cotton, same boxy fit — but in an off-white chalk colourway that works as a layering piece or worn solo. The subtle warmth of chalk keeps it premium.',
    price: 185000,
    imageUrl: IMG[2],
    images: [IMG[2], IMG[1], IMG[3], IMG[0]],
    category: apparel,
    tags: ['tee', 'chalk', 'cotton'],
    variants: [
      { id: 'v-008-s',  sku: 'OM-APP-002-S',  color: 'Chalk', colorHex: '#F5F2EA', size: 'S',   stock: 18, price: 185000 },
      { id: 'v-008-m',  sku: 'OM-APP-002-M',  color: 'Chalk', colorHex: '#F5F2EA', size: 'M',   stock: 28, price: 185000 },
      { id: 'v-008-l',  sku: 'OM-APP-002-L',  color: 'Chalk', colorHex: '#F5F2EA', size: 'L',   stock: 22, price: 185000 },
      { id: 'v-008-xl', sku: 'OM-APP-002-XL', color: 'Chalk', colorHex: '#F5F2EA', size: 'XL',  stock: 10, price: 185000 },
    ],
    materials: '100% combed ring-spun cotton, 240 gsm. Screen-printed back graphic.',
    care: 'Machine wash cold, inside out. Wash with similar colours. Do not bleach.',
    shipping: SHIPPING_INFO,
  },
  {
    id: 'prod-009',
    sku: 'OM-APP-003',
    name: 'OM Hoodie — Midnight',
    slug: 'om-hoodie-midnight',
    description: 'Brushed fleece, relaxed fit. The hoodie you reach for every time.',
    longDescription:
      'The OM Hoodie is a heavyweight 380 gsm brushed fleece pullover. Relaxed body, slightly dropped shoulder, kangaroo pocket with hidden interior zip. Embroidered ONEMISSION chest badge. Garment washed for an immediately lived-in feel.',
    price: 320000,
    imageUrl: IMG[3],
    images: [IMG[3], IMG[2], IMG[0], IMG[1]],
    category: apparel,
    tags: ['hoodie', 'midnight', 'fleece'],
    variants: [
      { id: 'v-009-s',  sku: 'OM-APP-003-S',  color: 'Midnight', colorHex: '#0B0C10', size: 'S',  stock: 12, price: 320000 },
      { id: 'v-009-m',  sku: 'OM-APP-003-M',  color: 'Midnight', colorHex: '#0B0C10', size: 'M',  stock: 20, price: 320000 },
      { id: 'v-009-l',  sku: 'OM-APP-003-L',  color: 'Midnight', colorHex: '#0B0C10', size: 'L',  stock: 18, price: 320000 },
      { id: 'v-009-xl', sku: 'OM-APP-003-XL', color: 'Midnight', colorHex: '#0B0C10', size: 'XL', stock: 9,  price: 320000 },
    ],
    materials: '80% combed cotton / 20% polyester, 380 gsm brushed fleece. Embroidered chest badge.',
    care: 'Machine wash cold. Do not tumble dry. Iron on low, avoid the badge.',
    shipping: SHIPPING_INFO,
  },

  // ─── Accessories ───────────────────────────────────────────────────────────
  {
    id: 'prod-010',
    sku: 'OM-ACC-001',
    name: 'OM Cap — Washed Black',
    slug: 'om-cap-washed-black',
    description: 'Six-panel, unstructured cap. Worn-in from day one.',
    longDescription:
      'An unstructured six-panel cap in washed black twill. Garment-washed to achieve a naturally aged look and soft-touch feel. Brass grommet, cotton sweatband, adjustable brass buckle closure. ONEMISSION script embroidered at front.',
    price: 120000,
    imageUrl: IMG[0],
    images: [IMG[0], IMG[1], IMG[3], IMG[2]],
    category: accessories,
    tags: ['cap', 'black', 'accessories'],
    variants: [
      { id: 'v-010-os', sku: 'OM-ACC-001-OS', color: 'Washed Black', colorHex: '#2D2D2D', size: 'One Size', stock: 40, price: 120000 },
    ],
    materials: '100% washed cotton twill. Brass hardware. Cotton sweatband.',
    care: 'Spot clean only. Air dry. Do not machine wash.',
    shipping: SHIPPING_INFO,
  },
  {
    id: 'prod-011',
    sku: 'OM-ACC-002',
    name: 'OM Tote — Natural',
    slug: 'om-tote-natural',
    description: 'Heavy-duty canvas tote. Carry everything you value.',
    longDescription:
      'A 480 gsm heavy-duty cotton canvas tote in natural ecru. Reinforced bottom and stitched carry handles. ONEMISSION stamp print on the front. Fits a 15" laptop, two bottles, and everything else you carry through the day.',
    price: 95000,
    imageUrl: IMG[1],
    images: [IMG[1], IMG[0], IMG[2], IMG[3]],
    category: accessories,
    tags: ['tote', 'natural', 'canvas'],
    variants: [
      { id: 'v-011-os', sku: 'OM-ACC-002-OS', color: 'Natural', colorHex: '#F0EBE3', size: 'One Size', stock: 60, price: 95000 },
    ],
    materials: '480 gsm natural cotton canvas. Screen-printed graphic.',
    care: 'Machine wash cold on gentle cycle. Hang dry. Iron if needed.',
    shipping: SHIPPING_INFO,
  },
  {
    id: 'prod-012',
    sku: 'OM-ACC-003',
    name: 'OM Sticker Pack',
    slug: 'om-sticker-pack',
    description: 'Five die-cut stickers. Stick your values everywhere.',
    longDescription:
      'Five die-cut vinyl stickers, each representing a core ONEMISSION value. Weatherproof, UV-resistant, and rated for outdoor use. Apply to laptops, water bottles, helmets, skateboards — wherever you spend your time.',
    price: 35000,
    imageUrl: IMG[2],
    images: [IMG[2], IMG[3], IMG[0], IMG[1]],
    category: accessories,
    tags: ['sticker', 'pack'],
    variants: [
      { id: 'v-012-os', sku: 'OM-ACC-003-OS', color: 'Multi', colorHex: '#6366F1', size: 'One Size', stock: 200, price: 35000 },
    ],
    materials: 'Premium vinyl with UV-resistant laminate coating.',
    care: 'Clean surface before applying. Peel slowly at 45°. Not removable without residue.',
    shipping: SHIPPING_INFO,
  },
];
