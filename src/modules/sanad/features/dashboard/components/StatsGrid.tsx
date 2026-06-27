import { Files, ShieldCheck, CalendarClock, AlertCircle } from 'lucide-react';
import { cn } from '@/modules/sanad/lib/utils';

interface StatsGridProps {
  stats: {
    total: number;
    valid: number;
    expiringSoon: number;
    expired: number;
  };
}

const CELLS = [
  { key: 'total', label: 'Total Documents', caption: 'All your documents', icon: Files, bg: 'bg-accent-blue-bg', fg: 'text-accent-blue-fg' },
  { key: 'valid', label: 'Valid Documents', caption: 'Currently valid', icon: ShieldCheck, bg: 'bg-accent-green-bg', fg: 'text-accent-green-fg' },
  { key: 'expiringSoon', label: 'Expiring Soon', caption: 'Next 90 days', icon: CalendarClock, bg: 'bg-accent-orange-bg', fg: 'text-accent-orange-fg' },
  { key: 'expired', label: 'Expired', caption: 'Need attention', icon: AlertCircle, bg: 'bg-accent-pink-bg', fg: 'text-accent-pink-fg' },
] as const;

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="px-4">
      <div className="bg-card-bg rounded-card shadow-card flex divide-x divide-card-border">
        {CELLS.map(({ key, label, caption, icon: Icon, bg, fg }) => (
          <div key={key} className="flex-1 min-w-0 p-3 flex flex-col items-center text-center">
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center mb-2', bg, fg)}>
              <Icon size={14} strokeWidth={1.5} />
            </div>
            <p className="text-[18px] font-semibold text-text-primary leading-none">{stats[key]}</p>
            <p className="text-[10.5px] text-text-primary mt-1.5 leading-tight">{label}</p>
            <p className="text-[9px] text-text-secondary mt-0.5 leading-tight">{caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
