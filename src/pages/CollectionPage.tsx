import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../app/config/routes';
import { CollectionHeroSection } from '../features/catalog/CollectionHeroSection';
import { CollectionPageCatalog } from '../features/catalog/CollectionPageCatalog';
import { TopBackNavigation } from '../features/navigation';
import { websiteService, type WebsiteCollectionHero } from '../services/api/websiteService';

export function CollectionPage() {
  const navigate = useNavigate();
  const [collectionHero, setCollectionHero] = useState<WebsiteCollectionHero | null>(null);

  useEffect(() => {
    let isActive = true;
    const loadCollectionHero = async () => {
      try {
        const response = await websiteService.getCollectionHero();
        if (isActive) {
          setCollectionHero(response);
        }
      } catch {
        if (isActive) {
          setCollectionHero(null);
        }
      }
    };

    void loadCollectionHero();
    return () => {
      isActive = false;
    };
  }, []);

  const handleProductSelect = useCallback((slug: string) => {
    navigate(`/product/${slug}`, { state: { fromCollection: true } });
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <TopBackNavigation label="Back to Home" fallbackTo={ROUTES.HOME} />
      <CollectionHeroSection hero={collectionHero} />
      <CollectionPageCatalog onProductSelect={handleProductSelect} />
    </div>
  );
}
