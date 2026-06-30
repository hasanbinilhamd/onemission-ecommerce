import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Select({
  label,
  error,
  hint,
  className = '',
  id,
  children,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const labelSlug = label?.toLowerCase().replace(/\s+/g, '-') ?? 'select';
  const selectId = id ?? `${labelSlug}-${generatedId}`;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId ?? hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={error ? true : ariaInvalid}
        aria-describedby={describedBy}
        className={`w-full rounded border bg-white px-3 py-2 text-sm text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-black disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-red-500 focus:ring-red-500' : 'border-neutral-300'} ${className}`}
        {...props}
      >
        {children}
      </select>
      {hint && !error && (
        <p id={hintId} className="text-xs text-neutral-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
