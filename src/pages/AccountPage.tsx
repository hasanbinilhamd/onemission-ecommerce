import { ArrowRight, CalendarDays, LogOut, Mail, Phone, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../app/config/routes';
import { Button, LoadingSkeleton } from '../components/shared';
import { CustomerPageHeader, CustomerPageShell, useAuthenticatedCustomer } from '../features/customer';
import { NavigationThemeProvider } from '../features/navigation';
import { formatDate } from '../utils/formatting';

function AccountPageContent() {
  const navigate = useNavigate();
  const { user, profile, isLoading, errorMessage, logout } = useAuthenticatedCustomer();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [isLoading, navigate, user]);

  const joinedDate = useMemo(() => (user?.createdAt ? formatDate(user.createdAt) : '—'), [user?.createdAt]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate(ROUTES.HOME, { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <CustomerPageShell>
        <CustomerPageHeader
          sectionLabel="My Account"
          title="My Account"
          description="Manage your customer settings and account activity."
        />
        <div className="grid gap-6">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6">
            <LoadingSkeleton rows={4} />
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-6">
            <LoadingSkeleton rows={3} />
          </div>
        </div>
      </CustomerPageShell>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <CustomerPageShell>
      <CustomerPageHeader
        sectionLabel="My Account"
        title="My Account"
        description="Manage your customer settings and account activity."
      />

      {errorMessage ? (
        <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 text-2xl font-semibold uppercase text-white">
              {profile.initials}
            </div>
            <div>
              <h2 className="m-0 text-2xl font-semibold text-neutral-950">{profile.fullName || user.customerName}</h2>
              <p className="mt-2 text-sm text-neutral-500">{user.customerCode || user.id}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-neutral-50 px-4 py-4">
              <div className="flex items-center gap-3 text-neutral-700">
                <Mail size={18} />
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Email</p>
              </div>
              <p className="mt-3 text-sm font-medium text-neutral-900">{user.email}</p>
            </div>
            <div className="rounded-2xl bg-neutral-50 px-4 py-4">
              <div className="flex items-center gap-3 text-neutral-700">
                <Phone size={18} />
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Phone</p>
              </div>
              <p className="mt-3 text-sm font-medium text-neutral-900">{user.phone || '—'}</p>
            </div>
            <div className="rounded-2xl bg-neutral-50 px-4 py-4 sm:col-span-2">
              <div className="flex items-center gap-3 text-neutral-700">
                <CalendarDays size={18} />
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Joined Date</p>
              </div>
              <p className="mt-3 text-sm font-medium text-neutral-900">{joinedDate}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
              <UserRound size={20} />
            </div>
            <div>
              <h2 className="m-0 text-xl font-semibold text-neutral-950">Account Center</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Quick access to your profile and order activity.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <Button type="button" className="w-full justify-between" onClick={() => navigate(ROUTES.ACCOUNT_PROFILE)}>
              Edit Profile
              <ArrowRight size={16} />
            </Button>
            <Button type="button" variant="secondary" className="w-full justify-between" onClick={() => navigate(ROUTES.ORDERS)}>
              My Orders
              <ArrowRight size={16} />
            </Button>
            <Button type="button" variant="outline" className="w-full justify-between border-red-200 text-red-600 hover:bg-red-50" onClick={() => void handleLogout()} disabled={isLoggingOut}>
              {isLoggingOut ? 'Logging Out...' : 'Logout'}
              <LogOut size={16} />
            </Button>
          </div>
        </section>
      </div>
    </CustomerPageShell>
  );
}

export function AccountPage() {
  return (
    <NavigationThemeProvider theme="dark">
      <AccountPageContent />
    </NavigationThemeProvider>
  );
}
