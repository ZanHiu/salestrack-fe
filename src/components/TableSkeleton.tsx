import { Skeleton } from '@/components/ui/skeleton';

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="border border-border rounded-md bg-card shadow-card p-3 space-y-2 h-full">
      <Skeleton className="h-8 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-2">
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-6 flex-1" />
        </div>
      ))}
    </div>
  );
}
