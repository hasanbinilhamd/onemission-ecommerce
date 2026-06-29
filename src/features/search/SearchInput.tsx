import { Search, X } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  autoFocus?: boolean;
}

export function SearchInput({ value, onChange, onClear, autoFocus = false }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!autoFocus) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [autoFocus]);

  return (
    <div style={{ position: 'relative' }}>
      <Search
        size={20}
        style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search products..."
        aria-label="Search products"
        style={{
          width: '100%',
          height: '60px',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          padding: '0 54px 0 52px',
          fontSize: '18px',
          color: '#111827',
          backgroundColor: '#FFFFFF',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            border: 'none',
            background: 'none',
            color: '#6B7280',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
          }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
