import { KeyRound, Save } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../app/config/routes';
import { Button, Input, LoadingSkeleton } from '../components/shared';
import { useAuthenticatedCustomer } from '../features/customer';
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

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, isLoading, errorMessage, getValidAccessToken } = useAuthenticatedCustomer();
  const [form, setForm] = useState<ChangePasswordFormState>({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
    if (Object.keys(nextErrors).length > 0) return;

    const accessToken = await getValidAccessToken();
    if (!accessToken) return;

    setIsSaving(true);
    try {
      await changeCustomerPassword({
        accessToken,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setStatusMessage('Password updated successfully. Other active sessions were invalidated.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to change your password right now.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  if (!user) return null;

  const passwordStrength = getPasswordStrength(form.newPassword);

  return (
    <div className="space-y-6">
      <div>
        <p className="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-neutral-400">Change Password</p>
        <h2 className="mt-2 text-2xl font-semibold text-neutral-950">Security Settings</h2>
        <p className="mt-2 text-sm leading-7 text-neutral-500">Choose a strong password to protect your customer account across devices.</p>
      </div>

      {errorMessage ? <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{errorMessage}</div> : null}

      <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
            <KeyRound size={20} />
          </div>
          <div>
            <h3 className="m-0 text-xl font-semibold text-neutral-950">Password Security</h3>
            <p className="mt-1 text-sm text-neutral-500">Changing your password will invalidate every other active session.</p>
          </div>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <Input label="Current Password" type="password" autoComplete="current-password" value={form.currentPassword} onChange={(event) => setForm((current) => ({ ...current, currentPassword: event.target.value }))} error={errors.currentPassword} disabled={isSaving} />
          <div className="grid gap-3">
            <Input label="New Password" type="password" autoComplete="new-password" value={form.newPassword} onChange={(event) => setForm((current) => ({ ...current, newPassword: event.target.value }))} error={errors.newPassword} disabled={isSaving} />
            <div className="grid gap-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div className={`h-full rounded-full transition-all ${passwordStrength.tone}`} style={{ width: passwordStrength.width }} />
              </div>
              <p className="m-0 text-xs font-medium text-neutral-500">Strength: {passwordStrength.label}</p>
            </div>
          </div>
          <Input label="Confirm Password" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))} error={errors.confirmPassword} disabled={isSaving} />

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
    </div>
  );
}
