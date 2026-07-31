import { lazy, Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { Navigate, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Toaster } from 'sonner';
import { MainLayout } from './layouts/MainLayout';
import { ROUTES } from './app/config/routes';
import { HomePage } from './pages/HomePage';
import { FloatingNavigation } from './features/cart';
import { NavigationThemeProvider, RouteScrollRestoration, type NavigationTheme } from './features/navigation';

const CollectionPage = lazy(() => import('./pages/CollectionPage').then((module) => ({ default: module.CollectionPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then((module) => ({ default: module.TermsPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((module) => ({ default: module.PrivacyPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then((module) => ({ default: module.ProductDetailPage })));
const CartPage = lazy(() => import('./pages/CartPage').then((module) => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage })));
const PaymentCancelledPage = lazy(() => import('./pages/PaymentStatusPages').then((module) => ({ default: module.PaymentCancelledPage })));
const PaymentExpiredPage = lazy(() => import('./pages/PaymentStatusPages').then((module) => ({ default: module.PaymentExpiredPage })));
const PaymentFailedPage = lazy(() => import('./pages/PaymentStatusPages').then((module) => ({ default: module.PaymentFailedPage })));
const PaymentPendingPage = lazy(() => import('./pages/PaymentStatusPages').then((module) => ({ default: module.PaymentPendingPage })));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentStatusPages').then((module) => ({ default: module.PaymentSuccessPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then((module) => ({ default: module.AccountPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then((module) => ({ default: module.VerifyEmailPage })));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage').then((module) => ({ default: module.MyOrdersPage })));
const CheckoutHistoryPage = lazy(() => import('./pages/CheckoutHistoryPage').then((module) => ({ default: module.CheckoutHistoryPage })));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage').then((module) => ({ default: module.OrderDetailPage })));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage').then((module) => ({ default: module.TrackOrderPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const AddressesPage = lazy(() => import('./pages/AddressesPage').then((module) => ({ default: module.AddressesPage })));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage').then((module) => ({ default: module.ChangePasswordPage })));
const WishlistPage = lazy(() => import('./pages/WishlistPage').then((module) => ({ default: module.WishlistPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage })));
const AccountDashboardLayout = lazy(() => import('./features/customer').then((module) => ({ default: module.AccountDashboardLayout })));
const MiniCartDrawer = lazy(() => import('./features/cart').then((module) => ({ default: module.MiniCartDrawer })));
const SearchOverlay = lazy(() => import('./features/search').then((module) => ({ default: module.SearchOverlay })));

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


function restoreHomepageBrowsingPosition(snapshot: HomeExperienceSnapshot | null): void {
  if (typeof window === 'undefined') return;

  const restoreToFeaturedSection = () => {
    const featuredSection = document.getElementById('featured-products-section');
    if (!featuredSection) return;
    const nextTop = Math.max(0, featuredSection.getBoundingClientRect().top + window.scrollY - 24);
    window.scrollTo({ top: nextTop, behavior: 'auto' });
  };

  const restorePosition = () => {
    const targetScrollY = Number(snapshot?.scrollY || 0);
    if (targetScrollY > 0) {
      window.scrollTo({ top: targetScrollY, behavior: 'auto' });
      return;
    }

    restoreToFeaturedSection();
  };

  requestAnimationFrame(() => {
    restorePosition();
    requestAnimationFrame(restorePosition);
    window.setTimeout(restorePosition, 120);
    window.setTimeout(restorePosition, 280);
  });
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
      }
      restoreHomepageBrowsingPosition(snapshot);

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

  const handleCollectionSelect = useCallback(() => {
    navigate(ROUTES.COLLECTION);
  }, [navigate]);

  const renderHomePage = useCallback(() => (
    <HomePage
      activeIndex={heroIndex}
      onActiveIndexChange={setHeroIndex}
      onProductSelect={handleProductSelect}
      onCollectionSelect={handleCollectionSelect}
    />
  ), [handleCollectionSelect, handleProductSelect, heroIndex]);

  return (
    <NavigationThemeProvider theme={navigationTheme}>
      <>
        <RouteScrollRestoration />
        <Suspense fallback={null}>
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
        </Suspense>

        <FloatingNavigation />
        <Suspense fallback={null}>
          <MiniCartDrawer />
          <SearchOverlay />
        </Suspense>
        <Toaster position="top-center" richColors />
      </>
    </NavigationThemeProvider>
  );
}

export default App;
