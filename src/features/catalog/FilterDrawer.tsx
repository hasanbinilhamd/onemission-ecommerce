import { useEffect, useState } from 'react';
import { Drawer } from '../../components/shared/Drawer';
import { DEFAULT_FILTERS, type FilterState } from './filterState';

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
  availableColors: string[];
  availableSizes: string[];
  sort?: string;
  sortOptions?: Array<{ value: string; label: string }>;
  onSortChange?: (sort: string) => void;
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
  sort = '',
  sortOptions = [],
  onSortChange,
}: FilterDrawerProps) {
  const [draft, setDraft] = useState<FilterState>(filters);
  const [draftSort, setDraftSort] = useState(sort);
  const hasSortControls = Boolean(onSortChange && sortOptions.length > 0);

  useEffect(() => {
    if (open) {
      setDraft(filters);
      setDraftSort(sort);
    }
  }, [filters, open, sort]);

  const toggleColor = (color: string) => {
    setDraft(d => ({ ...d, colors: toggleItem(d.colors, color) }));
  };

  const toggleSize = (size: string) => {
    setDraft(d => ({ ...d, sizes: toggleItem(d.sizes, size) }));
  };

  const handleApply = () => {
    onApply(draft);
    if (hasSortControls && draftSort) {
      onSortChange?.(draftSort);
    }
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
    <Drawer open={open} onClose={onClose} position="bottom" title={hasSortControls ? 'Filter & Sort' : 'Filter'}>
      <div style={{ padding: '16px 20px 24px' }}>
        {hasSortControls ? (
          <div style={{ marginBottom: '24px' }}>
            {sectionTitle('Sort')}
            <select
              value={draftSort}
              onChange={event => setDraftSort(event.target.value)}
              aria-label="Sort products"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        ) : null}

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

        <div style={{ position: 'sticky', bottom: 0, display: 'flex', gap: '10px', margin: '0 -20px -24px', padding: '12px 20px max(16px, env(safe-area-inset-bottom))', borderTop: '1px solid #F3F4F6', backgroundColor: '#fff' }}>
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
            {hasSortControls ? 'Apply Filter & Sort' : 'Apply Filters'}
          </button>
        </div>
      </div>
    </Drawer>
  );
}
