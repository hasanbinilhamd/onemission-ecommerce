import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../app/config/routes';
import { CollectionPageCatalog } from '../features/catalog/CollectionPageCatalog';
import { TopBackNavigation } from '../features/navigation';

export function CollectionPage() {
  const navigate = useNavigate();

  const handleProductSelect = useCallback((slug: string) => {
    navigate(`/product/${slug}`, { state: { fromCollection: true } });
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <TopBackNavigation label="Back to Home" fallbackTo={ROUTES.HOME} />
      <CollectionPageCatalog onProductSelect={handleProductSelect} />
    </div>
  );
}
