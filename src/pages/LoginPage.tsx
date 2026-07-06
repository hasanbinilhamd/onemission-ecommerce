import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../app/config/routes';
import { Button, Input } from '../components/shared';
import { CustomerPageHeader, CustomerPageShell, GoogleLoginButton, useAuthenticatedCustomer } from '../features/customer';
import { NavigationThemeProvider } from '../features/navigation';
import { isEmail, isRequired } from '../utils/validation';

interface LoginFormState {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

function validateLoginForm(values: LoginFormState): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!isRequired(values.email)) {
    errors.email = 'Email is required.';
  } else if (!isEmail(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!isRequired(values.password)) {
    errors.password = 'Password is required.';
  }

  return errors;
}

function LoginPageContent() {
  const navigate = useNavigate();
  const {
    user,
    isLoading,
    isConfigured,
    isGoogleConfigured,
    login,
    loginWithGoogleToken,
  } = useAuthenticatedCustomer();
  const [form, setForm] = useState<LoginFormState>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
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

    const nextErrors = validateLoginForm(form);
    setErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email: form.email,
        password: form.password,
      });
      navigate(ROUTES.HOME, { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to login right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerPageShell maxWidth="720px">
      <CustomerPageHeader
        sectionLabel="Customer Account"
        title="Login"
        description="Login to review your order history and prepare for future customer account features."
      />

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <form className="grid gap-5" onSubmit={handleSubmit}>
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
            label="Password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            error={errors.password}
            disabled={isDisabled}
          />

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
            {isSubmitting ? 'Logging In...' : 'Login'}
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
                  setFormError(error instanceof Error ? error.message : 'Unable to login with Google right now.');
                }
              }}
            />
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 text-sm text-neutral-600">
          <Link to={ROUTES.FORGOT_PASSWORD} className="font-medium text-neutral-900 underline-offset-4 hover:underline">
            Forgot Password
          </Link>
          <div>
            Don&apos;t have an account yet?{' '}
            <Link to={ROUTES.REGISTER} className="font-medium text-neutral-900 underline-offset-4 hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </CustomerPageShell>
  );
}

export function LoginPage() {
  return (
    <NavigationThemeProvider theme="dark">
      <LoginPageContent />
    </NavigationThemeProvider>
  );
}
