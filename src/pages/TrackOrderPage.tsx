import { PackageSearch } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../app/config/routes';
import { Button, EmptyState, Input, LoadingSkeleton } from '../components/shared';
import { CustomerPageHeader, CustomerPageShell, OrderDetailView } from '../features/customer';
import { NavigationThemeProvider } from '../features/navigation';
import { findGuestOrder } from '../services/api/orderService';
import type { CommerceOrderDetail } from '../types';
import { isEmail, isRequired } from '../utils/validation';

interface FieldErrors {
  email?: string;
  orderNumber?: string;
}

function validateForm(email: string, orderNumber: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!isRequired(email)) {
    errors.email = 'Email is required.';
  } else if (!isEmail(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!isRequired(orderNumber)) {
    errors.orderNumber = 'Order Number is required.';
  }

  return errors;
}

function TrackOrderPageContent() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [order, setOrder] = useState<CommerceOrderDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasOrder = useMemo(() => Boolean(order), [order]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(email, orderNumber);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setOrder(null);

    try {
      const result = await findGuestOrder({
        email,
        orderNumber,
      });

      if (!result) {
        setErrorMessage("We couldn't find an order matching your email and order number.");
        return;
      }

      setOrder(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to track your order right now.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomerPageShell maxWidth="1200px">
      <CustomerPageHeader
        sectionLabel="Public Tracking"
        title="Track Order"
        description="Enter the same email used during checkout together with the public order number from your confirmation."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={errors.email}
                placeholder="you@example.com"
              />
              <Input
                label="Order Number"
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
                error={errors.orderNumber}
                placeholder="OM-H8LPW-XZ99F"
              />

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button type="submit" disabled={isLoading} className="sm:flex-1">
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.LOGIN)} className="sm:flex-1">
                  Login
                </Button>
              </div>
            </form>
          </section>

          <section>
            {isLoading ? (
              <div className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6">
                <LoadingSkeleton rows={4} />
                <LoadingSkeleton rows={8} />
              </div>
            ) : hasOrder && order ? (
              <OrderDetailView order={order} />
            ) : errorMessage ? (
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
                <EmptyState
                  icon={<PackageSearch size={36} />}
                  title="Order not found"
                  description={errorMessage}
                />
              </div>
            ) : (
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
                <EmptyState
                  icon={<PackageSearch size={36} />}
                  title="Search for your order"
                  description="When we find a match, the order detail, shipping information, products, payment information, and timeline will appear here."
                />
              </div>
            )}
          </section>
      </div>
    </CustomerPageShell>
  );
}

export function TrackOrderPage() {
  return (
    <NavigationThemeProvider theme="dark">
      <TrackOrderPageContent />
    </NavigationThemeProvider>
  );
}
