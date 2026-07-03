import { useEffect, useState } from 'react';
import { Drawer } from '../../components/shared/Drawer';

export interface FilterState {
  colors: string[];
  sizes: string[];
  minPrice: number;
  maxPrice: number;
}

export const DEFAULT_FILTERS: FilterState = {
  colors: [],
  sizes: [],
  minPrice: 0,
  maxPrice: 999999,
};

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
  availableColors: string[];
  availableSizes: string[];
}

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
}

export function FilterDrawer({
  open,
  onClose,
  filters,
  onApply,
  onReset,
  availableColors,
  availableSizes,
}: FilterDrawerProps) {
  const [draft, setDraft] = useState<FilterState>(filters);

  useEffect(() => {
    if (open) {
      setDraft(filters);
    }
  }, [filters, open]);

  const toggleColor = (color: string) => {
    setDraft(d => ({ ...d, colors: toggleItem(d.colors, color) }));
  };

  const toggleSize = (size: string) => {
    setDraft(d => ({ ...d, sizes: toggleItem(d.sizes, size) }));
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleReset = () => {
    setDraft(DEFAULT_FILTERS);
    onReset();
    onClose();
  };

  const sectionTitle = (text: string) => (
    <p
      style={{
        margin: '0 0 10px',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#6B7280',
      }}
    >
      {text}
    </p>
  );

  const chip = (label: string, active: boolean, onClick: () => void) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: '20px',
        border: active ? '1px solid #111827' : '1px solid #E5E7EB',
        backgroundColor: active ? '#111827' : '#fff',
        color: active ? '#fff' : '#374151',
        fontSize: '12px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 150ms ease',
      }}
    >
      {label}
    </button>
  );

  return (
    <Drawer open={open} onClose={onClose} position="bottom" title="Filter">
      <div style={{ padding: '16px 20px 24px' }}>
        <div style={{ marginBottom: '24px' }}>
          {sectionTitle('Color')}
          {availableColors.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {availableColors.map(color =>
                chip(color, draft.colors.includes(color), () => toggleColor(color)),
              )}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF' }}>No color filters available.</p>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          {sectionTitle('Size')}
          {availableSizes.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {availableSizes.map(size =>
                chip(size, draft.sizes.includes(size), () => toggleSize(size)),
              )}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF' }}>No size filters available.</p>
          )}
        </div>

        <div style={{ marginBottom: '32px' }}>
          {sectionTitle('Price Range')}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>
                Min (Rp)
              </label>
              <input
                type="number"
                min={0}
                value={draft.minPrice}
                onChange={e => setDraft(d => ({ ...d, minPrice: Number(e.target.value) }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            <span style={{ color: '#D1D5DB', marginTop: '16px' }}>—</span>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>
                Max (Rp)
              </label>
              <input
                type="number"
                min={0}
                value={draft.maxPrice === 999999 ? '' : draft.maxPrice}
                placeholder="Any"
                onChange={e => setDraft(d => ({ ...d, maxPrice: e.target.value ? Number(e.target.value) : 999999 }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleReset}
            style={{ flex: 1, padding: '12px', border: '1px solid #E5E7EB', borderRadius: '6px', background: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleApply}
            style={{ flex: 2, padding: '12px', border: 'none', borderRadius: '6px', backgroundColor: '#111827', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </Drawer>
  );
}
