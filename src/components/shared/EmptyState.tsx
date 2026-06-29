import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 text-neutral-400">{icon}</div>}
      <h3 className="mb-1 text-base font-semibold text-neutral-900">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-neutral-500">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
