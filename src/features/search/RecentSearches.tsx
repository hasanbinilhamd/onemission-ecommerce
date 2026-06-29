interface RecentSearchesProps {
  items: string[];
  onSelect: (value: string) => void;
}

export function RecentSearches({ items, onSelect }: RecentSearchesProps) {
  if (items.length === 0) return null;

  return (
    <section>
      <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Recent Searches
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            style={{
              border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              borderRadius: '9999px',
              padding: '8px 14px',
              fontSize: '13px',
              color: '#374151',
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
