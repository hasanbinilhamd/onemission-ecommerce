import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigate, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { CollectionPage } from './pages/CollectionPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentCancelledPage, PaymentExpiredPage, PaymentFailedPage, PaymentPendingPage, PaymentSuccessPage } from './pages/PaymentStatusPages';
import { AccountPage } from './pages/AccountPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { CheckoutHistoryPage } from './pages/CheckoutHistoryPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { ProfilePage } from './pages/ProfilePage';
import { AddressesPage } from './pages/AddressesPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { WishlistPage } from './pages/WishlistPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { FloatingNavigation, MiniCartDrawer } from './features/cart';
import { AccountDashboardLayout } from './features/customer';
import { SearchOverlay } from './features/search';
import { NavigationThemeProvider, RouteScrollRestoration, type NavigationTheme } from './features/navigation';

type HomeExperienceSnapshot = {
  scrollY: number;
  heroIndex: number;
};

const HOME_EXPERIENCE_SNAPSHOT_KEY = 'om-home-experience-snapshot';

function readHomeExperienceSnapshot(): HomeExperienceSnapshot | null {
  if (typeof window === 'undefined') return null;

  try {
    const rawSnapshot = window.sessionStorage.getItem(HOME_EXPERIENCE_SNAPSHOT_KEY);
    if (!rawSnapshot) return null;
    const parsedSnapshot = JSON.parse(rawSnapshot) as Partial<HomeExperienceSnapshot>;
    return {
      scrollY: Number.isFinite(Number(parsedSnapshot.scrollY)) ? Number(parsedSnapshot.scrollY) : 0,
      heroIndex: Number.isFinite(Number(parsedSnapshot.heroIndex)) ? Number(parsedSnapshot.heroIndex) : 0,
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

function resolveHomepageNavigationTheme(): NavigationTheme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.scrollY < Math.max((window.innerHeight || 0) - 80, 120)
    ? 'light'
    : 'dark';
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);
  const [heroIndex, setHeroIndex] = useState(() => readHomeExperienceSnapshot()?.heroIndex ?? 0);
  const [navigationTheme, setNavigationTheme] = useState<NavigationTheme>(() => (
    location.pathname === '/' ? resolveHomepageNavigationTheme() : 'dark'
  ));

  const isHome = location.pathname === '/';

  useEffect(() => {
    const previousPath = previousPathRef.current;
    const requestedRestore = Boolean(location.state?.restoreCatalog);
    const cameFromProductDetail = previousPath.startsWith('/product/');

    if (isHome && (requestedRestore || cameFromProductDetail)) {
      const snapshot = readHomeExperienceSnapshot();
      if (snapshot) {
        setHeroIndex(snapshot.heroIndex);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo({ top: snapshot.scrollY, behavior: 'auto' });
          });
        });
      }

      if (requestedRestore) {
        clearRestoreCatalogFlag(location.state as Record<string, unknown> | undefined);
      }
    }

    previousPathRef.current = location.pathname;
  }, [isHome, location.pathname, location.state]);

  useEffect(() => {
    if (!isHome) {
      setNavigationTheme('dark');
      return undefined;
    }

    const updateNavigationTheme = () => {
      setNavigationTheme((currentTheme) => {
        const nextTheme = resolveHomepageNavigationTheme();
        return currentTheme === nextTheme ? currentTheme : nextTheme;
      });
    };

    updateNavigationTheme();
    window.addEventListener('scroll', updateNavigationTheme, { passive: true });
    window.addEventListener('resize', updateNavigationTheme);

    return () => {
      window.removeEventListener('scroll', updateNavigationTheme);
      window.removeEventListener('resize', updateNavigationTheme);
    };
  }, [isHome]);

  const handleProductSelect = useCallback((slug: string) => {
    persistHomeExperienceSnapshot({
      scrollY: window.scrollY,
      heroIndex,
    });

    navigate(`/product/${slug}`, { state: { fromCatalog: true } });
  }, [heroIndex, navigate]);

  const renderHomePage = useCallback(() => (
    <HomePage
      activeIndex={heroIndex}
      onActiveIndexChange={setHeroIndex}
      onProductSelect={handleProductSelect}
    />
  ), [handleProductSelect, heroIndex]);

  return (
    <NavigationThemeProvider theme={navigationTheme}>
      <>
        <RouteScrollRestoration />
        <Routes>
          <Route
            path="/"
            element={<MainLayout>{renderHomePage()}</MainLayout>}
          />

          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/pending" element={<PaymentPendingPage />} />
          <Route path="/payment/expired" element={<PaymentExpiredPage />} />
          <Route path="/payment/cancelled" element={<PaymentCancelledPage />} />
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
            <Route path="checkout-history" element={<CheckoutHistoryPage />} />
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

        <FloatingNavigation />
        <MiniCartDrawer />
        <SearchOverlay />
      </>
    </NavigationThemeProvider>
  );
}

export default App;
