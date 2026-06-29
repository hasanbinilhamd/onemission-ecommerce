import type { Product } from '../../types';
import { ProductCard } from '../catalog';

interface SearchResultsProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export function SearchResults({ products, onSelect }: SearchResultsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4" style={{ display: 'grid', gap: '20px 16px' }}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onClick={onSelect} />
      ))}
    </div>
  );
}
