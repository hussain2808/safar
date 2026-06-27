import { cn } from '@/modules/sanad/lib/utils';
import type { DocumentStatus } from '@/modules/sanad/types';

interface StatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (status === 'valid' || status === 'none') return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium',
        status === 'expired' ? 'bg-accent-pink-bg text-accent-pink-fg' : 'bg-accent-orange-bg text-accent-orange-fg',
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', status === 'expired' ? 'bg-accent-pink-fg' : 'bg-accent-orange-fg')} />
      {status === 'expired' ? 'Expired' : 'Expiring soon'}
    </span>
  );
}
