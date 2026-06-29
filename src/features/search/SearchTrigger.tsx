import { Search } from 'lucide-react';
import { useNavigationTheme } from '../navigation';
import { useSearchStore } from '../../stores';

export function SearchTrigger() {
  const { colors } = useNavigationTheme();
  const { openSearch } = useSearchStore();

  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Open global search"
      style={{
        border: 'none',
        background: 'none',
        color: colors.foreground,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: '8px',
        lineHeight: 1,
      }}
    >
      <Search size={24} strokeWidth={2} />
    </button>
  );
}
