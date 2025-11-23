export function GroupSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border bg-card p-6">
      <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-muted rounded w-full mb-2"></div>
      <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
    </div>
  );
}

