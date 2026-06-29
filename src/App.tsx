import { useState } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { CatalogDrawer } from './features/catalog';

function App() {
  const [catalogOpen, setCatalogOpen] = useState(false);

  return (
    <MainLayout>
      <HomePage onDiscover={() => setCatalogOpen(true)} />
      <CatalogDrawer
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
      />
    </MainLayout>
  );
}

export default App;
