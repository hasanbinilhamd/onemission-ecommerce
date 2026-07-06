import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../app/config/routes';
import { Button, Input } from '../components/shared';
import { CustomerPageHeader, CustomerPageShell, GoogleLoginButton, useAuthenticatedCustomer } from '../features/customer';
import { NavigationThemeProvider } from '../features/navigation';
import { isEmail, isRequired } from '../utils/validation';

interface RegisterFormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

function validateRegisterForm(values: RegisterFormState): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (!isRequired(values.fullName)) {
    errors.fullName = 'Full Name is required.';
  }

  if (!isRequired(values.email)) {
    errors.email = 'Email is required.';
  } else if (!isEmail(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!isRequired(values.phone)) {
    errors.phone = 'Phone is required.';
  }

  if (!isRequired(values.password)) {
    errors.password = 'Password is required.';
  }

  if (!isRequired(values.confirmPassword)) {
    errors.confirmPassword = 'Confirm Password is required.';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Password confirmation does not match.';
  }

  return errors;
}

function RegisterPageContent() {
  const navigate = useNavigate();
  const {
    user,
    isLoading,
    isConfigured,
    isGoogleConfigured,
    register,
    loginWithGoogleToken,
  } = useAuthenticatedCustomer();
  const [form, setForm] = useState<RegisterFormState>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user && !formError && !isSubmitting) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [formError, isLoading, isSubmitting, navigate, user]);

  const isDisabled = useMemo(
    () => isSubmitting || !isConfigured,
    [isConfigured, isSubmitting],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateRegisterForm(form);
    setErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        customerName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      navigate(ROUTES.HOME, { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to create your account right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerPageShell maxWidth="760px">
      <CustomerPageHeader
        sectionLabel="Customer Account"
        title="Register"
        description="Create your customer account to make future shopping, order history, and saved preferences easier to manage."
      />

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Full Name"
                autoComplete="name"
                value={form.fullName}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                error={errors.fullName}
                disabled={isDisabled}
              />
            </div>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              error={errors.email}
              disabled={isDisabled}
            />
            <Input
              label="Phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              error={errors.phone}
              disabled={isDisabled}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              error={errors.password}
              disabled={isDisabled}
            />
            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              error={errors.confirmPassword}
              disabled={isDisabled}
            />
          </div>

          {!isConfigured ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Customer authentication is not configured in this environment yet.
            </div>
          ) : null}

          {formError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          ) : null}

          <Button type="submit" disabled={isDisabled} className="w-full">
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        {isGoogleConfigured ? (
          <div className="my-6 grid gap-4">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-neutral-400">
              <span className="h-px flex-1 bg-neutral-200" />
              <span>Or continue with</span>
              <span className="h-px flex-1 bg-neutral-200" />
            </div>
            <GoogleLoginButton
              disabled={isSubmitting}
              onCredential={async (idToken) => {
                try {
                  setFormError('');
                  await loginWithGoogleToken(idToken);
                  navigate(ROUTES.HOME, { replace: true });
                } catch (error) {
                  setFormError(error instanceof Error ? error.message : 'Unable to continue with Google right now.');
                }
              }}
            />
          </div>
        ) : null}

        <div className="mt-6 text-sm text-neutral-600">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="font-medium text-neutral-900 underline-offset-4 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </CustomerPageShell>
  );
}

export function RegisterPage() {
  return (
    <NavigationThemeProvider theme="dark">
      <RegisterPageContent />
    </NavigationThemeProvider>
  );
}
