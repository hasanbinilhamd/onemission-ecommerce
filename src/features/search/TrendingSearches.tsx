const TRENDING_ITEMS = ['New Arrival', 'Performance', 'Oversized', 'Accessories'] as const;

interface TrendingSearchesProps {
  onSelect: (value: string) => void;
}

export function TrendingSearches({ onSelect }: TrendingSearchesProps) {
  return (
    <section>
      <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Trending Search
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {TRENDING_ITEMS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            style={{
              border: '1px solid #E5E7EB',
              backgroundColor: '#F9FAFB',
              borderRadius: '9999px',
              padding: '8px 14px',
              fontSize: '13px',
              color: '#111827',
              cursor: 'pointer',
            }}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}
