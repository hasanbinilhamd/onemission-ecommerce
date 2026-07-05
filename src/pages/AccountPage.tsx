import { ArrowRight, PackageSearch, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, EmptyState, LoadingSkeleton } from '../components/shared';
import { useAuthenticatedCustomer } from '../features/customer';
import { NavigationThemeProvider } from '../features/navigation';

function AccountPageContent() {
  const navigate = useNavigate();
  const { user, isLoading, errorMessage, isConfigured } = useAuthenticatedCustomer();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '104px 24px 60px' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px', maxWidth: '720px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600 }}>
            Account
          </p>
          <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: 1.1, color: '#111827' }}>
            Customer Account
          </h1>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.7, color: '#6B7280' }}>
            Review your order history when you are signed in, or track an order as a guest using your email and order number.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6">
              <LoadingSkeleton rows={4} />
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-white p-6">
              <LoadingSkeleton rows={4} />
            </div>
          </div>
        ) : errorMessage ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                  <UserRound size={20} />
                </div>
                <div>
                  <h2 className="m-0 text-xl font-semibold text-neutral-950">My Orders</h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    View your order history and fulfillment progress.
                  </p>
                </div>
              </div>

              {user?.email ? (
                <>
                  <p className="mb-5 rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                    Signed in as <span className="font-semibold text-neutral-950">{user.email}</span>
                  </p>
                  <Button type="button" className="w-full justify-between" onClick={() => navigate('/account/orders')}>
                    View My Orders
                    <ArrowRight size={16} />
                  </Button>
                </>
              ) : (
                <EmptyState
                  icon={<UserRound size={32} />}
                  title={isConfigured ? 'Sign in required' : 'Authentication is not configured'}
                  description={isConfigured
                    ? 'A signed-in customer session is required before we can show your order history.'
                    : 'Supabase authentication is not configured in this environment, so My Orders is unavailable right now.'}
                />
              )}
            </section>

            <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                  <PackageSearch size={20} />
                </div>
                <div>
                  <h2 className="m-0 text-xl font-semibold text-neutral-950">Track Order</h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Search any order using the checkout email and the order number.
                  </p>
                </div>
              </div>

              <p className="mb-5 text-sm leading-7 text-neutral-600">
                Guest tracking is available without login and shows the same order detail information, including payment summary, shipping details, products, and timeline.
              </p>

              <Button type="button" variant="secondary" className="w-full justify-between" onClick={() => navigate('/track-order')}>
                Open Track Order
                <ArrowRight size={16} />
              </Button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export function AccountPage() {
  return (
    <NavigationThemeProvider theme="dark">
      <AccountPageContent />
    </NavigationThemeProvider>
  );
}
