import type { Product } from '../../types';
import { ProductCard } from '../catalog';

interface PopularProductsProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export function PopularProducts({ products, onSelect }: PopularProductsProps) {
  if (products.length === 0) return null;

  return (
    <section>
      <h3 style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Popular Products
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4" style={{ display: 'grid', gap: '20px 16px' }}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onClick={onSelect} />
        ))}
      </div>
    </section>
  );
}
