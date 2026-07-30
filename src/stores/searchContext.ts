import { createContext, useContext } from 'react';

export interface SearchContextValue {
  isSearchOpen: boolean;
  query: string;
  recentSearches: string[];
  openSearch: () => void;
  closeSearch: () => void;
  setQuery: (value: string) => void;
  submitRecentSearch: (value: string) => void;
  clearQuery: () => void;
}

export const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearchStore(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchStore must be used within a SearchProvider');
  }

  return context;
}
