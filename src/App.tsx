import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentFailedPage, PaymentPendingPage, PaymentSuccessPage } from './pages/PaymentStatusPages';
import { CatalogDrawer } from './features/catalog';
import { FloatingNavigation, MiniCartDrawer } from './features/cart';
import { SearchOverlay } from './features/search';
import { NavigationThemeProvider } from './features/navigation';
import { DURATION, EASING } from './utils/motion';

/**
 * App
 *
 * Routing root.
 *
 * CatalogDrawer is rendered OUTSIDE <Routes> and stays mounted for the
 * lifetime of the app. This ensures its internal state (search, category,
 * sort, scroll position) survives navigation to /product/:slug and back.
 *
 * State restoration flow:
 *  1. User clicks product → catalogOpen=false, navigate(/product/:slug, { fromCatalog: true })
 *  2. User clicks "Back to Collection" → navigate('/', { restoreCatalog: true })
 *  3. useEffect detects restoreCatalog flag → setCatalogOpen(true)
 */
function App() {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const navigate   = useNavigate();
  const location   = useLocation();

  const isHome = location.pathname === '/';

  // Re-open the catalog when returning from Product Detail
  useEffect(() => {
    if (location.state?.restoreCatalog) {
      setCatalogOpen(true);
      // Clear the flag so it doesn't re-trigger if the component re-renders
      window.history.replaceState(
        { ...window.history.state, usr: { ...location.state, restoreCatalog: undefined } },
        '',
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.state?.restoreCatalog]);

  const handleDiscover = useCallback(() => setCatalogOpen(true), []);
  const handleCatalogClose = useCallback(() => setCatalogOpen(false), []);

  const handleProductSelect = useCallback(
    (slug: string) => {
      setCatalogOpen(false);
      navigate(`/product/${slug}`, { state: { fromCatalog: true } });
    },
    [navigate],
  );

  return (
    <NavigationThemeProvider theme={isHome ? 'light' : 'dark'}>
      <>
        <Routes>
          <Route
            path="/"
            element={
              <MainLayout>
                {/*
                 * Hero wrapper — blurred/dimmed/non-interactive while the
                 * Catalog Drawer is open. Transition matches DURATION.normal
                 * so the hero and drawer animate in sync.
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
                  <HomePage onDiscover={handleDiscover} />
                </div>
              </MainLayout>
            }
          />

          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/pending" element={<PaymentPendingPage />} />
          <Route path="/payment/failed" element={<PaymentFailedPage />} />

          {/* Fallback → home */}
          <Route path="*" element={<MainLayout><HomePage onDiscover={handleDiscover} /></MainLayout>} />
        </Routes>

        {/*
         * CatalogDrawer is intentionally outside <Routes>.
         * It stays mounted on every route so its React state is preserved
         * across navigation. The `open` prop controls visibility.
         * On non-home routes the Drawer is not open so it renders null.
         */}
        {isHome && (
          <CatalogDrawer
            open={catalogOpen}
            onClose={handleCatalogClose}
            onProductSelect={handleProductSelect}
          />
        )}

        <FloatingNavigation />
        <MiniCartDrawer />
        <SearchOverlay />
      </>
    </NavigationThemeProvider>
  );
}

export default App;
