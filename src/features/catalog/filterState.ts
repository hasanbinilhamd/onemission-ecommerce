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
