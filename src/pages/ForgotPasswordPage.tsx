import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../app/config/routes';
import { Button, Input } from '../components/shared';
import { CustomerPageHeader, CustomerPageShell } from '../features/customer';
import { NavigationThemeProvider } from '../features/navigation';
import { requestCustomerPasswordReset } from '../services/auth/customerAuthService';
import { isEmail, isRequired } from '../utils/validation';

interface ForgotPasswordFormState {
  email: string;
}

interface ForgotPasswordFormErrors {
  email?: string;
}

const successMessage = 'If an account with that email exists, we have sent password reset instructions.';

function validateForgotPasswordForm(values: ForgotPasswordFormState): ForgotPasswordFormErrors {
  const errors: ForgotPasswordFormErrors = {};

  if (!isRequired(values.email)) {
    errors.email = 'Email is required.';
  } else if (!isEmail(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  return errors;
}

function ForgotPasswordPageContent() {
  const [form, setForm] = useState<ForgotPasswordFormState>({ email: '' });
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForgotPasswordForm(form);
    setErrors(nextErrors);
    setFormError('');
    setStatusMessage('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await requestCustomerPasswordReset({
        email: form.email,
      });
      setStatusMessage(successMessage);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to submit your password reset request right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerPageShell maxWidth="720px">
      <CustomerPageHeader
        sectionLabel="Customer Account"
        title="Forgot Password"
        description="Enter your email address and we will send password reset instructions if an account is registered for it."
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
            disabled={isSubmitting}
          />

          {statusMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {statusMessage}
            </div>
          ) : null}

          {formError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          ) : null}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Sending Instructions...' : 'Send Reset Instructions'}
          </Button>
        </form>

        <div className="mt-6 text-sm text-neutral-600">
          Remembered your password?{' '}
          <Link to={ROUTES.LOGIN} className="font-medium text-neutral-900 underline-offset-4 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </CustomerPageShell>
  );
}

export function ForgotPasswordPage() {
  return (
    <NavigationThemeProvider theme="dark">
      <ForgotPasswordPageContent />
    </NavigationThemeProvider>
  );
}
