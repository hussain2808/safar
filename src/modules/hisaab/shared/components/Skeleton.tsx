import { cn } from '@/modules/hisaab/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('shimmer rounded-icon', className)} />;
}

export function BookCardSkeleton() {
  return (
    <div className="bg-bg-card rounded-card shadow-card p-5 flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-icon flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-6 w-24 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
    </div>
  );
}

export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-4 px-4">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
      <Skeleton className="h-5 w-20 rounded" />
    </div>
  );
}
