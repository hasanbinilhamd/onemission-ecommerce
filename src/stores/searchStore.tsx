import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const RECENT_SEARCHES_KEY = 'onemission-recent-searches';
const MAX_RECENT_SEARCHES = 5;

interface SearchContextValue {
  isSearchOpen: boolean;
  query: string;
  recentSearches: string[];
  openSearch: () => void;
  closeSearch: () => void;
  setQuery: (value: string) => void;
  submitRecentSearch: (value: string) => void;
  clearQuery: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

function normalizeSearch(value: string): string {
  return value.trim();
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQueryState] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as unknown;
      if (Array.isArray(parsed)) {
        setRecentSearches(parsed.filter((item): item is string => typeof item === 'string'));
      }
    } catch {
      window.localStorage.removeItem(RECENT_SEARCHES_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  const clearQuery = useCallback(() => setQueryState(''), []);

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
  }, []);

  const submitRecentSearch = useCallback((value: string) => {
    const normalized = normalizeSearch(value);
    if (!normalized) return;

    setQueryState(normalized);
    setRecentSearches((current) => {
      const next = [normalized, ...current.filter((item) => item.toLowerCase() !== normalized.toLowerCase())];
      return next.slice(0, MAX_RECENT_SEARCHES);
    });
  }, []);

  const value = useMemo<SearchContextValue>(() => ({
    isSearchOpen,
    query,
    recentSearches,
    openSearch,
    closeSearch,
    setQuery,
    submitRecentSearch,
    clearQuery,
  }), [isSearchOpen, query, recentSearches, openSearch, closeSearch, setQuery, submitRecentSearch, clearQuery]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearchStore(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchStore must be used within a SearchProvider');
  }
  return context;
}
