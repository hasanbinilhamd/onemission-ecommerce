import { Clock3, Grid2x2, KeyRound, LogOut, MapPinned, Menu, Package2, UserRound, Heart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/config/routes';
import { Button, Drawer } from '../../components/shared';
import { CustomerPageShell } from './CustomerPageLayout';
import { useAuthenticatedCustomer } from './useAuthenticatedCustomer';

const COMMERCE_LOGO_URL = 'https://ik.imagekit.io/edyl3oplm/Onemission/logos/AMAN_ONEMISSION.png?updatedAt=1782542636942';

const accountNavigationItems = [
  { label: 'Overview', icon: Grid2x2, to: ROUTES.ACCOUNT },
  { label: 'My Profile', icon: UserRound, to: ROUTES.ACCOUNT_PROFILE },
  { label: 'Address Book', icon: MapPinned, to: ROUTES.ACCOUNT_ADDRESSES },
  { label: 'My Orders', icon: Package2, to: ROUTES.ACCOUNT_ORDERS },
  { label: 'Checkout History', icon: Clock3, to: ROUTES.ACCOUNT_CHECKOUT_HISTORY },
  { label: 'Wishlist', icon: Heart, to: ROUTES.ACCOUNT_WISHLIST },
  { label: 'Change Password', icon: KeyRound, to: ROUTES.ACCOUNT_PASSWORD },
];

function getAccountBreadcrumbLabel(pathname: string) {
  const matchedItem = accountNavigationItems.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
  if (matchedItem) {
    return matchedItem.label;
  }

  return 'My Account';
}

function SidebarNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { logout } = useAuthenticatedCustomer();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onNavigate?.();
      navigate(ROUTES.HOME, { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <nav className="grid gap-1.5">
        {accountNavigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ROUTES.ACCOUNT}
              onClick={onNavigate}
              className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <Button type="button" variant="outline" className="w-full justify-between border-red-200 text-red-600 hover:bg-red-50" onClick={() => void handleLogout()} disabled={isLoggingOut}>
        <span className="inline-flex items-center gap-3">
          <LogOut size={18} />
          {isLoggingOut ? 'Logging Out...' : 'Logout'}
        </span>
      </Button>
    </div>
  );
}

export function AccountDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isLoading } = useAuthenticatedCustomer();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [isLoading, navigate, user]);

  const currentLabel = useMemo(() => getAccountBreadcrumbLabel(location.pathname), [location.pathname]);

  if (isLoading) {
    return (
      <CustomerPageShell maxWidth="1280px">
        <div className="rounded-3xl border border-neutral-200 bg-white px-6 py-10 text-sm text-neutral-500">
          Loading your account...
        </div>
      </CustomerPageShell>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <CustomerPageShell maxWidth="1280px">
      <div className="mb-8 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <button type="button" onClick={() => navigate(ROUTES.HOME)} className="inline-flex items-center">
            <img src={COMMERCE_LOGO_URL} alt="ONEMISSION" className="h-8 w-auto sm:h-10" />
          </button>

          <Button type="button" variant="outline" size="sm" className="gap-2 lg:hidden" onClick={() => setIsDrawerOpen(true)}>
            <Menu size={16} />
            Menu
          </Button>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <button type="button" onClick={() => navigate(ROUTES.HOME)} className="font-medium transition-colors hover:text-neutral-900">
              Home
            </button>
            <span>/</span>
            <button type="button" onClick={() => navigate(ROUTES.ACCOUNT)} className="font-medium transition-colors hover:text-neutral-900">
              My Account
            </button>
            <span>/</span>
            <span className="text-neutral-900">{currentLabel}</span>
          </div>
          <h1 className="m-0 text-3xl font-semibold text-neutral-950 sm:text-4xl">My Account</h1>
          <p className="mt-2 text-sm leading-7 text-neutral-500 sm:text-base">
            Manage your customer profile, addresses, orders, wishlist, and security settings from one place.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl bg-neutral-50 p-4">
            <div className="mb-4 rounded-2xl bg-white px-4 py-4">
              <p className="m-0 text-sm font-semibold text-neutral-950">{profile.fullName || profile.email}</p>
              <p className="mt-1 text-xs text-neutral-500">{profile.email}</p>
            </div>
            <SidebarNavigation />
          </div>
        </aside>

        <section className="min-w-0">
          <Outlet />
        </section>
      </div>

      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        position="left"
        title="My Account"
        width="sm"
      >
        <div className="p-5">
          <div className="mb-5 rounded-2xl bg-neutral-50 px-4 py-4">
            <p className="m-0 text-sm font-semibold text-neutral-950">{profile.fullName || profile.email}</p>
            <p className="mt-1 text-xs text-neutral-500">{profile.email}</p>
          </div>
          <SidebarNavigation onNavigate={() => setIsDrawerOpen(false)} />
        </div>
      </Drawer>
    </CustomerPageShell>
  );
}
