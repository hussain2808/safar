import { cn } from '@/modules/dua/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('shimmer rounded-icon', className)} />;
}

export function DuaRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-4 px-4">
      <Skeleton className="w-10 h-10 rounded-icon flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
    </div>
  );
}
