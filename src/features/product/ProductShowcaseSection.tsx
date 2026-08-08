import type { ProductShowcaseItem } from '../../types';

interface ProductShowcaseSectionProps {
  items?: ProductShowcaseItem[];
  productName: string;
}

function isValidShowcaseItem(item: ProductShowcaseItem): boolean {
  return Boolean(item?.active && String(item.mediaUrl || '').trim());
}

export function ProductShowcaseSection({ items = [], productName }: ProductShowcaseSectionProps) {
  const activeItems = [...items]
    .filter(isValidShowcaseItem)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.id.localeCompare(right.id));

  if (activeItems.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Product Showcase"
      style={{
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)',
        marginTop: '56px',
      }}
    >
      {activeItems.map((item, index) => (
        item.mediaType === 'video' ? (
          <video
            key={item.id}
            src={item.mediaUrl}
            controls
            playsInline
            preload="metadata"
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              backgroundColor: '#000000',
            }}
          />
        ) : (
          <img
            key={item.id}
            src={item.mediaUrl}
            alt={`${productName} showcase ${index + 1}`}
            loading="lazy"
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
            }}
          />
        )
      ))}
    </section>
  );
}
