import { Button } from '../components/shared/Button';
import { ROUTES } from '../app/config/routes';
import { TopBackNavigation } from '../features/navigation';

export function NotFound() {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <TopBackNavigation label="Back to Home" fallbackTo={ROUTES.HOME} />
      <p className="mb-2 text-sm font-medium uppercase tracking-widest text-neutral-400">
        404
      </p>
      <h1 className="mb-4 text-3xl font-bold text-neutral-900">Page not found</h1>
      <p className="mb-8 max-w-sm text-sm text-neutral-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button onClick={handleGoHome}>Go to Home</Button>
    </div>
  );
}
