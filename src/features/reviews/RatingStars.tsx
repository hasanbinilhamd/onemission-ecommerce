import { Star } from 'lucide-react';

export function RatingStars({
  value,
  size = 16,
}: {
  value: number;
  size?: number;
}) {
  const normalizedValue = Math.max(0, Math.min(5, Number(value || 0)));

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} aria-label={`${normalizedValue.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const fillLevel = Math.max(0, Math.min(1, normalizedValue - index));
        return (
          <span key={index} style={{ position: 'relative', width: size, height: size, display: 'inline-flex' }}>
            <Star size={size} strokeWidth={1.75} color="#D1D5DB" fill="none" style={{ position: 'absolute', inset: 0 }} />
            <span
              style={{
                position: 'absolute',
                inset: 0,
                width: `${fillLevel * 100}%`,
                overflow: 'hidden',
                display: 'inline-flex',
              }}
            >
              <Star size={size} strokeWidth={1.75} color="#F59E0B" fill="#F59E0B" />
            </span>
          </span>
        );
      })}
    </div>
  );
}
