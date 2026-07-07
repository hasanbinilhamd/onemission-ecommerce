import { ArrowLeft, KeyRound, Save } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../app/config/routes';
import { Button, Input, LoadingSkeleton } from '../components/shared';
import { CustomerPageHeader, CustomerPageShell, useAuthenticatedCustomer } from '../features/customer';
import { NavigationThemeProvider } from '../features/navigation';
import { changeCustomerPassword } from '../services/auth/customerAuthService';
import { isRequired } from '../utils/validation';

interface ChangePasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

function validatePasswordForm(values: ChangePasswordFormState): ChangePasswordErrors {
  const errors: ChangePasswordErrors = {};

  if (!isRequired(values.currentPassword)) {
    errors.currentPassword = 'Current Password is required.';
  }

  if (!isRequired(values.newPassword)) {
    errors.newPassword = 'New Password is required.';
  } else if (values.newPassword.length < 8) {
    errors.newPassword = 'New Password must be at least 8 characters.';
  }

  if (!isRequired(values.confirmPassword)) {
    errors.confirmPassword = 'Confirm Password is required.';
  } else if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = 'Confirm Password must match the new password.';
  }

  return errors;
}

function ChangePasswordPageContent() {
  const navigate = useNavigate();
  const { user, isLoading, errorMessage, getValidAccessToken } = useAuthenticatedCustomer();
  const [form, setForm] = useState<ChangePasswordFormState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<ChangePasswordErrors>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [isLoading, navigate, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validatePasswordForm(form);
    setErrors(nextErrors);
    setStatusMessage('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      return;
    }

    setIsSaving(true);

    try {
      await changeCustomerPassword({
        accessToken,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setStatusMessage('Password updated successfully. Other active sessions were invalidated where supported.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to change your password right now.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <CustomerPageShell maxWidth="760px">
        <CustomerPageHeader
          sectionLabel="My Account"
          title="Change Password"
          description="Update your account password securely."
        />
        <div className="rounded-3xl border border-neutral-200 bg-white p-6">
          <LoadingSkeleton rows={5} />
        </div>
      </CustomerPageShell>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <CustomerPageShell maxWidth="760px">
      <CustomerPageHeader
        sectionLabel="My Account"
        title="Change Password"
        description="Choose a strong password to keep your customer account secure."
        action={
          <Button type="button" variant="ghost" size="sm" className="w-fit gap-2" onClick={() => navigate(ROUTES.ACCOUNT)}>
            <ArrowLeft size={16} />
            Back to Account
          </Button>
        }
      />

      {errorMessage ? (
        <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
            <KeyRound size={20} />
          </div>
          <div>
            <h2 className="m-0 text-xl font-semibold text-neutral-950">Password Security</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Changing your password helps keep your account protected across devices.
            </p>
          </div>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <Input
            label="Current Password"
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(event) => setForm((current) => ({ ...current, currentPassword: event.target.value }))}
            error={errors.currentPassword}
            disabled={isSaving}
          />
          <Input
            label="New Password"
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(event) => setForm((current) => ({ ...current, newPassword: event.target.value }))}
            error={errors.newPassword}
            disabled={isSaving}
          />
          <Input
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
            error={errors.confirmPassword}
            disabled={isSaving}
          />

          {statusMessage ? (
            <div className={`rounded-2xl px-4 py-3 text-sm ${statusMessage.toLowerCase().includes('successfully') ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'border border-red-200 bg-red-50 text-red-700'}`}>
              {statusMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isSaving} className="gap-2">
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </div>
    </CustomerPageShell>
  );
}

export function ChangePasswordPage() {
  return (
    <NavigationThemeProvider theme="dark">
      <ChangePasswordPageContent />
    </NavigationThemeProvider>
  );
}
