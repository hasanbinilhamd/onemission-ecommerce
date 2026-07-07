import { useState, useEffect, useCallback } from 'react';
import { Navigate, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentFailedPage, PaymentPendingPage, PaymentSuccessPage } from './pages/PaymentStatusPages';
import { AccountPage } from './pages/AccountPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { ProfilePage } from './pages/ProfilePage';
import { AddressesPage } from './pages/AddressesPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { WishlistPage } from './pages/WishlistPage';
import { ForgotPasswordPage } from './pages/PlaceholderPages';
import { CatalogDrawer } from './features/catalog';
import { FloatingNavigation, MiniCartDrawer } from './features/cart';
import { AccountDashboardLayout } from './features/customer';
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
function LegacyOrderRedirect() {
  const { orderNumber = '' } = useParams<{ orderNumber: string }>();
  return <Navigate to={`/account/orders/${encodeURIComponent(orderNumber)}`} replace />;
}

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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />

          <Route path="/account" element={<AccountDashboardLayout />}>
            <Route index element={<AccountPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="address" element={<AddressesPage />} />
            <Route path="orders" element={<MyOrdersPage />} />
            <Route path="orders/:orderNumber" element={<OrderDetailPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="password" element={<ChangePasswordPage />} />
          </Route>

          <Route path="/account/addresses" element={<Navigate to="/account/address" replace />} />
          <Route path="/account/change-password" element={<Navigate to="/account/password" replace />} />
          <Route path="/orders" element={<Navigate to="/account/orders" replace />} />
          <Route path="/orders/:orderNumber" element={<LegacyOrderRedirect />} />
          <Route path="/wishlist" element={<Navigate to="/account/wishlist" replace />} />

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
