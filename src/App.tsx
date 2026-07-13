import { useState, useEffect, useCallback, useRef } from 'react';
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
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { ProfilePage } from './pages/ProfilePage';
import { AddressesPage } from './pages/AddressesPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { WishlistPage } from './pages/WishlistPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { CatalogDrawer } from './features/catalog';
import { FloatingNavigation, MiniCartDrawer } from './features/cart';
import { AccountDashboardLayout } from './features/customer';
import { SearchOverlay } from './features/search';
import { NavigationThemeProvider } from './features/navigation';

type CatalogOpenMode = 'animated' | 'instant';

type HomeExperienceSnapshot = {
  scrollY: number;
  catalogWasOpen: boolean;
};

const HOME_EXPERIENCE_SNAPSHOT_KEY = 'om-home-experience-snapshot';
const HERO_CAROUSEL_INTERVAL_MS = 4600;
const HERO_SLIDE_COUNT = 4;

function readHomeExperienceSnapshot(): HomeExperienceSnapshot | null {
  if (typeof window === 'undefined') return null;

  try {
    const rawSnapshot = window.sessionStorage.getItem(HOME_EXPERIENCE_SNAPSHOT_KEY);
    if (!rawSnapshot) return null;
    const parsedSnapshot = JSON.parse(rawSnapshot) as Partial<HomeExperienceSnapshot>;
    return {
      scrollY: Number.isFinite(Number(parsedSnapshot.scrollY)) ? Number(parsedSnapshot.scrollY) : 0,
      catalogWasOpen: Boolean(parsedSnapshot.catalogWasOpen),
    };
  } catch {
    return null;
  }
}

function persistHomeExperienceSnapshot(snapshot: HomeExperienceSnapshot): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(HOME_EXPERIENCE_SNAPSHOT_KEY, JSON.stringify(snapshot));
}

function clearRestoreCatalogFlag(locationState: Record<string, unknown> | null | undefined): void {
  if (typeof window === 'undefined') return;

  window.history.replaceState(
    {
      ...window.history.state,
      usr: {
        ...(locationState || {}),
        restoreCatalog: undefined,
      },
    },
    '',
  );
}

function LegacyOrderRedirect() {
  const { orderNumber = '' } = useParams<{ orderNumber: string }>();
  return <Navigate to={`/account/orders/${encodeURIComponent(orderNumber)}`} replace />;
}

function App() {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogOpenMode, setCatalogOpenMode] = useState<CatalogOpenMode>('animated');
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroAutoplayPaused, setHeroAutoplayPaused] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);

  const isHome = location.pathname === '/';
  const shouldPauseHeroAutoplay = heroAutoplayPaused || catalogOpen || !isHome;

  useEffect(() => {
    if (shouldPauseHeroAutoplay) return undefined;

    const timer = window.setInterval(() => {
      setHeroIndex((currentIndex) => (currentIndex + 1) % HERO_SLIDE_COUNT);
    }, HERO_CAROUSEL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [shouldPauseHeroAutoplay]);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    const cameFromProductDetail = previousPath.startsWith('/product/');
    const requestedRestore = Boolean(location.state?.restoreCatalog) || (isHome && cameFromProductDetail);

    if (isHome && requestedRestore) {
      const snapshot = readHomeExperienceSnapshot();
      const restoreScrollY = snapshot?.scrollY ?? 0;
      const restoreCatalog = Boolean(location.state?.restoreCatalog ?? snapshot?.catalogWasOpen);

      requestAnimationFrame(() => {
        window.scrollTo({ top: restoreScrollY, behavior: 'auto' });

        if (restoreCatalog) {
          setCatalogOpenMode('instant');
          requestAnimationFrame(() => {
            setCatalogOpen(true);
            requestAnimationFrame(() => setCatalogOpenMode('animated'));
          });
        }
      });

      clearRestoreCatalogFlag(location.state as Record<string, unknown> | undefined);
    }

    previousPathRef.current = location.pathname;
  }, [isHome, location.pathname, location.state]);

  const handleDiscover = useCallback(() => {
    setCatalogOpenMode('animated');
    setCatalogOpen(true);
  }, []);

  const handleCatalogClose = useCallback(() => {
    setCatalogOpenMode('animated');
    setCatalogOpen(false);

    if (location.pathname === '/') {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }, [location.pathname]);

  const handleProductSelect = useCallback((slug: string) => {
    persistHomeExperienceSnapshot({
      scrollY: window.scrollY,
      catalogWasOpen: true,
    });

    setCatalogOpen(false);
    navigate(`/product/${slug}`, { state: { fromCatalog: true } });
  }, [navigate]);

  const handleHeroAutoplayPauseChange = useCallback((paused: boolean) => {
    setHeroAutoplayPaused(paused);
  }, []);

  const renderHomePage = useCallback(() => (
    <HomePage
      activeIndex={heroIndex}
      catalogOpen={catalogOpen}
      onDiscover={handleDiscover}
      onAutoplayPauseChange={handleHeroAutoplayPauseChange}
    />
  ), [catalogOpen, handleDiscover, handleHeroAutoplayPauseChange, heroIndex]);

  return (
    <NavigationThemeProvider theme={isHome ? 'light' : 'dark'}>
      <>
        <Routes>
          <Route
            path="/"
            element={
              <MainLayout>
                {renderHomePage()}
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
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
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

          <Route path="*" element={<MainLayout>{renderHomePage()}</MainLayout>} />
        </Routes>

        <CatalogDrawer
          open={isHome ? catalogOpen : false}
          openMode={catalogOpenMode}
          onClose={handleCatalogClose}
          onProductSelect={handleProductSelect}
        />

        <FloatingNavigation />
        <MiniCartDrawer />
        <SearchOverlay />
      </>
    </NavigationThemeProvider>
  );
}

export default App;
