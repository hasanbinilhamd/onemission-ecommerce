interface LoadingSkeletonProps {
  className?: string;
  rows?: number;
}

export function LoadingSkeleton({ className = '', rows = 1 }: LoadingSkeletonProps) {
  return (
    <div className="animate-pulse space-y-3" aria-hidden="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`rounded bg-neutral-200 ${className || 'h-4 w-full'}`}
        />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="mb-3 aspect-square rounded-lg bg-neutral-200" />
      <div className="mb-2 h-4 w-3/4 rounded bg-neutral-200" />
      <div className="h-4 w-1/2 rounded bg-neutral-200" />
    </div>
  );
}
