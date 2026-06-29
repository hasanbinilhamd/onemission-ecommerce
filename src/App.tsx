import { useState } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { CatalogDrawer } from './features/catalog';
import { DURATION, EASING } from './utils/motion';

function App() {
  const [catalogOpen, setCatalogOpen] = useState(false);

  return (
    <MainLayout>
      {/*
       * Hero wrapper — applies blur + dim + pointer-events:none when the
       * Catalog Drawer is open.  This keeps the hero visible in the background
       * while making it clear it is not the active layer.
       *
       * transition uses the same DURATION.normal as the Drawer so both
       * effects feel synchronised.
       */}
      <div
        style={{
          transition: `filter ${DURATION.normal}ms ${EASING.standard}, opacity ${DURATION.normal}ms ${EASING.standard}`,
          filter: catalogOpen ? 'blur(4px) brightness(0.7)' : 'none',
          opacity: catalogOpen ? 0.85 : 1,
          pointerEvents: catalogOpen ? 'none' : 'auto',
          willChange: 'filter, opacity',
        }}
      >
        <HomePage onDiscover={() => setCatalogOpen(true)} />
      </div>

      <CatalogDrawer
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
      />
    </MainLayout>
  );
}

export default App;
