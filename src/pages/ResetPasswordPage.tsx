import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../app/config/routes';
import { Button, Input } from '../components/shared';
import { CustomerPageHeader, CustomerPageShell, useAuthenticatedCustomer } from '../features/customer';
import { NavigationThemeProvider } from '../features/navigation';
import { resetCustomerPassword } from '../services/auth/customerAuthService';
import { isRequired } from '../utils/validation';

interface ResetPasswordFormState {
  password: string;
  confirmPassword: string;
}

interface ResetPasswordFormErrors {
  password?: string;
  confirmPassword?: string;
}

function getPasswordStrength(password: string) {
  const lengthScore = password.length >= 8 ? 1 : 0;
  const lowercaseScore = /[a-z]/.test(password) ? 1 : 0;
  const uppercaseScore = /[A-Z]/.test(password) ? 1 : 0;
  const numberScore = /\d/.test(password) ? 1 : 0;
  const totalScore = lengthScore + lowercaseScore + uppercaseScore + numberScore;

  if (totalScore <= 1) return { label: 'Weak', width: '25%', tone: 'bg-red-500' };
  if (totalScore === 2) return { label: 'Fair', width: '50%', tone: 'bg-amber-500' };
  if (totalScore === 3) return { label: 'Good', width: '75%', tone: 'bg-blue-500' };
  return { label: 'Strong', width: '100%', tone: 'bg-emerald-500' };
}

function validateResetPasswordForm(values: ResetPasswordFormState): ResetPasswordFormErrors {
  const errors: ResetPasswordFormErrors = {};

  if (!isRequired(values.password)) {
    errors.password = 'Password is required.';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  } else if (!/[A-Z]/.test(values.password) || !/[a-z]/.test(values.password) || !/\d/.test(values.password)) {
    errors.password = 'Password must include uppercase, lowercase, and numeric characters.';
  }

  if (!isRequired(values.confirmPassword)) {
    errors.confirmPassword = 'Confirm Password is required.';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Confirm Password must match the password.';
  }

  return errors;
}

function ResetPasswordPageContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout } = useAuthenticatedCustomer();
  const token = useMemo(() => searchParams.get('token')?.trim() || '', [searchParams]);
  const [form, setForm] = useState<ResetPasswordFormState>({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateResetPasswordForm(form);
    setErrors(nextErrors);
    setFormError('');

    if (!token) {
      setFormError('Password reset token is missing or invalid.');
      return;
    }

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await resetCustomerPassword({
        token,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      await logout().catch(() => undefined);
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { toastMessage: 'Password was updated successfully.' },
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to reset your password right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = getPasswordStrength(form.password);

  return (
    <CustomerPageShell maxWidth="720px">
      <CustomerPageHeader
        sectionLabel="Customer Account"
        title="Reset Password"
        description="Create a new password for your customer account using the secure link from your email."
      />

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        {!token ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Password reset token is missing or invalid.
          </div>
        ) : null}

        <form className="mt-5 grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-3">
            <Input
              label="New Password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              error={errors.password}
              disabled={isSubmitting || !token}
              hint="Use at least 8 characters with uppercase, lowercase, and numeric characters."
            />
            <div className="grid gap-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div className={`h-full rounded-full transition-all ${passwordStrength.tone}`} style={{ width: passwordStrength.width }} />
              </div>
              <p className="m-0 text-xs font-medium text-neutral-500">Strength: {passwordStrength.label}</p>
            </div>
          </div>

          <Input
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
            error={errors.confirmPassword}
            disabled={isSubmitting || !token}
          />

          {formError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          ) : null}

          <Button type="submit" disabled={isSubmitting || !token} className="w-full">
            {isSubmitting ? 'Updating Password...' : 'Update Password'}
          </Button>
        </form>

        <div className="mt-6 text-sm text-neutral-600">
          Continue to{' '}
          <Link to={ROUTES.LOGIN} className="font-medium text-neutral-900 underline-offset-4 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </CustomerPageShell>
  );
}

export function ResetPasswordPage() {
  return (
    <NavigationThemeProvider theme="dark">
      <ResetPasswordPageContent />
    </NavigationThemeProvider>
  );
}
