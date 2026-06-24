import { cn } from '@/modules/amaanat/lib/utils';
import type { WarrantyStatus } from '@/modules/amaanat/types';

interface WarrantyBadgeProps {
  status: WarrantyStatus;
  className?: string;
}

export function WarrantyBadge({ status, className }: WarrantyBadgeProps) {
  if (status === 'active' || status === 'none') return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium',
        status === 'expired' ? 'bg-accent-pink-bg text-accent-pink-fg' : 'bg-accent-orange-bg text-accent-orange-fg',
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', status === 'expired' ? 'bg-accent-pink-fg' : 'bg-accent-orange-fg')} />
      {status === 'expired' ? 'Warranty expired' : 'Warranty expiring soon'}
    </span>
  );
}
